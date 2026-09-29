package com.hams.repo;

import com.hams.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientTypeAndRecipientIdOrderByCreatedAtDesc(
            String recipientType,
            String recipientId
    );

    List<Notification> findAllByOrderByCreatedAtDesc();
}