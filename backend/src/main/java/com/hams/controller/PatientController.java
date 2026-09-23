package com.hams.controller;

import com.hams.model.Patient;
import com.hams.model.MedicalHistory;
import com.hams.service.PatientService;
import com.hams.repo.MedicalHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private MedicalHistoryRepository medicalHistoryRepository;

    // ================== PATIENT CRUD ==================

    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable String id) {
        return patientService.getPatientById(id);
    }

    // ✅ Updated to use ResponseEntity + automatic PAT ID generation
    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Patient savedPatient = patientService.savePatient(patient);
        return ResponseEntity.ok(savedPatient);
    }

    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable String id, @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    @DeleteMapping("/{id}")
    public void deletePatient(@PathVariable String id) {
        patientService.deletePatient(id);
    }

    // ================== MEDICAL HISTORY ==================

    @GetMapping("/{id}/medical-history")
    public List<MedicalHistory> getMedicalHistory(@PathVariable String id) {
        return medicalHistoryRepository.findByPatient_PatientId(id);
    }

    @PostMapping("/{id}/medical-history")
    public MedicalHistory addMedicalHistory(@PathVariable String id, @RequestBody MedicalHistory history) {
        Patient patient = patientService.getPatientById(id);
        history.setPatient(patient);
        return medicalHistoryRepository.save(history);
    }
    
    @PutMapping("/{patientId}/medical-history/{recordId}")
    public MedicalHistory updateMedicalHistory(@PathVariable String patientId, 
                                             @PathVariable Long recordId, 
                                             @RequestBody MedicalHistory history) {
        MedicalHistory existingRecord = medicalHistoryRepository.findById(recordId).orElse(null);
        if (existingRecord != null && existingRecord.getPatient().getPatientId().equals(patientId)) {
            existingRecord.setDate(history.getDate());
            existingRecord.setDoctor(history.getDoctor());
            existingRecord.setDiagnosis(history.getDiagnosis());
            existingRecord.setTreatment(history.getTreatment());
            existingRecord.setNotes(history.getNotes());
            return medicalHistoryRepository.save(existingRecord);
        }
        return null;
    }
    
    @DeleteMapping("/{patientId}/medical-history/{recordId}")
    public void deleteMedicalHistory(@PathVariable String patientId, @PathVariable Long recordId) {
        medicalHistoryRepository.deleteByPatient_PatientIdAndId(patientId, recordId);
    }
}