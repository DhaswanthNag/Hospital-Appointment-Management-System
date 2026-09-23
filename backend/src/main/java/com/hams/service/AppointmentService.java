package com.hams.service;

import com.hams.dto.AppointmentRequest;
import com.hams.dto.AppointmentResponse;

import java.util.List;

public interface AppointmentService {

    AppointmentResponse createAppointment(AppointmentRequest request);

    AppointmentResponse updateAppointment(String id, AppointmentRequest request);

    void deleteAppointment(String id);

    List<AppointmentResponse> getAllAppointments();

    AppointmentResponse getAppointmentById(String id);

    // Get appointments by doctor ID
    List<AppointmentResponse> getAppointmentsByDoctorId(String doctorId);

    // Get appointments by doctor ID and status
    List<AppointmentResponse> getAppointmentsByDoctorIdAndStatus(String doctorId, String status);

    // Get available time slots for a doctor
    List<String> getAvailableSlots(String doctorId, String date);
}