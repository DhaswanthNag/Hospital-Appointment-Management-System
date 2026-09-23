package com.hams.controller;

import com.hams.dto.AppointmentRequest;
import com.hams.dto.AppointmentResponse;
import com.hams.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @PostMapping
    public ResponseEntity<AppointmentResponse> create(@RequestBody AppointmentRequest req) {
        return ResponseEntity.ok(service.createAppointment(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentResponse> update(@PathVariable String id, @RequestBody AppointmentRequest req) {
        return ResponseEntity.ok(service.updateAppointment(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        service.deleteAppointment(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAll() {
        return ResponseEntity.ok(service.getAllAppointments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getOne(@PathVariable String id) {
        return ResponseEntity.ok(service.getAppointmentById(id));
    }

    // Get appointments by doctor ID
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(service.getAppointmentsByDoctorId(doctorId));
    }

    // Get available time slots for a doctor on specific date
    @GetMapping("/{doctorId}/slots/{date}")
    public ResponseEntity<List<String>> getAvailableSlots(
            @PathVariable String doctorId, 
            @PathVariable String date) {
        return ResponseEntity.ok(service.getAvailableSlots(doctorId, date));
    }
    
    // Get appointments by status for a doctor
    @GetMapping("/doctor/{doctorId}/status/{status}")
    public ResponseEntity<List<AppointmentResponse>> getAppointmentsByDoctorAndStatus(
            @PathVariable String doctorId, 
            @PathVariable String status) {
        return ResponseEntity.ok(service.getAppointmentsByDoctorIdAndStatus(doctorId, status));
    }
}