import json
from typing import Dict, Optional

from backend.config import config


class TranslationService:
    def __init__(self):
        self._translations: Dict[str, dict] = {}
        self._load_translations()

    def _load_translations(self):
        for locale in config.locales:
            with open(f"{config.locales_path}/{locale}.json", "r", encoding="utf-8") as f:
                self._translations[locale] = json.load(f)

    def translate(self, key: str, locale: str = None) -> Optional[str]:
        result = self._translations[locale]
        for k in key.split("."):
            result = result[k]
        if isinstance(result, str):
            return result
