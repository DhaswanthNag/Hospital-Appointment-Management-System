package com.hams.controller;

import com.hams.model.MedicalRecord;
import com.hams.service.MedicalRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(
            MedicalRecordService medicalRecordService
    ) {
        this.medicalRecordService = medicalRecordService;
    }

    @GetMapping
    public ResponseEntity<List<MedicalRecord>> getAllRecords() {
        return ResponseEntity.ok(
                medicalRecordService.getAllRecords()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getRecordById(
            @PathVariable Long id
    ) {
        return medicalRecordService
                .getRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity.notFound().build()
                );
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicalRecord>> getRecordsByPatient(
            @PathVariable String patientId
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getRecordsByPatient(patientId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<MedicalRecord>> getRecordsByDoctor(
            @PathVariable String doctorId
    ) {
        return ResponseEntity.ok(
                medicalRecordService.getRecordsByDoctor(doctorId)
        );
    }

    @GetMapping("/patient/{patientId}/doctor/{doctorId}")
    public ResponseEntity<List<MedicalRecord>> getRecordsByPatientAndDoctor(
            @PathVariable String patientId,
            @PathVariable String doctorId
    ) {
        return ResponseEntity.ok(
                medicalRecordService
                        .getRecordsByPatientAndDoctor(
                                patientId,
                                doctorId
                        )
        );
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> createRecord(
            @RequestBody MedicalRecord record
    ) {
        return ResponseEntity.ok(
                medicalRecordService.createRecord(record)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalRecord> updateRecord(
            @PathVariable Long id,
            @RequestBody MedicalRecord record
    ) {
        return ResponseEntity.ok(
                medicalRecordService.updateRecord(
                        id,
                        record
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(
            @PathVariable Long id
    ) {
        medicalRecordService.deleteRecord(id);

        return ResponseEntity.noContent().build();
    }
}