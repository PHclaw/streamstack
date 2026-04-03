"""
Video Processing Engine for StreamStack
Handles video encoding, effects, and export using ffmpeg
"""

import subprocess
import os
import json
import asyncio
from typing import Optional
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class VideoProcessor:
    """
    FFmpeg-based video processor for StreamStack.
    Handles encoding, effects, and format conversion.
    """

    def __init__(self, ffmpeg_path: Optional[str] = None):
        self.ffmpeg_path = ffmpeg_path or self._find_ffmpeg()
        self.supported_formats = ["mp4", "webm", "gif"]
        self.presets = {
            "ultrafast": "-preset ultrafast",
            "fast": "-preset fast",
            "medium": "-preset medium",
            "slow": "-preset slow",
        }

    def _find_ffmpeg(self) -> str:
        """Find ffmpeg in system PATH"""
        import shutil
        ffmpeg = shutil.which("ffmpeg")
        if ffmpeg:
            return ffmpeg
        # Check common locations
        common_paths = [
            "C:\\ffmpeg\\bin\\ffmpeg.exe",
            "/usr/local/bin/ffmpeg",
            "/usr/bin/ffmpeg",
        ]
        for path in common_paths:
            if os.path.exists(path):
                return path
        raise FileNotFoundError(
            "ffmpeg not found. Please install ffmpeg and add it to PATH."
        )

    def _run_ffmpeg(self, args: list[str]) -> tuple[bool, str]:
        """Run ffmpeg command and return result"""
        cmd = [self.ffmpeg_path, "-y"] + args
        logger.info(f"Running ffmpeg: {' '.join(cmd)}")

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=3600
            )
            if result.returncode != 0:
                logger.error(f"ffmpeg error: {result.stderr}")
                return False, result.stderr
            return True, result.stdout
        except subprocess.TimeoutExpired:
            return False, "ffmpeg timeout (>1 hour)"
        except Exception as e:
            return False, str(e)

    async def encode(
        self,
        input_path: str,
        output_path: str,
        format: str = "mp4",
        resolution: str = "1080p",
        quality: str = "medium",
        audio_path: Optional[str] = None,
    ) -> dict:
        """
        Encode video with specified parameters.

        Args:
            input_path: Input video file
            output_path: Output video file
            format: Output format (mp4/webm/gif)
            resolution: Target resolution (480p/720p/1080p/4k)
            quality: Encoding preset (ultrafast/fast/medium/slow)
            audio_path: Optional audio track to merge

        Returns:
            dict with success status and output path
        """
        # Resolution mappings
        resolutions = {
            "480p": ("854", "480"),
            "720p": ("1280", "720"),
            "1080p": ("1920", "1080"),
            "4k": ("3840", "2160"),
        }

        width, height = resolutions.get(resolution, resolutions["1080p"])

        # Build ffmpeg command
        args = []

        # Input
        args.extend(["-i", input_path])

        # Audio input (if provided)
        if audio_path:
            args.extend(["-i", audio_path])

        # Video filters
        args.extend([
            "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2"
        ])

        # Format-specific encoding
        if format == "mp4":
            args.extend([
                "-c:v", "libx264",
                "-c:a", "aac",
                "-b:a", "192k",
                self.presets.get(quality, ""),
                "-movflags", "+faststart",
            ])
        elif format == "webm":
            args.extend([
                "-c:v", "libvpx-vp9",
                "-c:a", "libopus",
                "-b:a", "128k",
                "-crf", "30",
            ])
        elif format == "gif":
            args.extend([
                "-vf", f"scale={width}:-1:flags=lanczos,fps=15,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse",
                "-loop", "0",
            ])

        # Output
        args.append(output_path)

        # Run in thread pool
        loop = asyncio.get_event_loop()
        success, message = await loop.run_in_executor(
            None, lambda: self._run_ffmpeg(args)
        )

        return {
            "success": success,
            "output_path": output_path if success else None,
            "error": message if not success else None,
        }

    async def add_zoom_effects(
        self,
        input_path: str,
        output_path: str,
        zoom_segments: list[dict],
    ) -> dict:
        """
        Add zoom effects to video.

        Args:
            input_path: Input video file
            output_path: Output video file
            zoom_segments: List of zoom segments with timing and scale

        Returns:
            dict with success status
        """
        # Build complex filter for zoom effects
        # Example: zoompan=z='min(zoom+0.0015,1.5)':x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2)
        filters = []

        for seg in zoom_segments:
            start = seg.get("startTime", 0)
            end = seg.get("endTime", 5)
            scale = seg.get("scale", 1.5)
            x = seg.get("x", 0.5)
            y = seg.get("y", 0.5)

            # Create zoompan filter for this segment
            filter_str = (
                f"zoompan=z='if(between(t,{start},{end}),"
                f"min(max(zoom,{scale}),{scale}),1)':"
                f"x=iw*{x}:y=ih*{y}:"
                f"d=1:s=iw*ih:fps=30"
            )
            filters.append(filter_str)

        args = [
            "-i", input_path,
            "-vf", ",".join(filters) if filters else "null",
            "-c:v", "libx264",
            "-c:a", "copy",
            output_path
        ]

        loop = asyncio.get_event_loop()
        success, message = await loop.run_in_executor(
            None, lambda: self._run_ffmpeg(args)
        )

        return {
            "success": success,
            "output_path": output_path if success else None,
            "error": message if not success else None,
        }

    async def extract_audio(
        self,
        video_path: str,
        audio_path: str,
        format: str = "mp3",
    ) -> dict:
        """Extract audio track from video"""
        args = [
            "-i", video_path,
            "-vn",  # No video
            "-acodec", "libmp3lame" if format == "mp3" else "copy",
            "-ab", "192k",
            audio_path
        ]

        loop = asyncio.get_event_loop()
        success, message = await loop.run_in_executor(
            None, lambda: self._run_ffmpeg(args)
        )

        return {
            "success": success,
            "audio_path": audio_path if success else None,
            "error": message if not success else None,
        }

    async def get_video_info(self, video_path: str) -> dict:
        """Get video metadata using ffprobe"""
        ffprobe_path = self.ffmpeg_path.replace("ffmpeg", "ffprobe")

        cmd = [
            ffprobe_path,
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            video_path
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            info = json.loads(result.stdout)

            # Extract relevant info
            video_stream = next(
                (s for s in info.get("streams", []) if s["codec_type"] == "video"),
                {}
            )
            audio_stream = next(
                (s for s in info.get("streams", []) if s["codec_type"] == "audio"),
                {}
            )

            return {
                "success": True,
                "data": {
                    "duration": float(info.get("format", {}).get("duration", 0)),
                    "width": int(video_stream.get("width", 0)),
                    "height": int(video_stream.get("height", 0)),
                    "fps": eval(video_stream.get("r_frame_rate", "0/1")),
                    "video_codec": video_stream.get("codec_name"),
                    "audio_codec": audio_stream.get("codec_name"),
                    "file_size": int(info.get("format", {}).get("size", 0)),
                }
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def create_thumbnail(
        self,
        video_path: str,
        output_path: str,
        timestamp: float = 0,
    ) -> dict:
        """Create thumbnail from video at specified timestamp"""
        args = [
            "-i", video_path,
            "-ss", str(timestamp),
            "-vframes", "1",
            "-q:v", "2",
            output_path
        ]

        loop = asyncio.get_event_loop()
        success, message = await loop.run_in_executor(
            None, lambda: self._run_ffmpeg(args)
        )

        return {
            "success": success,
            "thumbnail_path": output_path if success else None,
            "error": message if not success else None,
        }

    async def add_watermark(
        self,
        video_path: str,
        watermark_path: str,
        output_path: str,
        position: str = "bottom-right",
        opacity: float = 0.7,
    ) -> dict:
        """Add watermark overlay to video"""
        positions = {
            "top-left": "10:10",
            "top-right": "W-w-10:10",
            "bottom-left": "10:H-h-10",
            "bottom-right": "W-w-10:H-h-10",
            "center": "(W-w)/2:(H-h)/2",
        }

        overlay_pos = positions.get(position, positions["bottom-right"])

        args = [
            "-i", video_path,
            "-i", watermark_path,
            "-filter_complex",
            f"[1:v]format=rgba,colorchannelmixer=aa={opacity}[wm];"
            f"[0:v][wm]overlay={overlay_pos}",
            "-c:a", "copy",
            output_path
        ]

        loop = asyncio.get_event_loop()
        success, message = await loop.run_in_executor(
            None, lambda: self._run_ffmpeg(args)
        )

        return {
            "success": success,
            "output_path": output_path if success else None,
            "error": message if not success else None,
        }
