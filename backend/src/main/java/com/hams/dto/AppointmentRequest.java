package com.hams.dto;

import lombok.Data;

@Data
public class AppointmentRequest {

    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String patientAddress;
    private String dateOfBirth;
    private String gender;
    private String doctorId;
    private String doctorName;
    private String department;

    private String date;
    private String time;
    private Integer duration;

    private String type;
    private String reason;
    private String status;

    private String notes;
    private String room;
}