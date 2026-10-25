from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional

from helpers.db import DatabaseSession
from models.Users import User, UserSchema
from services.firebase import init as firebase_init, verify_token, create_user as fb_create_user, get_user_by_email
from services.users import create, find_by_firebase_id, find_by_email

firebase_init()

router = APIRouter(prefix="/users", tags=["users"])


class RegisterRequest(BaseModel):
    email: str
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None


class RegisterResponse(BaseModel):
    message: str
    user: Optional[UserSchema] = None


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    message: str
    id_token: Optional[str] = None


class UpsertRequest(BaseModel):
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    username: Optional[str] = None


class UpsertResponse(BaseModel):
    message: str
    user: Optional[UserSchema] = None
    is_new_user: bool = False


async def get_current_user(
    db: DatabaseSession,
    authorization: str = Header(...),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    id_token = authorization[7:]
    try:
        decoded = verify_token(id_token)
        firebase_id = decoded.get("uid")
        user = await find_by_firebase_id(firebase_id, db)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest, db: DatabaseSession, authorization: Optional[str] = Header(None)):
    firebase_id = None

    if authorization and authorization.startswith("Bearer "):
        id_token = authorization[7:]
        try:
            decoded = verify_token(id_token)
            firebase_id = decoded.get("uid")
        except Exception:
            pass

    if not firebase_id:
        if not request.password:
            raise HTTPException(status_code=400, detail="Password required for server-side registration")
        try:
            fb_user = fb_create_user(email=request.email, password=request.password)
            firebase_id = fb_user.uid
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create Firebase user: {str(e)}")

    existing = await find_by_firebase_id(firebase_id, db)
    if existing:
        return RegisterResponse(message="User already exists", user=UserSchema.model_validate(existing))

    user = User(
        firebase_id=firebase_id,
        email=request.email,
        first_name=request.first_name,
        last_name=request.last_name,
        username=request.username or request.email.split('@')[0],
    )
    result = await create(user, db)
    if result is None:
        raise HTTPException(status_code=400, detail="Failed to create user in database")
    return RegisterResponse(message="User registered successfully", user=UserSchema.model_validate(user))


@router.post("/upsert", response_model=UpsertResponse)
async def upsert_user(request: UpsertRequest, db: DatabaseSession, authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    id_token = authorization[7:]

    try:
        decoded = verify_token(id_token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    firebase_id = decoded.get("uid")
    email = decoded.get("email", request.email)

    existing = await find_by_firebase_id(firebase_id, db)

    if existing:
        if request.first_name is not None:
            existing.first_name = request.first_name
        if request.last_name is not None:
            existing.last_name = request.last_name
        if request.username is not None:
            existing.username = request.username

        await db.commit()
        await db.refresh(existing)
        return UpsertResponse(message="User updated", user=UserSchema.model_validate(existing), is_new_user=False)

    user = User(
        firebase_id=firebase_id,
        email=email,
        first_name=request.first_name,
        last_name=request.last_name,
        username=request.username or email.split('@')[0],
    )
    result = await create(user, db)
    if result is None:
        raise HTTPException(status_code=400, detail="Failed to create user in database")
    return UpsertResponse(message="User created", user=UserSchema.model_validate(user), is_new_user=True)


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: DatabaseSession):
    raise HTTPException(status_code=501, detail="Use Firebase Client SDK for login. Then call /users/upsert to create session.")


@router.get("/me", response_model=UserSchema)
async def me(current_user: User = Depends(get_current_user)):
    return UserSchema.model_validate(current_user)
