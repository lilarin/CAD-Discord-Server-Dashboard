import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from backend.api.v1.router import router as router_v1
from backend.middlewares.authorization import AuthMiddleware
from backend.services.bot import bot, run_bot


@asynccontextmanager
async def lifespan(*args, **kwargs):
    bot_task = asyncio.create_task(run_bot())
    try:
        yield
    finally:
        await bot.close()
        bot_task.cancel()


app = FastAPI(lifespan=lifespan)

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
