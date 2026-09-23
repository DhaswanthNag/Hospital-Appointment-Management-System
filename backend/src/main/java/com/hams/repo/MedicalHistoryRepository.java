// repo/MedicalHistoryRepository.java
package com.hams.repo;

import com.hams.model.MedicalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    
    List<MedicalHistory> findByPatient_PatientId(String patientId);
    
    void deleteByPatient_PatientIdAndId(String patientId, Long id);
}