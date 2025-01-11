from pydantic import BaseModel


class Channel(BaseModel):
    id: str
    name: str
    position: int


class Category(Channel):
    pass


class User(BaseModel):
    id: str
    name: str
