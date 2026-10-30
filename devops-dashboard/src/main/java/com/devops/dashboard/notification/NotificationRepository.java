package com.devops.dashboard.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UsernameOrderByCreatedAtDesc(String username);
    List<Notification> findTop20ByOrderByCreatedAtDesc();
    long countByUser_UsernameAndIsReadFalse(String username);
}

