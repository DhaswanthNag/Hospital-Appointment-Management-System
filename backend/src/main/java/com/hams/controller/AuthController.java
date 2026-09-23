package com.hams.controller;

import com.hams.dto.LoginRequest;
import com.hams.model.User;
import com.hams.repo.UserRepository;
import com.hams.security.JwtUtil;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // REGISTER ----------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String password = body.get("password");
        String name = body.getOrDefault("name", "");
        String role = body.getOrDefault("role", "patient");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "email required"));
        }

        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "password required"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "email already exists"));
        }

        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password));

        try {
            u.setRole(User.Role.valueOf(role));
        } catch (Exception e) {
            u.setRole(User.Role.patient);
        }

        userRepository.save(u);

        return ResponseEntity.ok(Map.of("message", "registered successfully"));
    }

    // LOGIN ----------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));

        return ResponseEntity.ok(response);
    }
}
