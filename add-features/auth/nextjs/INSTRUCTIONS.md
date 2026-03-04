# 🔐 JWT Authentication Module — Next.js (App Router)

A complete, modular authentication flow was added to your Next.js project.

## 📁 Files generated:

- `src/lib/auth/jwt.ts` — Utilities for signing and verifying JSON Web Tokens.
- `src/lib/auth/session.ts` — Utilities for reading the session cookie from Server Components.
- `src/app/api/auth/login/route.ts` — Login API Route. **🚨 ACTION REQUIRED HERE**
- `src/app/api/auth/register/route.ts` — Registration API Route. **🚨 ACTION REQUIRED HERE**
- `src/middleware.ts` — Edge Middleware that automatically intercepts page requests and redirects unauthenticated users.

## 📦 1. Install Dependencies

You need to install the JWT and Hash libraries:

```bash
npm install jsonwebtoken bcryptjs
npm install -D @types/jsonwebtoken @types/bcryptjs
```

## ⚙️ 2. Environment Variables

Add these to your `.env` or `.env.local` file at the root of your project:

```
JWT_SECRET=your-super-secret-key-change-me
JWT_EXPIRES_IN=7d
```

> 💡 **Tip:** Generate a strong random secret by running this in your terminal:
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 🚨 3. MANDATORY ACTION: Connect to your Database

The generated `login/route.ts` and `register/route.ts` use an **IN-MEMORY MOCK DATABASE** by default so that they compile and run immediately. 
You **MUST** replace this with your actual database queries (Prisma, Drizzle, MongoDB, etc).

**Open `src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts` and look for the `🚨 TODO` blocks.**

### Example: How to connect `register` to Prisma:

```typescript
// Inside src/app/api/auth/register/route.ts

import prisma from '@/lib/prisma'; // Provide your own PrismaClient

// Inside the POST function:
const existingUser = await prisma.user.findUnique({ where: { email } });
if (existingUser) return NextResponse.json({ error: 'User exists' }, { status: 409 });

const hashedPassword = await bcrypt.hash(password, 12);

const newUser = await prisma.user.create({
  data: { email, password: hashedPassword },
});

// ... continuing with token generation ...
```

---

## ⚡ 4. Consuming the Session in Server Components

You can easily know who the current user is from any Server Component, without making an additional network request:

```tsx
// src/app/dashboard/page.tsx

import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();

  // The middleware already protects /dashboard, but this is how you read the data
  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome back!</h1>
      <p>Your ID: {session.userId}</p>
      <p>Your Email: {session.email}</p>
    </div>
  );
}
```

## 🔒 5. Middleware Protection

Open `src/middleware.ts`. At the top, you will see `protectedRoutes`. 
Any route added to that array (e.g. `/dashboard`, `/settings`) cannot be accessed unless a valid JWT cookie is present.
Unauthenticated users will automatically redirect to `/login`.
