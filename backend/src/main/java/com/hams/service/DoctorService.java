package com.hams.service;

import com.hams.model.Doctor;
import java.util.List;

public interface DoctorService {
    Doctor saveDoctor(Doctor doctor);
    Doctor updateDoctor(String id, Doctor doctor);
    void deleteDoctor(String id);
    List<Doctor> getAllDoctors();
    Doctor getDoctorById(String id);
}
