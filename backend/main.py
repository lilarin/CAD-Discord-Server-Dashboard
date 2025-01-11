import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response

from backend.api.v1.router import router as router_v1
from backend.services.bot import bot, run_bot


@asynccontextmanager
async def lifespan(*args, **kwargs):
    bot_task = asyncio.create_task(run_bot())
    try:
        yield
    finally:
        await bot.close()
        await bot_task

app = FastAPI()
app.include_router(router_v1, prefix="/api")


@app.get("/", tags=["Health"])
async def index():
    return Response(status_code=200)
