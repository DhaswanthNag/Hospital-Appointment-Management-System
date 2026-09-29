package com.hams.service;

import com.hams.model.Notification;
import com.hams.repo.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getNotificationsForRecipient(
            String recipientType,
            String recipientId
    ) {
        return notificationRepository
                .findByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(
                        recipientType,
                        recipientId
                );
    }

    public Notification createNotification(
            Notification notification
    ) {
        if (notification.getRecipientType() == null ||
                notification.getRecipientType().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Recipient type is required"
            );
        }

        if (notification.getRecipientId() == null ||
                notification.getRecipientId().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Recipient ID is required"
            );
        }

        if (notification.getTitle() == null ||
                notification.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Notification title is required"
            );
        }

        if (notification.getMessage() == null ||
                notification.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Notification message is required"
            );
        }

        notification.setRecipientType(
                notification.getRecipientType()
                        .trim()
                        .toUpperCase()
        );

        notification.setRecipientId(
                notification.getRecipientId().trim()
        );

        notification.setTitle(
                notification.getTitle().trim()
        );

        notification.setMessage(
                notification.getMessage().trim()
        );

        if (notification.getType() == null ||
                notification.getType().trim().isEmpty()) {

            notification.setType("INFO");

        } else {

            notification.setType(
                    notification.getType()
                            .trim()
                            .toUpperCase()
            );
        }

        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Long id) {

        Notification notification =
                notificationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Notification not found"
                                )
                        );

        notification.setRead(true);

        return notificationRepository.save(notification);
    }

    public void deleteNotification(Long id) {

        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException(
                    "Notification not found"
            );
        }

        notificationRepository.deleteById(id);
    }
}