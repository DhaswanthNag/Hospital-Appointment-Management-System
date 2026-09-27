package com.hams.service;

import com.hams.model.MedicalRecord;
import com.hams.repo.MedicalRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository
    ) {
        this.medicalRecordRepository = medicalRecordRepository;
    }

    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }

    public Optional<MedicalRecord> getRecordById(Long id) {
        return medicalRecordRepository.findById(id);
    }

    public List<MedicalRecord> getRecordsByPatient(String patientId) {
        return medicalRecordRepository.findByPatientId(patientId);
    }

    public List<MedicalRecord> getRecordsByDoctor(String doctorId) {
        return medicalRecordRepository.findByDoctorId(doctorId);
    }

    public List<MedicalRecord> getRecordsByPatientAndDoctor(
            String patientId,
            String doctorId
    ) {
        return medicalRecordRepository
                .findByPatientIdAndDoctorId(patientId, doctorId);
    }

    public MedicalRecord createRecord(MedicalRecord record) {
        return medicalRecordRepository.save(record);
    }

    public MedicalRecord updateRecord(
            Long id,
            MedicalRecord updatedRecord
    ) {
        return medicalRecordRepository.findById(id)
                .map(existingRecord -> {

                    existingRecord.setPatientId(
                            updatedRecord.getPatientId()
                    );

                    existingRecord.setDoctorId(
                            updatedRecord.getDoctorId()
                    );

                    existingRecord.setRecordDate(
                            updatedRecord.getRecordDate()
                    );

                    existingRecord.setDiagnosis(
                            updatedRecord.getDiagnosis()
                    );

                    existingRecord.setSymptoms(
                            updatedRecord.getSymptoms()
                    );

                    existingRecord.setTreatment(
                            updatedRecord.getTreatment()
                    );

                    existingRecord.setMedications(
                            updatedRecord.getMedications()
                    );

                    existingRecord.setAllergies(
                            updatedRecord.getAllergies()
                    );

                    existingRecord.setNotes(
                            updatedRecord.getNotes()
                    );

                    return medicalRecordRepository.save(
                            existingRecord
                    );
                })
                .orElseThrow(
                        () -> new RuntimeException(
                                "Medical record not found with id: " + id
                        )
                );
    }

    public void deleteRecord(Long id) {

        if (!medicalRecordRepository.existsById(id)) {
            throw new RuntimeException(
                    "Medical record not found with id: " + id
            );
        }

        medicalRecordRepository.deleteById(id);
    }
}