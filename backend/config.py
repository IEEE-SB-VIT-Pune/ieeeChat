import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
    MODEL = os.getenv("MODEL")
    EMBED_MODEL = os.getenv("EMBED_MODEL")