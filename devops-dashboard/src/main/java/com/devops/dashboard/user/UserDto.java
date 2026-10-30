package com.devops.dashboard.user;

import java.time.LocalDateTime;

public record UserDto(
        Long id,
        String username,
        String email,
        String firstName,
        String lastName,
        Role role,
        boolean enabled,
        LocalDateTime createdAt
) {
    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}

