package com.hams.controller;

import com.hams.model.Billing;
import com.hams.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    // ================= CREATE =================

    @PostMapping
    public ResponseEntity<Billing> createBilling(
            @RequestBody Billing billing
    ) {
        Billing saved = billingService.createBilling(billing);
        return ResponseEntity.ok(saved);
    }

    // ================= GET ALL =================

    @GetMapping
    public List<Billing> getAllBillings() {
        return billingService.getAllBillings();
    }

    // ================= GET BY ID =================

    @GetMapping("/{id}")
    public ResponseEntity<Billing> getBillingById(
            @PathVariable Long id
    ) {
        Billing billing = billingService.getBillingById(id);

        if (billing == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(billing);
    }

    // ================= PATIENT =================

    @GetMapping("/patient/{patientId}")
    public List<Billing> getPatientBillings(
            @PathVariable String patientId
    ) {
        return billingService.getBillingsByPatient(patientId);
    }

    // ================= DOCTOR =================

    @GetMapping("/doctor/{doctorId}")
    public List<Billing> getDoctorBillings(
            @PathVariable String doctorId
    ) {
        return billingService.getBillingsByDoctor(doctorId);
    }

    // ================= UPDATE =================

    @PutMapping("/{id}")
    public ResponseEntity<Billing> updateBilling(
            @PathVariable Long id,
            @RequestBody Billing billing
    ) {
        Billing updated = billingService.updateBilling(id, billing);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    // ================= DELETE =================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBilling(
            @PathVariable Long id
    ) {
        boolean deleted = billingService.deleteBilling(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}