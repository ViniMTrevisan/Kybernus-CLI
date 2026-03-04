# 🔐 JWT Authentication Module — Python FastAPI

A complete, modular authentication flow was added to your project inside the `app/auth/` directory.

## 📁 Files generated:

- `router.py` — The FastAPI `APIRouter` exposing `/auth/login`, `/auth/register`, and `/auth/me`.
- `service.py` — Business logic (password validation, checking user). **🚨 ACTION REQUIRED HERE**
- `security.py` — JWT token generation and password hashing (passlib).
- `schemas.py` — Pydantic models for request/response validation.

## 📦 1. Install Dependencies

You need to install the cryptography and hashing libraries:

```bash
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
```

## ⚙️ 2. Environment Variables

Add these to your `.env` file at the root of your project:

```
JWT_SECRET=your-super-secret-key-change-me
JWT_EXPIRES_MINUTES=10080
```

> 💡 **Tip:** Generate a strong random secret by running this:
> `python -c "import secrets; print(secrets.token_hex(64))"`

---

## 🚨 3. MANDATORY ACTION: Connect to your Database

The generated `service.py` uses an **IN-MEMORY MOCK DATABASE** by default so that the API compiles and runs immediately. 
You **MUST** replace this with calls to your actual Database (SQLAlchemy, SQLModel, Motor, etc).

**Open `app/auth/service.py` and look for the `🚨 TODO` blocks.**

### Example: How to connect it to SQLAlchemy:

```python
# Inside app/auth/service.py

from sqlalchemy.orm import Session
from app.db.models import User

# Add 'db: Session' parameter so router can inject it
def auth_register(user_data: UserCreate, db: Session) -> dict:
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already exists")

    hashed_password = hash_password(user_data.password)
    
    new_user = User(email=user_data.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})
    return {"user": new_user, "access_token": token, "token_type": "bearer"}
```
*(Remember to update `router.py` endpoints to pass the `db: Session = Depends(get_db)` to the service).*

---

## ⚡ 4. Plug the Router into your App

Currently, the `router.py` exists, but your FastAPI app doesn't know about it.
You must include it in your main application instance.

**Open `app/main.py` and add:**

```python
from fastapi import FastAPI
from app.auth.router import router as auth_router # <-- Import this

app = FastAPI()

app.include_router(auth_router) # <-- Register it
```

## 🔒 5. How to protect other routes

You can secure any other route by using the `get_current_user` dependency:

```python
from fastapi import APIRouter, Depends
from app.auth.router import get_current_user

router = APIRouter(prefix="/admin")

# The Depend() ensures a valid JWT is present before hitting this code
@router.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    # You now have access to the logged-in user's payload!
    return {"message": f"Welcome back, {user['email']}"}
```
