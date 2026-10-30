package com.devops.dashboard.user;

import com.devops.dashboard.common.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users and roles")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get all users (list or paginated)")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(required = false, defaultValue = "false") boolean paginated,
            @PageableDefault(size = 20) Pageable pageable) {
        if (paginated) {
            return ResponseEntity.ok(userService.getUsersPaginated(pageable));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user role (Admin only)")
    public ResponseEntity<UserDto> updateUserRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enable or disable user account (Admin only)")
    public ResponseEntity<UserDto> toggleUserStatus(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(userService.toggleUserStatus(id, enabled));
    }
}

