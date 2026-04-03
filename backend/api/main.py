"""
StreamStack Backend API
AI-powered TTS, STT, and script generation services.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
import asyncio
import os
import uuid
import subprocess
import torch

app = FastAPI(
    title="StreamStack API",
    description="AI-powered screen recording post-production API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Device config
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[StreamStack] Using device: {DEVICE}")


# ─────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=10000)
    voice: str = Field(default="default", description="Voice style ID")
    language: str = Field(default="en", description="Language code (en, zh, etc.)")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)
    output_format: str = Field(default="mp3")


class ASRRequest(BaseModel):
    audio_path: str
    language: Optional[str] = None  # Auto-detect if None
    timestamps: bool = True
    speaker_labels: bool = True


class ScriptRequest(BaseModel):
    screen_description: str = Field(..., description="Describe what's shown on screen")
    tone: str = Field(default="professional", description="professional | casual | enthusiastic | technical")
    duration_seconds: int = Field(default=60, ge=10, le=600)
    language: str = Field(default="en")


class VideoProcessRequest(BaseModel):
    video_path: str
    operations: list[dict]  # [{type: "zoom", time: 1.5, scale: 1.5}, ...]


# ─────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "device": DEVICE,
        "gpu": torch.cuda.is_available(),
        "version": "1.0.0",
    }


# ─────────────────────────────────────────────
# TTS Endpoints
# ─────────────────────────────────────────────

@app.post("/api/tts/vibevoice")
async def tts_vibevoice(req: TTSRequest):
    """Generate speech using VibeVoice TTS"""
    try:
        from tts.vibevoice_engine import VibeVoiceEngine
        engine = VibeVoiceEngine(device=DEVICE)
        output_path = f"/tmp/tts_{uuid.uuid4().hex}.mp3"
        result = await engine.synthesize(
            text=req.text,
            voice=req.voice,
            language=req.language,
            speed=req.speed,
            output_path=output_path,
        )
        return FileResponse(result, media_type="audio/mpeg", filename="output.mp3")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@app.post("/api/tts/bark")
async def tts_bark(req: TTSRequest):
    """Generate speech using Bark (offline, open-source)"""
    try:
        from tts.bark_engine import BarkEngine
        engine = BarkEngine()
        output_path = f"/tmp/tts_{uuid.uuid4().hex}.mp3"
        result = await engine.synthesize(
            text=req.text,
            voice=req.voice,
            speed=req.speed,
            output_path=output_path,
        )
        return FileResponse(result, media_type="audio/mpeg", filename="output.mp3")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bark TTS failed: {str(e)}")


# ─────────────────────────────────────────────
# ASR / Transcription
# ─────────────────────────────────────────────

@app.post("/api/asr/transcribe")
async def asr_transcribe(req: ASRRequest):
    """Transcribe audio using VibeVoice-ASR"""
    try:
        from stt.vibevoice_asr import VibeVoiceASR
        model = VibeVoiceASR(device=DEVICE)
        result = await model.transcribe(
            audio_path=req.audio_path,
            language=req.language,
            return_timestamps=req.timestamps,
            return_speakers=req.speaker_labels,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ASR failed: {str(e)}")


# ─────────────────────────────────────────────
# Script Generation
# ─────────────────────────────────────────────

@app.post("/api/script/generate")
async def script_generate(req: ScriptRequest):
    """Generate demo narration script using AI"""
    try:
        from script.generator import ScriptGenerator
        generator = ScriptGenerator()
        result = await generator.generate(
            screen_description=req.screen_description,
            tone=req.tone,
            duration_seconds=req.duration_seconds,
            language=req.language,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Script generation failed: {str(e)}")


# ─────────────────────────────────────────────
# Video Processing
# ─────────────────────────────────────────────

@app.post("/api/video/process")
async def video_process(req: VideoProcessRequest):
    """Process video with effects (zoom, pan, crop, etc.)"""
    try:
        from video.processor import VideoProcessor
        processor = VideoProcessor()
        output_path = f"/tmp/processed_{uuid.uuid4().hex}.mp4"
        result = await processor.process(req.video_path, req.operations, output_path)
        return FileResponse(result, media_type="video/mp4", filename="output.mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video processing failed: {str(e)}")


@app.post("/api/video/merge")
async def video_merge(audio_path: str, video_path: str):
    """Merge audio with video"""
    try:
        output_path = f"/tmp/merged_{uuid.uuid4().hex}.mp4"
        cmd = [
            "ffmpeg", "-y",
            "-i", video_path, "-i", audio_path,
            "-c:v", "copy", "-c:a", "aac",
            "-shortest", output_path
        ]
        subprocess.run(cmd, check=True, capture_output=True)
        return FileResponse(output_path, media_type="video/mp4", filename="merged.mp4")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video merge failed: {str(e)}")


# ─────────────────────────────────────────────
# Model Management
# ─────────────────────────────────────────────

@app.get("/api/models/status")
async def models_status():
    """Check which AI models are loaded"""
    return {
        "device": DEVICE,
        "gpu_available": torch.cuda.is_available(),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        "models": {
            "vibevoice_tts": os.path.exists("backend/tts/vibevoice_engine.py"),
            "vibevoice_asr": os.path.exists("backend/stt/vibevoice_asr.py"),
            "bark": os.path.exists("backend/tts/bark_engine.py"),
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
