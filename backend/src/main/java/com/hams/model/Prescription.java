package com.hams.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Existing Patient.patientId
    @Column(name = "patient_id", nullable = false)
    private String patientId;

    // Existing Doctor.id
    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "diagnosis")
    private String diagnosis;

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "prescription_date", nullable = false)
    private LocalDate prescriptionDate;

    @ElementCollection
    @CollectionTable(
        name = "prescription_medicines",
        joinColumns = @JoinColumn(name = "prescription_id")
    )
    private List<Medicine> medicines = new ArrayList<>();

    public Prescription() {
        this.prescriptionDate = LocalDate.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public LocalDate getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDate prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public List<Medicine> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<Medicine> medicines) {
        this.medicines = medicines;
    }

    // ================= MEDICINE =================

    @Embeddable
    public static class Medicine {

        @Column(name = "medicine_name")
        private String medicineName;

        @Column(name = "dosage")
        private String dosage;

        @Column(name = "frequency")
        private String frequency;

        @Column(name = "duration")
        private String duration;

        @Column(name = "medicine_instructions", columnDefinition = "TEXT")
        private String instructions;

        public Medicine() {}

        public String getMedicineName() {
            return medicineName;
        }

        public void setMedicineName(String medicineName) {
            this.medicineName = medicineName;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }

        public String getFrequency() {
            return frequency;
        }

        public void setFrequency(String frequency) {
            this.frequency = frequency;
        }

        public String getDuration() {
            return duration;
        }

        public void setDuration(String duration) {
            this.duration = duration;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(String instructions) {
            this.instructions = instructions;
        }
    }
}