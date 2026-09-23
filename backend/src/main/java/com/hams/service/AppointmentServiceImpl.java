package com.hams.service;

import com.hams.dto.AppointmentRequest;
import com.hams.dto.AppointmentResponse;
import com.hams.model.Appointment;
import com.hams.repo.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository repo;

    // Generate appointment IDs like APT001, APT002...
    private String generateAppointmentId() {
        List<Appointment> allAppointments = repo.findAll();
        if (allAppointments.isEmpty()) {
            return "APT001";
        }
        
        // Find the highest APT number
        int maxNumber = allAppointments.stream()
            .map(appt -> appt.getAppointmentId())
            .filter(id -> id != null && id.startsWith("APT"))
            .mapToInt(id -> {
                try {
                    return Integer.parseInt(id.substring(3));
                } catch (NumberFormatException e) {
                    return 0;
                }
            })
            .max()
            .orElse(0);
            
        return "APT" + String.format("%03d", maxNumber + 1);
    }

    private AppointmentResponse convert(Appointment appt) {
        AppointmentResponse res = new AppointmentResponse();

        res.setId(appt.getId());
        res.setAppointmentId(appt.getAppointmentId());
        res.setPatientId(appt.getPatientId());
        res.setPatientName(appt.getPatientName());
        res.setPatientEmail(appt.getPatientEmail());
        res.setPatientPhone(appt.getPatientPhone());
        res.setPatientAddress(appt.getPatientAddress());
        res.setDateOfBirth(appt.getDateOfBirth());
        res.setGender(appt.getGender());
        res.setDoctorId(appt.getDoctorId());
        res.setDoctorName(appt.getDoctorName());
        res.setDepartment(appt.getDepartment());

        res.setDate(appt.getDate() != null ? appt.getDate().toString() : "");
        res.setTime(appt.getTime() != null ? appt.getTime().toString() : "");
        res.setDuration(appt.getDuration());

        res.setType(appt.getType());
        res.setReason(appt.getReason());
        res.setStatus(appt.getStatus());

        res.setBookedAt(appt.getBookedAt() != null ? appt.getBookedAt().toString() : "");
        res.setNotes(appt.getNotes());
        res.setRoom(appt.getRoom());

        return res;
    }

    @Override
    public AppointmentResponse createAppointment(AppointmentRequest request) {

        Appointment appt = new Appointment();

        appt.setAppointmentId(generateAppointmentId());
        appt.setPatientId(request.getPatientId());
        appt.setPatientName(request.getPatientName());
        appt.setPatientEmail(request.getPatientEmail());
        appt.setPatientPhone(request.getPatientPhone());
        appt.setPatientAddress(request.getPatientAddress());
        appt.setDateOfBirth(request.getDateOfBirth());
        appt.setGender(request.getGender());
        appt.setDoctorId(request.getDoctorId());
        appt.setDoctorName(request.getDoctorName());
        appt.setDepartment(request.getDepartment());

        appt.setDate(request.getDate() != null ? LocalDate.parse(request.getDate()) : null);
        appt.setTime(request.getTime() != null ? LocalTime.parse(request.getTime()) : null);
        appt.setDuration(request.getDuration());

        appt.setType(request.getType());
        appt.setReason(request.getReason());
        appt.setStatus(request.getStatus() != null ? request.getStatus() : "pending");
        appt.setNotes(request.getNotes());
        appt.setRoom(request.getRoom());

        appt.setBookedAt(LocalDateTime.now());

        Appointment savedAppointment = repo.save(appt);
        return convert(savedAppointment);
    }

    @Override
    public AppointmentResponse updateAppointment(String id, AppointmentRequest req) {

        Appointment appt = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setPatientId(req.getPatientId());
        appt.setPatientName(req.getPatientName());
        appt.setPatientEmail(req.getPatientEmail());
        appt.setPatientPhone(req.getPatientPhone());
        appt.setPatientAddress(req.getPatientAddress());
        appt.setDateOfBirth(req.getDateOfBirth());
        appt.setGender(req.getGender());
        appt.setDoctorId(req.getDoctorId());
        appt.setDoctorName(req.getDoctorName());
        appt.setDepartment(req.getDepartment());
        appt.setDate(req.getDate() != null ? LocalDate.parse(req.getDate()) : null);
        appt.setTime(req.getTime() != null ? LocalTime.parse(req.getTime()) : null);
        appt.setDuration(req.getDuration());
        appt.setType(req.getType());
        appt.setReason(req.getReason());
        appt.setStatus(req.getStatus());
        appt.setNotes(req.getNotes());
        appt.setRoom(req.getRoom());

        Appointment updatedAppointment = repo.save(appt);
        return convert(updatedAppointment);
    }

    @Override
    public void deleteAppointment(String id) {
        repo.deleteById(id);
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        return repo.findAll().stream()
                .map(this::convert)
                .toList();
    }

    @Override
    public AppointmentResponse getAppointmentById(String id) {
        return repo.findById(id)
                .map(this::convert)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByDoctorId(String doctorId) {
        return repo.findByDoctorId(doctorId).stream()
                .map(this::convert)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByDoctorIdAndStatus(String doctorId, String status) {
        return repo.findByDoctorIdAndStatus(doctorId, status).stream()
                .map(this::convert)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAvailableSlots(String doctorId, String date) {
        // Generate time slots from 9 AM to 5 PM
        List<String> allSlots = generateTimeSlots();
        
        // Get booked appointments for this doctor and date
        List<Appointment> bookedAppointments = repo.findByDoctorIdAndDate(doctorId, LocalDate.parse(date));
        
        // Filter out booked slots
        List<String> bookedSlots = bookedAppointments.stream()
                .filter(apt -> !"cancelled".equals(apt.getStatus()))
                .map(Appointment::getTime)
                .map(time -> time != null ? time.toString() : "")
                .filter(timeStr -> !timeStr.isEmpty())
                .collect(Collectors.toList());
        
        return allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());
    }

    private List<String> generateTimeSlots() {
        List<String> slots = new ArrayList<>();
        LocalTime start = LocalTime.of(9, 0); // 9:00 AM
        LocalTime end = LocalTime.of(17, 0);  // 5:00 PM
        
        while (start.isBefore(end)) {
            slots.add(start.toString());
            start = start.plusMinutes(30); // 30-minute intervals
        }
        
        return slots;
    }
}