package com.hams.repo;

import com.hams.model.LabReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LabReportRepository extends JpaRepository<LabReport, Long> {

    List<LabReport> findByPatientId(String patientId);

    List<LabReport> findByDoctorId(String doctorId);

    List<LabReport> findByPatientIdAndDoctorId(
            String patientId,
            String doctorId
    );
}