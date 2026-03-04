# 🔐 JWT Authentication Module — NestJS

A complete, modular authentication flow was added to your project inside the `auth/` directory.

## 📁 Files generated:

- `auth.module.ts` — The NestJS Module combining Controllers, Services, and JWT configurations.
- `auth.controller.ts` — Exposes the `/auth/login`, `/auth/register`, and `/auth/me` endpoints.
- `auth.service.ts` — Business logic (token generation, password validation). **🚨 ACTION REQUIRED HERE**
- `jwt.strategy.ts` — Connects Passport to handle `Bearer Token` parsing automatically.
- `jwt-auth.guard.ts` — The `@UseGuards(JwtAuthGuard)` decorator mapped directly to JWT.
- `dto/*.dto.ts` — Inputs for validation.

## 📦 1. Install Dependencies

You need to install Passport, JWT, and bcrypt:

```bash
npm install @nestjs/passport @nestjs/jwt passport passport-jwt bcryptjs
npm install -D @types/passport-jwt @types/bcryptjs
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
You **MUST** replace this with calls to your actual Database (TypeORM, Prisma, Mongoose, etc).

**Open `auth/auth.service.ts` and look for the `🚨 TODO` blocks.**

### Example: How to connect it to TypeORM:

```typescript
// Inside auth.service.ts

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // <-- Inject real DB
    private jwtService: JwtService
  ) {}

  async register(email: string, pass: string) {
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(pass, 12);

    const newUser = this.usersRepository.create({ email, password: hashedPassword });
    await this.usersRepository.save(newUser);

    const payload = { userId: newUser.id, email: newUser.email };
    return { access_token: this.jwtService.sign(payload) };
  }
}
```

---

## ⚡ 4. Plug the Module into your App

Currently, the `AuthModule` exists, but your root App Module doesn't know about it.
You must register it in your `app.module.ts`.

**Open `src/app.module.ts` and add:**

```typescript
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module'; // <-- IMPORT HERE

@Module({
  imports: [
    AuthModule, // <-- ADD HERE
    // ...other modules
  ],
})
export class AppModule {}
```

## 🔒 5. How to protect other controllers

You can secure any other route by decorating it or its controller with `@UseGuards(JwtAuthGuard)`:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard) // Protects all routes inside this controller
export class AdminController {

  @Get('dashboard')
  getDashboard(@Request() req) {
    // You now have access to the logged-in user's payload!
    return { secretData: `Welcome, user ${req.user.userId}` };
  }
}
```
