
package com.studenttracker.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(
            AdminUserRepository repository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    // ==========================================
    // 1. REGISTER ADMINISTRATOR
    // ==========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody AuthRequest request) {

        if (request == null ||
            request.username() == null ||
            request.username().isBlank() ||
            request.password() == null ||
            request.password().length() < 4) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "message",
                    "Username required; password must be at least 4 characters"
                )
            );
        }

        // Allow registration only when no administrator exists.
        // For production, use a controlled provisioning
        // process to avoid concurrent first registrations.
        if (repository.count() > 0) {

            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(
                    Map.of(
                        "message",
                        "Administrator already registered"
                    )
                );
        }

        AdminUser admin = new AdminUser();

        admin.setUsername(request.username().trim());

        // Store BCrypt hash, never the actual password.
        admin.setPassword(
            passwordEncoder.encode(request.password())
        );

        repository.save(admin);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(
                Map.of(
                    "message",
                    "Administrator registered successfully"
                )
            );
    }

    // ==========================================
    // 2. LOGIN ADMINISTRATOR
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AuthRequest request,
            HttpServletRequest servletRequest) {

        if (request == null ||
            request.username() == null ||
            request.password() == null) {

            return ResponseEntity.badRequest().body(
                Map.of(
                    "message",
                    "Username and password are required"
                )
            );
        }

        // Verify username and BCrypt password.
        Authentication authentication =
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.username(),
                    request.password()
                )
            );

        // Create a new authenticated security context.
        SecurityContext context =
            SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);

        SecurityContextHolder.setContext(context);

        // IMPORTANT FIX:
        // A session must exist before its ID is changed.
        HttpSession session = servletRequest.getSession(true);

        // Rotate session ID to protect against session fixation.
        servletRequest.changeSessionId();

        // Persist authentication in the HTTP session.
        session.setAttribute(
            HttpSessionSecurityContextRepository
                .SPRING_SECURITY_CONTEXT_KEY,
            context
        );

        return ResponseEntity.ok(
            Map.of(
                "message", "Login successful",
                "username", authentication.getName()
            )
        );
    }

    // ==========================================
    // 3. CHECK CURRENT LOGGED-IN USER
    // ==========================================

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            Authentication authentication) {

        if (authentication == null ||
            !authentication.isAuthenticated() ||
            "anonymousUser".equals(authentication.getPrincipal())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(
                    Map.of(
                        "message",
                        "Not authenticated"
                    )
                );
        }

        return ResponseEntity.ok(
            Map.of(
                "username",
                authentication.getName()
            )
        );
    }

    // ==========================================
    // 4. LOGOUT ADMINISTRATOR
    // ==========================================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request) {

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
            Map.of(
                "message",
                "Logged out successfully"
            )
        );
    }
}
