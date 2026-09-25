package com.hams.repo;

import com.hams.model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientId(String patientId);

    List<Prescription> findByDoctorId(String doctorId);

    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(String patientId);

    List<Prescription> findByDoctorIdOrderByPrescriptionDateDesc(String doctorId);
}