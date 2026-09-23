package com.hams.repo;

import com.hams.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    boolean existsByAppointmentId(String appointmentId);
    
    // Find appointments by doctor ID
    List<Appointment> findByDoctorId(String doctorId);
    
    // Find appointments by doctor ID and status
    List<Appointment> findByDoctorIdAndStatus(String doctorId, String status);
    
    // Find appointments by doctor ID and date
    List<Appointment> findByDoctorIdAndDate(String doctorId, LocalDate date);
    
    // Find appointments by patient ID
    List<Appointment> findByPatientId(String patientId);
    
    // Check if appointment exists for doctor at specific date and time
    boolean existsByDoctorIdAndDateAndTimeAndStatusNot(String doctorId, LocalDate date, LocalTime time, String status);
}