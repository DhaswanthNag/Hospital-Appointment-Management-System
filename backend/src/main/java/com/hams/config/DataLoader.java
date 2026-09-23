package com.hams.config;

import com.hams.model.User;
import com.hams.repo.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {

  @Bean
  CommandLineRunner initUsers(UserRepository repo, PasswordEncoder passwordEncoder) {
    return args -> {
      if (repo.count() == 0) {
        User admin = new User();
        admin.setName("Admin");
        admin.setEmail("admin@gmail.com");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setRole(User.Role.admin);
        repo.save(admin);

        User doctor = new User();
        doctor.setName("Doctor 1");
        doctor.setEmail("doctor1@gmail.com");
        doctor.setPasswordHash(passwordEncoder.encode("doctor123"));
        doctor.setRole(User.Role.doctor);
        repo.save(doctor);

        User patient = new User();
        patient.setName("Patient 1");
        patient.setEmail("patient1@gmail.com");
        patient.setPasswordHash(passwordEncoder.encode("patient123"));
        patient.setRole(User.Role.patient);
        repo.save(patient);
      }
    };
  }
}
