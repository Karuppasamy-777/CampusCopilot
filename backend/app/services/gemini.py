import os
import logging
from typing import Optional, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# Apply the API key to the environment so google-adk / Gemini clients resolve it automatically
if settings.GEMINI_API_KEY:
    os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
    # google-adk can also resolve from other standard env vars
    os.environ["GEMINI_API_KEY"] = settings.GEMINI_API_KEY
    os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY

class GeminiAgentManager:
    def __init__(self) -> None:
        self._adk_available = False
        try:
            # Check if google-adk is installed
            import google.adk
            self._adk_available = True
        except ImportError:
            logger.warning(
                "google-adk package is not installed. Agent creation will run in placeholder mode."
            )

    @property
    def is_available(self) -> bool:
        return self._adk_available

    def create_agent(
        self,
        name: str,
        instruction: str,
        model: str = "gemini-2.5-flash",
        tools: Optional[list] = None,
    ) -> Any:
        """
        Creates and returns a google-adk Agent.
        If google-adk is not installed, returns a MockAgent for local development.
        """
        if self._adk_available:
            from google.adk import Agent
            logger.info(f"Initializing Google ADK Agent: '{name}' using model '{model}'")
            return Agent(
                name=name,
                model=model,
                instruction=instruction,
                # Add tools if provided
            )
        else:
            logger.warning(
                f"Returning MockAgent for '{name}'. To use actual agents, install google-adk."
            )
            return MockAgent(name=name, instruction=instruction, model=model)

class MockAgent:
    """Mock Agent class to allow runtime execution without google-adk installed."""
    def __init__(self, name: str, instruction: str, model: str) -> None:
        self.name = name
        self.instruction = instruction
        self.model = model

    def run(self, prompt: str, **kwargs: Any) -> str:
        logger.info(f"[Mock Agent '{self.name}'] Received prompt: {prompt}")
        return f"Mock response from agent '{self.name}' (Model: {self.model})."

# Global manager instance
agent_manager = GeminiAgentManager()
