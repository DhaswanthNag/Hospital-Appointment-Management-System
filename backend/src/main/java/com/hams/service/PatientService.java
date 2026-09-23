// service/PatientService.java
package com.hams.service;

import com.hams.model.Patient;
import java.util.List;

public interface PatientService {
    List<Patient> getAllPatients();
    Patient getPatientById(String id);
    Patient savePatient(Patient patient);
    Patient updatePatient(String id, Patient patient);
    void deletePatient(String id);
}