package com.hams.controller;

import com.hams.model.LabReport;
import com.hams.service.LabReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-reports")
@CrossOrigin(origins = "*")
public class LabReportController {

    private final LabReportService labReportService;

    public LabReportController(LabReportService labReportService) {
        this.labReportService = labReportService;
    }

    @GetMapping
    public ResponseEntity<List<LabReport>> getAllReports() {
        return ResponseEntity.ok(
                labReportService.getAllReports()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabReport> getReportById(
            @PathVariable Long id
    ) {

        return labReportService.getReportById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabReport>> getReportsByPatient(
            @PathVariable String patientId
    ) {

        return ResponseEntity.ok(
                labReportService.getReportsByPatient(patientId)
        );
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<LabReport>> getReportsByDoctor(
            @PathVariable String doctorId
    ) {

        return ResponseEntity.ok(
                labReportService.getReportsByDoctor(doctorId)
        );
    }

    @PostMapping
    public ResponseEntity<LabReport> createReport(
            @RequestBody LabReport report
    ) {

        return ResponseEntity.ok(
                labReportService.createReport(report)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabReport> updateReport(
            @PathVariable Long id,
            @RequestBody LabReport report
    ) {

        return ResponseEntity.ok(
                labReportService.updateReport(id, report)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable Long id
    ) {

        labReportService.deleteReport(id);

        return ResponseEntity.noContent().build();
    }
}