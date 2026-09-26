package com.hams.service;

import com.hams.model.LabReport;
import com.hams.repository.LabReportRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LabReportService {

    private final LabReportRepository labReportRepository;

    public LabReportService(LabReportRepository labReportRepository) {
        this.labReportRepository = labReportRepository;
    }

    public List<LabReport> getAllReports() {
        return labReportRepository.findAll();
    }

    public Optional<LabReport> getReportById(Long id) {
        return labReportRepository.findById(id);
    }

    public List<LabReport> getReportsByPatient(String patientId) {
        return labReportRepository.findByPatientId(patientId);
    }

    public List<LabReport> getReportsByDoctor(String doctorId) {
        return labReportRepository.findByDoctorId(doctorId);
    }

    public LabReport createReport(LabReport report) {
        return labReportRepository.save(report);
    }

    public LabReport updateReport(Long id, LabReport updatedReport) {

        return labReportRepository.findById(id)
                .map(existingReport -> {

                    existingReport.setPatientId(
                            updatedReport.getPatientId()
                    );

                    existingReport.setDoctorId(
                            updatedReport.getDoctorId()
                    );

                    existingReport.setTestName(
                            updatedReport.getTestName()
                    );

                    existingReport.setTestType(
                            updatedReport.getTestType()
                    );

                    existingReport.setResult(
                            updatedReport.getResult()
                    );

                    existingReport.setNormalRange(
                            updatedReport.getNormalRange()
                    );

                    existingReport.setUnit(
                            updatedReport.getUnit()
                    );

                    existingReport.setStatus(
                            updatedReport.getStatus()
                    );

                    existingReport.setReportDate(
                            updatedReport.getReportDate()
                    );

                    existingReport.setNotes(
                            updatedReport.getNotes()
                    );

                    return labReportRepository.save(existingReport);
                })
                .orElseThrow(() ->
                        new RuntimeException(
                                "Lab report not found with id: " + id
                        )
                );
    }

    public void deleteReport(Long id) {

        if (!labReportRepository.existsById(id)) {
            throw new RuntimeException(
                    "Lab report not found with id: " + id
            );
        }

        labReportRepository.deleteById(id);
    }
}