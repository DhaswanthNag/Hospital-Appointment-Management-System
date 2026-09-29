package com.hams.controller;

import com.hams.model.Notification;
import com.hams.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    /*
     * Get all notifications.
     * Used by Admin Notifications panel.
     */
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {

        return ResponseEntity.ok(
                notificationService.getAllNotifications()
        );
    }

    /*
     * Get notifications for a specific doctor.
     *
     * Example:
     * /api/notifications/doctor/DOC001
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Notification>> getDoctorNotifications(
            @PathVariable String doctorId
    ) {

        return ResponseEntity.ok(
                notificationService.getNotificationsForRecipient(
                        "DOCTOR",
                        doctorId
                )
        );
    }

    /*
     * Get notifications for a specific patient.
     *
     * Example:
     * /api/notifications/patient/PAT005
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Notification>> getPatientNotifications(
            @PathVariable String patientId
    ) {

        return ResponseEntity.ok(
                notificationService.getNotificationsForRecipient(
                        "PATIENT",
                        patientId
                )
        );
    }

    /*
     * Create notification.
     */
    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestBody Notification notification
    ) {

        return ResponseEntity.ok(
                notificationService.createNotification(
                        notification
                )
        );
    }

    /*
     * Mark notification as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                notificationService.markAsRead(id)
        );
    }

    /*
     * Delete notification.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id
    ) {

        notificationService.deleteNotification(id);

        return ResponseEntity.noContent().build();
    }
}