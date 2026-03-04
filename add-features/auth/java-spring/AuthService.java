package com.example.auth;

import com.example.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

// ==========================================
// 🚨 TODO: DATABASE INTEGRATION REQUIRED 🚨
// ==========================================
// This service currently uses an IN-MEMORY list to store users.
// You MUST replace the "mockDb" logic below with your Spring Data JPA Repository.
//
// EXAMPLE WITH JPA:
// 1. Inject UserRepository: 
//    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) { ... }
// 2. Register: userRepository.save(new User(email, passwordEncoder.encode(password)));
// 3. Login: userRepository.findByEmail(email).orElseThrow(...);
// ==========================================

@Service
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 🚨 REPLACE THIS WITH REAL DB CALLS (e.g., UserRepository) 🚨
    private final List<Map<String, String>> mockDb = new ArrayList<>();

    public AuthService(PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Map<String, Object> register(String email, String password) {
        // 🚨 TODO: Check real DB
        boolean exists = mockDb.stream().anyMatch(u -> u.get("email").equals(email));
        if (exists) {
            throw new IllegalArgumentException("User already exists");
        }

        String hashedPassword = passwordEncoder.encode(password);
        String userId = UUID.randomUUID().toString().substring(0, 8);

        // 🚨 TODO: Insert into real DB
        Map<String, String> newUser = new HashMap<>();
        newUser.put("id", userId);
        newUser.put("email", email);
        newUser.put("password", hashedPassword);
        mockDb.add(newUser);

        String token = jwtUtil.generateToken(userId, email);

        Map<String, Object> response = new HashMap<>();
        response.put("user", Map.of("id", userId, "email", email));
        response.put("accessToken", token);
        return response;
    }

    public Map<String, String> login(String email, String password) {
        // 🚨 TODO: Fetch from real DB
        Map<String, String> user = mockDb.stream()
                .filter(u -> u.get("email").equals(email))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.get("password"))) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.get("id"), user.get("email"));
        return Map.of("accessToken", token);
    }

    public Map<String, Object> getUserProfile(String userId) {
        // 🚨 TODO: Fetch from real DB
        Map<String, String> user = mockDb.stream()
                .filter(u -> u.get("id").equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return Map.of("id", user.get("id"), "email", user.get("email"));
    }
}
