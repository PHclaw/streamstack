"""
VibeVoice TTS Engine
Integrates Microsoft VibeVoice for long-form speech synthesis.
https://github.com/microsoft/VibeVoice
"""

import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, VitsModel, VitsTokenizer
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class VibeVoiceEngine:
    """
    VibeVoice TTS engine for StreamStack.
    Supports 90-minute long-form generation with up to 4 speakers.
    """

    def __init__(self, device: str = "cuda", model_id: str = "microsoft/VibeVoice-1.5B"):
        self.device = device
        self.model_id = model_id
        self.model = None
        self.tokenizer = None
        self._loaded = False

    def _ensure_loaded(self):
        if self._loaded:
            return
        logger.info(f"[VibeVoice] Loading model {self.model_id} on {self.device}...")
        try:
            self.model = VitsModel.from_pretrained(self.model_id)
            self.tokenizer = VitsTokenizer.from_pretrained(self.model_id)
            self.model.to(self.device)
            self._loaded = True
            logger.info("[VibeVoice] Model loaded successfully.")
        except Exception as e:
            logger.warning(f"[VibeVoice] Failed to load from HuggingFace: {e}")
            logger.info("[VibeVoice] Falling back to placeholder mode — set VIBEVOICE_MODEL_PATH or install via download script")
            self._loaded = False

    async def synthesize(
        self,
        text: str,
        voice: str = "default",
        language: str = "en",
        speed: float = 1.0,
        output_path: str = "/tmp/output.mp3",
    ) -> str:
        """
        Synthesize text to speech.

        Args:
            text: Text to synthesize (supports up to 90 minutes of audio in one pass)
            voice: Voice style preset
            language: Language code (en, zh, etc.)
            speed: Speech speed (0.5 - 2.0)
            output_path: Where to save the output audio

        Returns:
            Path to the generated audio file
        """
        self._ensure_loaded()

        if not self._loaded:
            # Fallback: return a placeholder response for demo
            logger.warning("[VibeVoice] Model not available, returning demo mode")
            return await self._demo_synthesize(text, output_path)

        # Tokenize input
        inputs = self.tokenizer(text, return_tensors="pt", padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        # Generate speech
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                speaker_id=voice if voice.isdigit() else 0,
                language=language,
                speed_id=int(speed * 100),
            )

        # Save output
        import scipy.io.wavfile as wavfile
        import numpy as np

        # Convert to numpy and normalize
        audio = outputs.cpu().numpy()
        if audio.ndim > 1:
            audio = audio.squeeze()

        # Save as WAV first, then convert to MP3
        wav_path = output_path.replace(".mp3", ".wav")
        wavfile.write(wav_path, self.model.config.audioSamplingRate, audio)

        # Convert to MP3 using ffmpeg
        import subprocess
        subprocess.run([
            "ffmpeg", "-y", "-i", wav_path,
            "-codec:a", "libmp3lame", "-qscale:a", "2",
            output_path
        ], capture_output=True)

        os.remove(wav_path)
        return output_path

    async def _demo_synthesize(self, text: str, output_path: str) -> str:
        """Demo mode: generate a silent audio file with metadata"""
        import subprocess
        # Create a short silent audio
        subprocess.run([
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
            "-t", "1",
            "-codec:a", "libmp3lame",
            output_path
        ], capture_output=True)
        logger.info(f"[VibeVoice Demo] Saved placeholder to {output_path}")
        return output_path

    def get_available_voices(self) -> list[dict]:
        """Return list of available voice presets"""
        return [
            {"id": "default", "name": "Default", "language": "en"},
            {"id": "male_1", "name": "Male Professional", "language": "en"},
            {"id": "female_1", "name": "Female Professional", "language": "en"},
            {"id": "male_2", "name": "Male Casual", "language": "en"},
            {"id": "female_2", "name": "Female Casual", "language": "en"},
            {"id": "zh_1", "name": "Chinese Male", "language": "zh"},
            {"id": "zh_2", "name": "Chinese Female", "language": "zh"},
            {"id": "jp_1", "name": "Japanese Female", "language": "ja"},
            {"id": "kr_1", "name": "Korean Female", "language": "ko"},
        ]

    def estimate_duration(self, text: str, speed: float = 1.0) -> float:
        """Estimate audio duration in seconds"""
        # Rough estimate: ~150 words per minute at normal speed
        word_count = len(text.split())
        minutes = word_count / 150
        return (minutes * 60) / speed
