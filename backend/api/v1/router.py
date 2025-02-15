from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer

from backend.api.v1.categories import router as categories_router
from backend.api.v1.channels import router as channels_router
from backend.api.v1.logs import router as logs_router
from backend.api.v1.roles import router as roles_router
from backend.api.v1.users import router as users_router

router = APIRouter(prefix="/v1", dependencies=[Depends(HTTPBearer())],)

router.include_router(categories_router, tags=["Categories"])
router.include_router(channels_router, tags=["Channels"])
router.include_router(users_router, tags=["Users"])
router.include_router(roles_router, tags=["Roles"])
router.include_router(logs_router, tags=["Logs"])
