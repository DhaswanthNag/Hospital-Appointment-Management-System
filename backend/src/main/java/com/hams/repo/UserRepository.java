package com.hams.repo;

import com.hams.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Find user by email
    Optional<User> findByEmail(String email);

    // Check if email exists (for register)
    boolean existsByEmail(String email);

}
