from fastapi import HTTPException
from .security import hash_password, verify_password, create_access_token
from .schemas import UserCreate, UserLogin

# ==========================================
# 🚨 TODO: DATABASE INTEGRATION REQUIRED 🚨
# ==========================================
# This service currently uses an IN-MEMORY list to store users.
# You MUST replace the "mock_db" logic below with your SQLAlchemy sessions
# or other ORM tool.
#
# EXAMPLE WITH SQLALCHEMY:
# def register_user(db: Session, user_data: UserCreate):
#     existing = db.query(User).filter(User.email == user_data.email).first()
#     if existing: ...
# ==========================================

mock_db = []  # 🚨 REPLACE THIS WITH REAL DB CALLS 🚨

def auth_register(user_data: UserCreate) -> dict:
    # 🚨 TODO: Check real DB
    existing_user = next((u for u in mock_db if u["email"] == user_data.email), None)
    if existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    hashed_password = hash_password(user_data.password)

    # 🚨 TODO: Insert into real DB
    import uuid
    new_user = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hashed_password
    }
    mock_db.append(new_user)

    token = create_access_token(data={"sub": new_user["id"], "email": new_user["email"]})
    
    return {
        "user": {"id": new_user["id"], "email": new_user["email"]},
        "access_token": token,
        "token_type": "bearer"
    }

def auth_login(user_data: UserLogin) -> dict:
    # 🚨 TODO: Fetch from real DB
    user = next((u for u in mock_db if u["email"] == user_data.email), None)
    
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    return {"access_token": token, "token_type": "bearer"}

def get_user_profile(user_id: str) -> dict:
    # 🚨 TODO: Fetch from real DB
    user = next((u for u in mock_db if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"id": user["id"], "email": user["email"]}
