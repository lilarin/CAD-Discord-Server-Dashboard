import json
from typing import Dict, Optional


class TranslationService:
    def __init__(self, locales: list, locales_path: str):
        self._translations: Dict[str, dict] = {}
        self.locales = locales
        self.locales_path = locales_path
        self._load_translations()

    def _load_translations(self):
        for locale in self.locales:
            with open(f"{self.locales_path}/{locale}.json", "r", encoding="utf-8") as f:
                self._translations[locale] = json.load(f)

    async def translate(self, key: str, locale: str = None) -> Optional[str]:
        result = self._translations[locale]
        for k in key.split("."):
            result = result[k]
        if isinstance(result, str):
            return result
