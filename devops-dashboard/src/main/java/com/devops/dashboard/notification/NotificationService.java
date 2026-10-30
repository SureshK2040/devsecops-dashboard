package com.devops.dashboard.notification;

import com.devops.dashboard.common.ResourceNotFoundException;
import com.devops.dashboard.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(User user, String type, String title, String message, String link) {
        Notification notification = new Notification(user, type, title, message, link);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(String username) {
        if (username != null) {
            List<Notification> userSpecific = notificationRepository.findByUser_UsernameOrderByCreatedAtDesc(username);
            if (!userSpecific.isEmpty()) {
                return userSpecific;
            }
        }
        return notificationRepository.findTop20ByOrderByCreatedAtDesc();
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String username) {
        List<Notification> notifications = notificationRepository.findByUser_UsernameOrderByCreatedAtDesc(username);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}

