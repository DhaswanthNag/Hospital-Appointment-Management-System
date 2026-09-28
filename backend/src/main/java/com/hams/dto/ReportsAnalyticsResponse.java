package com.hams.dto;

import java.util.List;
import java.util.Map;

public class ReportsAnalyticsResponse {

    private long totalDoctors;
    private long totalPatients;
    private long totalAppointments;
    private long totalPrescriptions;
    private long totalLabReports;
    private long totalMedicalRecords;

    private Map<String, Long> appointmentStatusSummary;

    private List<DoctorAppointmentReport> doctorAppointments;

    private List<PatientAppointmentReport> patientAppointments;

    private List<RecentAppointmentReport> recentAppointments;

    public ReportsAnalyticsResponse() {
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getTotalPrescriptions() {
        return totalPrescriptions;
    }

    public void setTotalPrescriptions(long totalPrescriptions) {
        this.totalPrescriptions = totalPrescriptions;
    }

    public long getTotalLabReports() {
        return totalLabReports;
    }

    public void setTotalLabReports(long totalLabReports) {
        this.totalLabReports = totalLabReports;
    }

    public long getTotalMedicalRecords() {
        return totalMedicalRecords;
    }

    public void setTotalMedicalRecords(long totalMedicalRecords) {
        this.totalMedicalRecords = totalMedicalRecords;
    }

    public Map<String, Long> getAppointmentStatusSummary() {
        return appointmentStatusSummary;
    }

    public void setAppointmentStatusSummary(
            Map<String, Long> appointmentStatusSummary
    ) {
        this.appointmentStatusSummary = appointmentStatusSummary;
    }

    public List<DoctorAppointmentReport> getDoctorAppointments() {
        return doctorAppointments;
    }

    public void setDoctorAppointments(
            List<DoctorAppointmentReport> doctorAppointments
    ) {
        this.doctorAppointments = doctorAppointments;
    }

    public List<PatientAppointmentReport> getPatientAppointments() {
        return patientAppointments;
    }

    public void setPatientAppointments(
            List<PatientAppointmentReport> patientAppointments
    ) {
        this.patientAppointments = patientAppointments;
    }

    public List<RecentAppointmentReport> getRecentAppointments() {
        return recentAppointments;
    }

    public void setRecentAppointments(
            List<RecentAppointmentReport> recentAppointments
    ) {
        this.recentAppointments = recentAppointments;
    }

    public static class DoctorAppointmentReport {

        private String doctorId;
        private String doctorName;
        private long appointmentCount;

        public DoctorAppointmentReport() {
        }

        public DoctorAppointmentReport(
                String doctorId,
                String doctorName,
                long appointmentCount
        ) {
            this.doctorId = doctorId;
            this.doctorName = doctorName;
            this.appointmentCount = appointmentCount;
        }

        public String getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(String doctorId) {
            this.doctorId = doctorId;
        }

        public String getDoctorName() {
            return doctorName;
        }

        public void setDoctorName(String doctorName) {
            this.doctorName = doctorName;
        }

        public long getAppointmentCount() {
            return appointmentCount;
        }

        public void setAppointmentCount(long appointmentCount) {
            this.appointmentCount = appointmentCount;
        }
    }

    public static class PatientAppointmentReport {

        private String patientId;
        private String patientName;
        private long appointmentCount;

        public PatientAppointmentReport() {
        }

        public PatientAppointmentReport(
                String patientId,
                String patientName,
                long appointmentCount
        ) {
            this.patientId = patientId;
            this.patientName = patientName;
            this.appointmentCount = appointmentCount;
        }

        public String getPatientId() {
            return patientId;
        }

        public void setPatientId(String patientId) {
            this.patientId = patientId;
        }

        public String getPatientName() {
            return patientName;
        }

        public void setPatientName(String patientName) {
            this.patientName = patientName;
        }

        public long getAppointmentCount() {
            return appointmentCount;
        }

        public void setAppointmentCount(long appointmentCount) {
            this.appointmentCount = appointmentCount;
        }
    }

    public static class RecentAppointmentReport {

        private String appointmentId;
        private String doctorId;
        private String patientId;
        private String doctorName;
        private String patientName;
        private String status;

        public RecentAppointmentReport() {
        }

        public RecentAppointmentReport(
                String appointmentId,
                String doctorId,
                String patientId,
                String doctorName,
                String patientName,
                String status
        ) {
            this.appointmentId = appointmentId;
            this.doctorId = doctorId;
            this.patientId = patientId;
            this.doctorName = doctorName;
            this.patientName = patientName;
            this.status = status;
        }

        public String getAppointmentId() {
            return appointmentId;
        }

        public void setAppointmentId(String appointmentId) {
            this.appointmentId = appointmentId;
        }

        public String getDoctorId() {
            return doctorId;
        }

        public void setDoctorId(String doctorId) {
            this.doctorId = doctorId;
        }

        public String getPatientId() {
            return patientId;
        }

        public void setPatientId(String patientId) {
            this.patientId = patientId;
        }

        public String getDoctorName() {
            return doctorName;
        }

        public void setDoctorName(String doctorName) {
            this.doctorName = doctorName;
        }

        public String getPatientName() {
            return patientName;
        }

        public void setPatientName(String patientName) {
            this.patientName = patientName;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}