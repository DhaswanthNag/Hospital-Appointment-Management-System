package com.hams.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.hams.model.Doctor;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, String> {

    List<Doctor> findByStatus(String status);

    // ⭐ NEW: get last doctor ordered by ID
    Doctor findTopByOrderByIdDesc();
}
