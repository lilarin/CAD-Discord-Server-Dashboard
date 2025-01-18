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


class Role(BaseModel):
    id: str
    name: str


class PermissionOverwriteModel(BaseModel):
    id: int
    allow: list
    deny: list


class RoleWithAccess(BaseModel):
    id: int
    name: str
