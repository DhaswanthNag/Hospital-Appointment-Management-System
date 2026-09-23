package com.hams.repo;

import com.hams.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    
    Optional<Patient> findByPatientId(String patientId);
    
    List<Patient> findAllByOrderByPatientIdDesc();
    
    void deleteByPatientId(String patientId);
    
    List<Patient> findByStatus(String status);
}