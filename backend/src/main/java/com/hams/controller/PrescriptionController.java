package com.hams.controller;

import com.hams.model.Prescription;
import com.hams.service.PrescriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(
            PrescriptionService prescriptionService
    ) {
        this.prescriptionService = prescriptionService;
    }

    // ================= CREATE =================

    @PostMapping
    public ResponseEntity<Prescription> createPrescription(
            @RequestBody Prescription prescription
    ) {
        Prescription saved =
                prescriptionService.createPrescription(prescription);

        return ResponseEntity.ok(saved);
    }

    // ================= GET ALL =================

    @GetMapping
    public List<Prescription> getAllPrescriptions() {
        return prescriptionService.getAllPrescriptions();
    }

    // ================= GET BY ID =================

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(
            @PathVariable Long id
    ) {
        Prescription prescription =
                prescriptionService.getPrescriptionById(id);

        if (prescription == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(prescription);
    }

    // ================= PATIENT =================

    @GetMapping("/patient/{patientId}")
    public List<Prescription> getPatientPrescriptions(
            @PathVariable String patientId
    ) {
        return prescriptionService
                .getPrescriptionsByPatient(patientId);
    }

    // ================= DOCTOR =================

    @GetMapping("/doctor/{doctorId}")
    public List<Prescription> getDoctorPrescriptions(
            @PathVariable String doctorId
    ) {
        return prescriptionService
                .getPrescriptionsByDoctor(doctorId);
    }

    // ================= UPDATE =================

    @PutMapping("/{id}")
    public ResponseEntity<Prescription> updatePrescription(
            @PathVariable Long id,
            @RequestBody Prescription prescription
    ) {
        Prescription updated =
                prescriptionService.updatePrescription(id, prescription);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    // ================= DELETE =================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(
            @PathVariable Long id
    ) {
        prescriptionService.deletePrescription(id);

        return ResponseEntity.noContent().build();
    }
}