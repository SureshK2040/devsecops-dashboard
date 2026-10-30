package com.devops.dashboard.auth;

import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.user.Role;
import com.devops.dashboard.user.User;
import com.devops.dashboard.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("testdev", "testdev@devsecops.local", "encodedSecret", "Test", "Dev", Role.DEVELOPER);
        sampleUser.setId(10L);
    }

    @Test
    void testLoginSuccess() {
        when(userRepository.findByUsername("testdev")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(any(), any())).thenReturn("mockJwtToken");
        when(jwtService.generateRefreshToken(any())).thenReturn("mockRefreshToken");

        AuthDtos.LoginRequest req = new AuthDtos.LoginRequest("testdev", "password123");
        AuthDtos.AuthResponse response = authService.login(req, "127.0.0.1");

        assertNotNull(response);
        assertEquals("mockJwtToken", response.accessToken());
        assertEquals("mockRefreshToken", response.refreshToken());
        verify(auditService).log(eq("USER_LOGIN"), eq("User"), eq("10"), any(), any());
    }

    @Test
    void testLoginInvalidPasswordThrowsBadCredentials() {
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager)
                .authenticate(any());

        AuthDtos.LoginRequest req = new AuthDtos.LoginRequest("testdev", "wrongpassword");
        assertThrows(BadCredentialsException.class, () -> authService.login(req, "127.0.0.1"));
        verifyNoInteractions(jwtService);
    }

    @Test
    void testLoginUnknownUserThrowsBadCredentials() {
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager)
                .authenticate(any());

        AuthDtos.LoginRequest req = new AuthDtos.LoginRequest("unknownUser", "password123");
        assertThrows(BadCredentialsException.class, () -> authService.login(req, "127.0.0.1"));
        verifyNoInteractions(jwtService);
    }

    @Test
    void testRegisterDuplicateUsernameThrowsException() {
        when(userRepository.existsByUsername("existingUser")).thenReturn(true);

        AuthDtos.RegisterRequest req = new AuthDtos.RegisterRequest(
                "existingUser", "new@test.com", "pass123", "First", "Last"
        );

        assertThrows(IllegalArgumentException.class, () -> authService.register(req, "127.0.0.1"));
    }
}

