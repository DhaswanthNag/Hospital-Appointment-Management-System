package com.hams.security;

import com.hams.model.User;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final String secret = "SECRET_KEY_123_SECRET_KEY_123_SECRET_KEY_123";
    private final SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes());

    private final long validityMillis = 60 * 60 * 1000L; // 1 hour

    // Generate Token ------------------------------------------------
    public String generateToken(User user) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("email", user.getEmail());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getId().toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + validityMillis))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract Claims ------------------------------------------------
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // Validate ------------------------------------------------
    public boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("JWT validation failed: " + e.getMessage());
            return false;
        }
    }
}
