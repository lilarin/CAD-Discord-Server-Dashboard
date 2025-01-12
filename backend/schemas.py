from pydantic import BaseModel


class BaseChannel(BaseModel):
    id: str
    position: int


class Channel(BaseChannel):
    name: str


class User(BaseModel):
    id: str
    name: str


class Role(BaseModel):
    id: str
    name: str
