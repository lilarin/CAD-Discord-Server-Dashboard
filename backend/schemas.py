from pydantic import BaseModel


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
    name: str


class BaseRole(BaseModel):
    id: str


class Role(BaseRole):
    name: str
