package com.hams.service;

import com.hams.model.Doctor;
import com.hams.repo.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorServiceImpl(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    // ⭐ Generate ID like DOC001, DOC002...
    private String generateDoctorId() {
        Doctor lastDoctor = doctorRepository.findTopByOrderByIdDesc();

        if (lastDoctor == null || lastDoctor.getId() == null) {
            return "DOC001";
        }

        String lastId = lastDoctor.getId(); // e.g., DOC015
        int num = Integer.parseInt(lastId.replace("DOC", "")); 
        num++;

        return String.format("DOC%03d", num);
    }

    @Override
    public Doctor saveDoctor(Doctor doctor) {
        // Generate DOCxxx if ID not provided
        if (doctor.getId() == null) {
            doctor.setId(generateDoctorId());
        }

        // Set default status if not provided
        if (doctor.getStatus() == null) {
            doctor.setStatus("active");
        }

        return doctorRepository.save(doctor);
    }

    @Override
    public Doctor updateDoctor(String id, Doctor doctor) {
        Doctor existingDoctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));

        // Update fields
        existingDoctor.setName(doctor.getName());
        existingDoctor.setSpecialization(doctor.getSpecialization());
        existingDoctor.setEmail(doctor.getEmail());
        existingDoctor.setPhone(doctor.getPhone());
        existingDoctor.setAvailability(doctor.getAvailability());
        existingDoctor.setConsultationHours(doctor.getConsultationHours());
        existingDoctor.setStatus(doctor.getStatus());

        return doctorRepository.save(existingDoctor);
    }

    @Override
    public void deleteDoctor(String id) {
        doctorRepository.deleteById(id);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor getDoctorById(String id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }
}
