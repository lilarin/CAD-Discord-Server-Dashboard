from typing import Optional, Any

from pydantic import BaseModel, Field


class ResponseWrapper(BaseModel):
    data: Optional[Any] = None
    success: bool
    error: Optional[str] = None


class BaseChannel(BaseModel):
    id: str
    position: int


class Category(BaseChannel):
    name: str


class Channel(BaseChannel):
    name: str
    type: str


class User(BaseModel):
    id: str
    name: str = Field(max_length=32)
    group: Optional[str] = None
    is_admin: Optional[bool] = None


class BaseRole(BaseModel):
    id: str


class Role(BaseRole):
    name: str


class NameRequestBody(BaseModel):
    name: str


class PositionRequestBody(BaseModel):
    position: int


class LogSchema(BaseModel):
    user_name: str
    action: str
    event_time: str


class QueueRequestBody(BaseModel):
    channel_id: str
    title: str
    event_time: str


class ServerLanguageRequestBody(BaseModel):
    language: str


class RegistrationRequestBody(BaseModel):
    channel_id: Optional[str] = None
    channel_name: Optional[str] = None


class StaffCategoryRequestBody(BaseModel):
    category_id: Optional[str] = None
    category_name: Optional[str] = None


class ServerConfig(BaseModel):
    language: Optional[str] = None
    registration_channel_id: Optional[str] = None
    staff_category_id: Optional[str] = None
    staff_info_channel_id: Optional[str] = None
