from fastapi import APIRouter, Depends, HTTPException
from .schemas import UserCreate, UserLogin, TokenResponse, RegisterResponse, UserResponse
from .service import auth_register, auth_login, get_user_profile
from .security import oauth2_scheme, decode_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency for securing endpoints."""
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token structure")
    return {"user_id": user_id, "email": payload.get("email")}

@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(user_data: UserCreate):
    return auth_register(user_data)

@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin):
    return auth_login(user_data)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return get_user_profile(current_user["user_id"])
