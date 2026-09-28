package com.hams.config;

import com.hams.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF because this is a REST API using JWT
                .csrf(csrf -> csrf.disable())

                // Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // ==============================
                        // PUBLIC ENDPOINTS
                        // ==============================

                        // Login / Register
                        .requestMatchers("/api/auth/**").permitAll()

                        // Doctor Management
                        .requestMatchers("/api/doctors/**").permitAll()

                        // Patient Management
                        .requestMatchers("/api/patients/**").permitAll()

                        // Appointment Management
                        .requestMatchers("/api/appointments/**").permitAll()

                        // Laboratory Management
                        .requestMatchers("/api/lab-reports/**").permitAll()

                        // Medical Record Management
                        .requestMatchers("/api/medical-records/**").permitAll()

                        // Reports Management
                        .requestMatchers("/api/reports/**").permitAll()

                        // ==============================
                        // EVERYTHING ELSE
                        // ==============================

                        .anyRequest().authenticated()
                )

                // JWT application is stateless
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                );

        // Run JWT filter before Spring Security's username/password filter
        http.addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
        );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        // Frontend is running on React port 3000
        config.setAllowedOriginPatterns(
                List.of("http://localhost:3000")
        );

        // Allow cookies/authorization headers
        config.setAllowCredentials(true);

        // HTTP methods used by the HAMS frontend
        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        // Allow Authorization and other request headers
        config.setAllowedHeaders(
                List.of("*")
        );

        // Allow frontend to read Authorization header
        config.setExposedHeaders(
                List.of("Authorization")
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return source;
    }
}