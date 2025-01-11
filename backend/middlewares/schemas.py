from typing import Optional, Any

from pydantic import BaseModel


class ResponseWrapper(BaseModel):
    data: Optional[Any] = None
    success: bool
    error: Optional[str] = None
