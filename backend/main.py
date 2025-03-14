import asyncio
import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from backend.api.v1.router import router as router_v1
from backend.bot import bot, run_bot
from backend.middlewares.authorization import AuthMiddleware
from backend.services.cache import update_logs_cache


async def refresh_cache():
    while True:
        await update_logs_cache()
        await asyncio.sleep(datetime.timedelta(days=1).total_seconds())


@asynccontextmanager
async def lifespan(*args, **kwargs):
    bot_task = asyncio.create_task(run_bot())
    cache_task = asyncio.create_task(refresh_cache())
    try:
        yield
    finally:
        await bot.close()
        bot_task.cancel()
        cache_task.cancel()


app = FastAPI(
    lifespan=lifespan,
    title="Campus Discord Control Panel API",
    description="An API for web control panel for Discord servers, offering server management features",
    version="1.0.0"
)

app.add_middleware(AuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"]
)

app.include_router(router_v1, prefix="/api")


@app.get("/", tags=["Health"])
async def index():
    return Response(status_code=200)
