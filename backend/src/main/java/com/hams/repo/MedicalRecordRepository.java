package com.hams.repo;

import com.hams.model.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    List<MedicalRecord> findByPatientId(String patientId);

    List<MedicalRecord> findByDoctorId(String doctorId);

    List<MedicalRecord> findByPatientIdAndDoctorId(
            String patientId,
            String doctorId
    );
}