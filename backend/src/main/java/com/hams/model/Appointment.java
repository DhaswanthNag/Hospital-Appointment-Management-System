package com.hams.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String appointmentId;     // APT001...
    private String patientId;         // PAT001...
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String patientAddress;
    private String dateOfBirth;
    private String gender;
    private String doctorId;          // DOC001...
    private String doctorName;
    private String department;

    private LocalDate date;
    private LocalTime time;
    private Integer duration;

    private String type;
    private String reason;
    private String status;

    private LocalDateTime bookedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;
    
    private String room;
}