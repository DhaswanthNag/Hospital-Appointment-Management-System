// service/PatientServiceImpl.java
package com.hams.service;

import com.hams.model.Patient;
import com.hams.repo.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientServiceImpl implements PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient getPatientById(String id) {
        return patientRepository.findByPatientId(id).orElse(null);
    }

    @Override
    public Patient savePatient(Patient patient) {
        // 🔥 Auto-generate Patient ID (PAT001, PAT002…)
        if (patient.getPatientId() == null || patient.getPatientId().trim().isEmpty()) {
            patient.setPatientId(generatePatientId());
        }
        return patientRepository.save(patient);
    }

    @Override
    public Patient updatePatient(String id, Patient newData) {
        Patient existing = patientRepository.findByPatientId(id).orElse(null);
        if (existing == null) {
            return null;
        }

        existing.setFirstName(newData.getFirstName());
        existing.setLastName(newData.getLastName());
        existing.setEmail(newData.getEmail());
        existing.setPhone(newData.getPhone());
        existing.setDateOfBirth(newData.getDateOfBirth());
        existing.setGender(newData.getGender());
        existing.setAddress(newData.getAddress());
        existing.setEmergencyContact(newData.getEmergencyContact());
        existing.setBloodGroup(newData.getBloodGroup());
        existing.setInsuranceProvider(newData.getInsuranceProvider());
        existing.setInsuranceId(newData.getInsuranceId());
        existing.setStatus(newData.getStatus());
        existing.setMedicalHistory(newData.getMedicalHistory());

        return patientRepository.save(existing);
    }

    @Override
    public void deletePatient(String id) {
        Patient patient = patientRepository.findByPatientId(id).orElse(null);
        if (patient != null) {
            patientRepository.delete(patient);
        }
    }

    // ===============================================================
    // 🔥 PATIENT ID GENERATOR — PAT001, PAT002, PAT003...
    // ===============================================================
    private String generatePatientId() {
        List<Patient> allPatients = patientRepository.findAllByOrderByPatientIdDesc();
        
        if (allPatients.isEmpty()) {
            return "PAT001";
        }

        String lastPatientId = allPatients.get(0).getPatientId();
        if (lastPatientId == null || !lastPatientId.startsWith("PAT")) {
            return "PAT001";
        }

        try {
            int number = Integer.parseInt(lastPatientId.substring(3));
            number++;
            return String.format("PAT%03d", number);
        } catch (NumberFormatException e) {
            return "PAT001";
        }
    }
}