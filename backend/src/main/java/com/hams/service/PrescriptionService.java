package com.hams.service;

import com.hams.model.Prescription;
import com.hams.repo.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public PrescriptionService(PrescriptionRepository prescriptionRepository) {
        this.prescriptionRepository = prescriptionRepository;
    }

    public Prescription createPrescription(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    public Prescription getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id).orElse(null);
    }

    public List<Prescription> getPrescriptionsByPatient(String patientId) {
        return prescriptionRepository
                .findByPatientIdOrderByPrescriptionDateDesc(patientId);
    }

    public List<Prescription> getPrescriptionsByDoctor(String doctorId) {
        return prescriptionRepository
                .findByDoctorIdOrderByPrescriptionDateDesc(doctorId);
    }

    public Prescription updatePrescription(
            Long id,
            Prescription prescription
    ) {
        Prescription existing =
                prescriptionRepository.findById(id).orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setPatientId(prescription.getPatientId());
        existing.setDoctorId(prescription.getDoctorId());
        existing.setDiagnosis(prescription.getDiagnosis());
        existing.setInstructions(prescription.getInstructions());
        existing.setPrescriptionDate(prescription.getPrescriptionDate());
        existing.setMedicines(prescription.getMedicines());

        return prescriptionRepository.save(existing);
    }

    public void deletePrescription(Long id) {
        prescriptionRepository.deleteById(id);
    }
}