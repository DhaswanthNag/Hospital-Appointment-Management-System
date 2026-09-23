package com.hams.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "doctor")
public class Doctor {

    @Id
    //@GeneratedValue(strategy = GenerationType.UUID)   // ❌ REMOVE UUID generation
    private String id;

    private String name;
    private String specialization;
    private String email;
    private String phone;

    @ElementCollection
    @CollectionTable(name = "doctor_availability", joinColumns = @JoinColumn(name = "doctor_id"))
    @Column(name = "availability")
    private List<String> availability;

    private String consultationHours;
    private String status;

    // Constructors
    public Doctor() {}

    public Doctor(String name, String specialization, String email, String phone) {
        this.name = name;
        this.specialization = specialization;
        this.email = email;
        this.phone = phone;
        this.status = "active";
    }

    // Getters and Setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getSpecialization() {
        return specialization;
    }
    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }
    public List<String> getAvailability() {
        return availability;
    }
    public void setAvailability(List<String> availability) {
        this.availability = availability;
    }
    public String getConsultationHours() {
        return consultationHours;
    }
    public void setConsultationHours(String consultationHours) {
        this.consultationHours = consultationHours;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
}
