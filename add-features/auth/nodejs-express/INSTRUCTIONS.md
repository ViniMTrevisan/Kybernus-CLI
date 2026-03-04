# 🔐 JWT Authentication Module — Node.js Express

A complete, modular authentication flow was added to your project inside the `auth/` directory.

## 📁 Files generated:

- `auth.routes.ts` — The Express Router defining `/login`, `/register`, and `/me`.
- `auth.controller.ts` — Handles HTTP Requests and Responses.
- `auth.service.ts` — Business logic (token generation, password hashing). **🚨 ACTION REQUIRED HERE**
- `auth.middleware.ts` — Middleware to protect secure routes.
- `jwt.config.ts` — JWT sign and verify utilities.

## 📦 1. Install Dependencies

You need to install the JWT and Cryptography packages:

```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

## ⚙️ 2. Environment Variables

Add these to your `.env` file at the root of your project:

```
JWT_SECRET=your-super-secret-key-change-me
JWT_EXPIRES_IN=7d
```

> 💡 **Tip:** Generate a strong random secret by running this in your terminal:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 🚨 3. MANDATORY ACTION: Connect to your Database

The generated `auth.service.ts` uses an **IN-MEMORY MOCK DATABASE** by default so that it compiles and runs immediately. 
You **MUST** replace this with your actual Database / ORM calls.

**Open `auth/auth.service.ts` and look for the `🚨 TODO` blocks.**

### Example: How to connect it to Prisma:

```typescript
// Inside auth.service.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from './jwt.config';

const prisma = new PrismaClient();

export class AuthService {
  async register(email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = generateToken({ userId: newUser.id, email: newUser.email });
    return { token };
  }
}
```

---

## ⚡ 4. Plug the Router into your App

Currently, the routes exist but your Express server doesn't know about them.
You must register the `auth.routes.ts` file in your main Express app entrypoint.

**Open your `src/app.ts` or `src/index.ts` and add:**

```typescript
import express from 'express';
// 1. Import the router
import authRoutes from './auth/auth.routes'; 

const app = express();
app.use(express.json());

// 2. Register the router
app.use('/api/auth', authRoutes);

app.listen(3000, () => console.log('Server running!'));
```

## 🔒 5. How to protect other routes

You can secure any other route in your API by importing the `authMiddleware`:

```typescript
import { authMiddleware } from './auth/auth.middleware';

// Any route using authMiddleware requires a valid 'Authorization: Bearer <token>' header
app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
  // You now have access to the logged-in user's payload!
  console.log(req.user.userId);
  console.log(req.user.email);
  
  res.json({ secretData: "This is locked" });
});
```
