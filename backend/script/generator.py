"""
AI Script Generator for StreamStack
Generates narration scripts from screen descriptions.
"""

import os
import asyncio
import logging
from typing import Optional

logger = logging.getLogger(__name__)


SCRIPT_TEMPLATES = {
    "professional": {
        "en": (
            "Welcome to this demonstration. Today, we'll walk you through {topic}. "
            "As you can see on screen, {description}. "
            "Let's get started by looking at the main interface. "
            "The key feature here is {feature}. "
            "To use this, simply {action}. "
            "In conclusion, {conclusion}. "
            "Thank you for watching."
        ),
        "zh": (
            "欢迎观看本次演示。今天我们将向您展示{topic}。"
            "如您在屏幕上看到的，{description}。"
            "让我们从主界面开始。"
            "这里的关键功能是{feature}。"
            "使用方法很简单，只需{action}。"
            "总之，{conclusion}。"
            "感谢观看。"
        ),
    },
    "casual": {
        "en": (
            "Hey everyone! So today's video is all about {topic}. "
            "Look at this — {description}. Pretty cool, right? "
            "The best part? {feature}. "
            "Here's how you do it: {action}. "
            "That's it! {conclusion}. "
            "Let me know what you think!"
        ),
        "zh": (
            "大家好！今天的视频是关于{topic}的。"
            "看看这个——{description}。很酷对吧？"
            "最棒的是：{feature}。"
            "操作方法：{action}。"
            "就这样！{conclusion}。"
            "有什么想法欢迎留言！"
        ),
    },
    "enthusiastic": {
        "en": (
            "Wow, look at this! This is {topic}, and it's absolutely incredible! "
            "Check this out — {description}! "
            "I'm so excited about {feature}! "
            "Watch this: {action} — boom! Done! "
            "This is going to change everything. {conclusion}! "
            "Don't forget to like and subscribe!"
        ),
        "zh": (
            "哇，快看这个！这是{topic}，简直太棒了！"
            "看看这个——{description}！"
            "{feature}让我超级兴奋！"
            "看好了：{action}——搞定！"
            "这将改变一切。{conclusion}！"
            "记得点赞并订阅！"
        ),
    },
    "technical": {
        "en": (
            "In this technical overview, we'll examine {topic}. "
            "The screen shows {description}. "
            "The implementation uses {feature}. "
            "The workflow is as follows: {action}. "
            "Architecture notes: {conclusion}."
        ),
        "zh": (
            "在本次技术概述中，我们将探讨{topic}。"
            "屏幕上展示的是{description}。"
            "实现使用了{feature}。"
            "工作流程如下：{action}。"
            "架构说明：{conclusion}。"
        ),
    },
}


class ScriptGenerator:
    """
    Generates demo narration scripts using AI.
    Falls back to templates when no API key is available.
    """

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        self.model = "gpt-4" if self.api_key else None

    async def generate(
        self,
        screen_description: str,
        tone: str = "professional",
        duration_seconds: int = 60,
        language: str = "en",
    ) -> dict:
        """
        Generate a narration script from screen description.

        Args:
            screen_description: What appears on screen
            tone: Script tone (professional/casual/enthusiastic/technical)
            duration_seconds: Target narration duration
            language: Script language (en/zh)

        Returns:
            dict with script text, estimated duration, word count
        """
        logger.info(f"[ScriptGenerator] Generating {tone} script in {language}")

        # Estimate words needed (~150 wpm)
        target_words = int(duration_seconds * 150 / 60)

        if self.api_key:
            return await self._generate_with_ai(
                screen_description, tone, target_words, language
            )
        else:
            return await self._generate_from_template(
                screen_description, tone, target_words, language
            )

    async def _generate_with_ai(
        self, description: str, tone: str, target_words: int, language: str
    ) -> dict:
        """Use GPT-4/Claude to generate a script"""
        import httpx

        system_prompt = (
            f"You are a professional demo script writer. "
            f"Write a {tone} narration script in {language}. "
            f"Target word count: ~{target_words} words. "
            f"Only output the script, no explanations."
        )

        user_prompt = f"Screen description:\n{description}\n\nWrite the narration script:"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt},
                        ],
                        "max_tokens": 1000,
                        "temperature": 0.8,
                    },
                )
                result = response.json()
                script = result["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"[ScriptGenerator] AI API failed: {e}, falling back to template")
            return await self._generate_from_template(description, tone, target_words, language)

        words = script.split()
        return {
            "script": script,
            "word_count": len(words),
            "estimated_duration_seconds": len(words) / 150 * 60,
            "tone": tone,
            "language": language,
        }

    async def _generate_from_template(
        self, description: str, tone: str, target_words: int, language: str
    ) -> dict:
        """Fallback: use pre-built templates"""
        templates = SCRIPT_TEMPLATES.get(tone, SCRIPT_TEMPLATES["professional"])
        template = templates.get(language, templates["en"])

        # Fill template with parsed description
        script = template.format(
            topic=description.split(".")[0] if "." in description else description[:50],
            description=description,
            feature="intuitive design and smooth workflow",
            action="click the main button and follow the prompts",
            conclusion="this tool provides an excellent user experience",
        )

        words = script.split()
        return {
            "script": script,
            "word_count": len(words),
            "estimated_duration_seconds": round(len(words) / 150 * 60),
            "tone": tone,
            "language": language,
            "note": "Demo mode: set OPENAI_API_KEY or ANTHROPIC_API_KEY for AI-generated scripts",
        }

    def get_tone_options(self) -> list[dict]:
        return [
            {"id": "professional", "label": "Professional", "description": "Clean, formal, suitable for business demos"},
            {"id": "casual", "label": "Casual", "description": "Friendly, conversational, YouTube style"},
            {"id": "enthusiastic", "label": "Enthusiastic", "description": "High energy, exciting, promotional"},
            {"id": "technical", "label": "Technical", "description": "Detailed, developer-focused, precise"},
        ]
