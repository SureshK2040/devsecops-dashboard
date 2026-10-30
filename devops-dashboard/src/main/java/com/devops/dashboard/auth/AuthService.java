package com.devops.dashboard.auth;

import com.devops.dashboard.audit.AuditService;
import com.devops.dashboard.common.ResourceNotFoundException;
import com.devops.dashboard.user.Role;
import com.devops.dashboard.user.User;
import com.devops.dashboard.user.UserDto;
import com.devops.dashboard.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.auditService = auditService;
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request, String ipAddress) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        User user = userRepository.findByUsername(request.username())
                .or(() -> userRepository.findByEmail(request.username()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .disabled(!user.isEnabled())
                .build();

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        String token = jwtService.generateToken(userDetails, claims);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        auditService.log("USER_LOGIN", "User", String.valueOf(user.getId()), "User " + user.getUsername() + " logged in", ipAddress);

        return AuthDtos.AuthResponse.of(token, refreshToken, jwtExpirationMs, UserDto.fromEntity(user));
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request, String ipAddress) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = new User(
                request.username(),
                request.email(),
                passwordEncoder.encode(request.password()),
                request.firstName(),
                request.lastName(),
                Role.DEVELOPER
        );

        User savedUser = userRepository.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(savedUser.getUsername())
                .password(savedUser.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + savedUser.getRole().name())))
                .build();

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", savedUser.getRole().name());
        claims.put("userId", savedUser.getId());

        String token = jwtService.generateToken(userDetails, claims);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        auditService.log("USER_CREATED", "User", String.valueOf(savedUser.getId()), "Registered new account " + savedUser.getUsername(), ipAddress);

        return AuthDtos.AuthResponse.of(token, refreshToken, jwtExpirationMs, UserDto.fromEntity(savedUser));
    }

    public AuthDtos.AuthResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .build();

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new BadCredentialsException("Invalid or expired refresh token");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());

        String newAccessToken = jwtService.generateToken(userDetails, claims);
        return AuthDtos.AuthResponse.of(newAccessToken, refreshToken, jwtExpirationMs, UserDto.fromEntity(user));
    }

    public UserDto getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadCredentialsException("Not authenticated");
        }
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", authentication.getName()));
        return UserDto.fromEntity(user);
    }
}

