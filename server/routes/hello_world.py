from fastapi import APIRouter, HTTPException


router = APIRouter()

@router.get("/he",status_code=201)
async def hello_world():
    return {"message": "Hello World"}