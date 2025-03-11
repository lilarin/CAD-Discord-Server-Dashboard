from typing import Optional

from pydantic import BaseModel, Field


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
    is_admin: bool


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
    user_avatar: str
    action: str
    event_time: str


class QueueRequestBody(BaseModel):
    channel_id: str
    title: str
    event_time: str
