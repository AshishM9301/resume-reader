from fastapi import FastAPI

from routes.hello_world import router as router_hello_world
from routes.users import router as router_users
from routes.resume import router as router_resume

def setup(app: FastAPI):
    app.include_router(router_hello_world)
    app.include_router(router_users)
    app.include_router(router_resume)