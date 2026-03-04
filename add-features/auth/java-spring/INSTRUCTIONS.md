# 🔐 JWT Authentication Module — Java Spring Boot

A complete, modular authentication flow was added to your project inside the `com.example.auth` and `com.example.security` packages.

## 📁 Files generated:

- `AuthController.java` — REST Controller exposing `/auth/login`, `/auth/register`, and `/auth/me`.
- `AuthService.java` — Business logic (token generation, password validation). **🚨 ACTION REQUIRED HERE**
- `dto/LoginRequest.java` and `dto/RegisterRequest.java` — Input validation objects.
- `security/SecurityConfig.java` — Configures the `SecurityFilterChain` to protect routes.
- `security/JwtUtil.java` and `security/JwtRequestFilter.java` — Token utility and filter.

## 📦 1. Add Dependencies (`pom.xml` / `build.gradle`)

You need the `jjwt` library and `spring-boot-starter-security`:

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## ⚙️ 2. Environment Variables

Add these to your `application.properties` or `application.yml`:

```properties
jwt.secret=your-super-secret-key-change-me-must-be-at-least-32-chars
jwt.expiration=604800000
```

---

## 🚨 3. MANDATORY ACTION: Connect to your Database

The generated `AuthService.java` uses an **IN-MEMORY MOCK DATABASE** by default so that the API compiles and runs immediately. 
You **MUST** replace this with calls to your actual Database (e.g., Spring Data JPA `UserRepository`).

**Open `AuthService.java` and look for the `🚨 TODO` blocks.**

### Example: How to connect it to JPA:

```java
// Inside AuthService.java

@Service
public class AuthService {
    private final UserRepository userRepository; // <-- Inject your real DB Repo
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Remove the mockDb completely!

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> register(String email, String password) {
        if (userRepository.existsByEmail(email)) {
             throw new IllegalArgumentException("User already exists");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        userRepository.save(newUser);

        String token = jwtUtil.generateToken(newUser.getId(), newUser.getEmail());
        // Return response...
    }
}
```

---

## 🔒 4. How to protect other controllers

The `SecurityConfig.java` is already checking the JWT token. 
Any new controller you create is **automatically protected**, except for the permitAll routes (`/auth/**` and `/swagger-ui/**`).

To access the logged-in user inside any Controller:

```java
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @GetMapping("/api/dashboard")
    public String dashboard(Authentication authentication) {
        // authentication is non-null because the route is protected
        String userId = (String) authentication.getPrincipal();

        return "Welcome, user ID: " + userId;
    }
}
```
