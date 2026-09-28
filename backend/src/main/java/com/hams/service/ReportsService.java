package com.hams.service;

import com.hams.dto.ReportsAnalyticsResponse;
import com.hams.model.Appointment;
import com.hams.model.Doctor;
import com.hams.model.Patient;
import com.hams.repo.AppointmentRepository;
import com.hams.repo.DoctorRepository;
import com.hams.repo.PatientRepository;
import com.hams.repo.PrescriptionRepository;
import com.hams.repo.LabReportRepository;
import com.hams.repo.MedicalRecordRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ReportsService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final LabReportRepository labReportRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public ReportsService(
            DoctorRepository doctorRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PrescriptionRepository prescriptionRepository,
            LabReportRepository labReportRepository,
            MedicalRecordRepository medicalRecordRepository
    ) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.labReportRepository = labReportRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    public ReportsAnalyticsResponse getAnalytics() {

        List<Doctor> doctors = doctorRepository.findAll();
        List<Patient> patients = patientRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();

        ReportsAnalyticsResponse response =
                new ReportsAnalyticsResponse();

        response.setTotalDoctors(doctors.size());
        response.setTotalPatients(patients.size());
        response.setTotalAppointments(appointments.size());
        response.setTotalPrescriptions(
                prescriptionRepository.count()
        );
        response.setTotalLabReports(
                labReportRepository.count()
        );
        response.setTotalMedicalRecords(
                medicalRecordRepository.count()
        );

        /*
         * ---------------------------------------------------------
         * APPOINTMENT STATUS SUMMARY
         * ---------------------------------------------------------
         */

        Map<String, Long> statusSummary =
                appointments.stream()
                        .map(Appointment::getStatus)
                        .filter(Objects::nonNull)
                        .map(status -> status.trim().toUpperCase())
                        .collect(
                                Collectors.groupingBy(
                                        Function.identity(),
                                        LinkedHashMap::new,
                                        Collectors.counting()
                                )
                        );

        response.setAppointmentStatusSummary(
                statusSummary
        );

        /*
         * ---------------------------------------------------------
         * DOCTOR APPOINTMENT REPORT
         * ---------------------------------------------------------
         */

        Map<String, Doctor> doctorMap =
                doctors.stream()
                        .filter(doctor -> doctor.getId() != null)
                        .collect(
                                Collectors.toMap(
                                        Doctor::getId,
                                        Function.identity(),
                                        (first, second) -> first
                                )
                        );

        Map<String, Long> doctorAppointmentCounts =
                appointments.stream()
                        .map(Appointment::getDoctorId)
                        .filter(Objects::nonNull)
                        .collect(
                                Collectors.groupingBy(
                                        Function.identity(),
                                        Collectors.counting()
                                )
                        );

        List<ReportsAnalyticsResponse.DoctorAppointmentReport>
                doctorReports = doctorAppointmentCounts.entrySet()
                .stream()
                .map(entry -> {

                    Doctor doctor =
                            doctorMap.get(entry.getKey());

                    String doctorName =
                            doctor != null
                                    ? doctor.getName()
                                    : "Unknown Doctor";

                    return new ReportsAnalyticsResponse
                            .DoctorAppointmentReport(
                                    entry.getKey(),
                                    doctorName,
                                    entry.getValue()
                            );
                })
                .sorted(
                        Comparator.comparingLong(
                                ReportsAnalyticsResponse
                                        .DoctorAppointmentReport
                                        ::getAppointmentCount
                        ).reversed()
                )
                .limit(10)
                .collect(Collectors.toList());

        response.setDoctorAppointments(
                doctorReports
        );

        /*
         * ---------------------------------------------------------
         * PATIENT APPOINTMENT REPORT
         * ---------------------------------------------------------
         */

        Map<String, Patient> patientMap =
                patients.stream()
                        .filter(patient -> patient.getPatientId() != null)
                        .collect(
                                Collectors.toMap(
                                        Patient::getPatientId,
                                        Function.identity(),
                                        (first, second) -> first
                                )
                        );

        Map<String, Long> patientAppointmentCounts =
                appointments.stream()
                        .map(Appointment::getPatientId)
                        .filter(Objects::nonNull)
                        .collect(
                                Collectors.groupingBy(
                                        Function.identity(),
                                        Collectors.counting()
                                )
                        );

        List<ReportsAnalyticsResponse.PatientAppointmentReport>
                patientReports =
                patientAppointmentCounts.entrySet()
                        .stream()
                        .map(entry -> {

                            Patient patient =
                                    patientMap.get(entry.getKey());

                            String patientName =
                                    patient != null
                                            ? patient.getFullName()
                                            : "Unknown Patient";

                            return new ReportsAnalyticsResponse
                                    .PatientAppointmentReport(
                                            entry.getKey(),
                                            patientName,
                                            entry.getValue()
                                    );
                        })
                        .sorted(
                                Comparator.comparingLong(
                                        ReportsAnalyticsResponse
                                                .PatientAppointmentReport
                                                ::getAppointmentCount
                                ).reversed()
                        )
                        .limit(10)
                        .collect(Collectors.toList());

        response.setPatientAppointments(
                patientReports
        );

        /*
         * ---------------------------------------------------------
         * RECENT APPOINTMENTS
         * ---------------------------------------------------------
         */

        List<ReportsAnalyticsResponse.RecentAppointmentReport>
                recentAppointments =
                appointments.stream()
                        .limit(10)
                        .map(appointment -> {

                            Doctor doctor =
                                    doctorMap.get(
                                            appointment.getDoctorId()
                                    );

                            Patient patient =
                                    patientMap.get(
                                            appointment.getPatientId()
                                    );

                            return new ReportsAnalyticsResponse
                                    .RecentAppointmentReport(
                                            appointment.getAppointmentId(),
                                            appointment.getDoctorId(),
                                            appointment.getPatientId(),
                                            doctor != null
                                                    ? doctor.getName()
                                                    : "Unknown Doctor",
                                            patient != null
                                                    ? patient.getFullName()
                                                    : "Unknown Patient",
                                            appointment.getStatus()
                                    );
                        })
                        .collect(Collectors.toList());

        response.setRecentAppointments(
                recentAppointments
        );

        return response;
    }
}