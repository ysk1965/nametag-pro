package com.nametagpro.service;

import com.nametagpro.dto.request.GoogleLoginRequest;
import com.nametagpro.dto.request.LoginRequest;
import com.nametagpro.dto.request.RegisterRequest;
import com.nametagpro.dto.response.AuthResponse;
import com.nametagpro.dto.response.UserResponse;
import com.nametagpro.entity.Project;
import com.nametagpro.entity.RefreshToken;
import com.nametagpro.entity.User;
import com.nametagpro.exception.AuthException;
import com.nametagpro.repository.ProjectRepository;
import com.nametagpro.repository.RefreshTokenRepository;
import com.nametagpro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ProjectRepository projectRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final GoogleAuthService googleAuthService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("이미 사용 중인 이메일입니다");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .authProvider(User.AuthProvider.LOCAL)
                .role(User.UserRole.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        user.setLastLoginAt(LocalDateTime.now());

        return createAuthResponse(user, true);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("이메일 또는 비밀번호가 올바르지 않습니다"));

        if (user.getAuthProvider() != User.AuthProvider.LOCAL) {
            throw new AuthException("소셜 로그인으로 가입된 계정입니다. " + user.getAuthProvider() + " 로그인을 이용해주세요");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException("이메일 또는 비밀번호가 올바르지 않습니다");
        }

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new AuthException("비활성화된 계정입니다");
        }

        user.setLastLoginAt(LocalDateTime.now());

        return createAuthResponse(user, false);
    }

    @Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleAuthService.GoogleUserInfo googleUser = googleAuthService.verifyIdToken(request.getIdToken());

        User user = userRepository.findByAuthProviderAndProviderId(User.AuthProvider.GOOGLE, googleUser.getSub())
                .orElse(null);

        boolean isNewUser = false;

        if (user == null) {
            User existingUserByEmail = userRepository.findByEmail(googleUser.getEmail()).orElse(null);
            if (existingUserByEmail != null) {
                throw new AuthException("이미 이메일로 가입된 계정이 있습니다. 이메일 로그인을 이용해주세요");
            }

            user = User.builder()
                    .email(googleUser.getEmail())
                    .name(googleUser.getName())
                    .profileImageUrl(googleUser.getPicture())
                    .authProvider(User.AuthProvider.GOOGLE)
                    .providerId(googleUser.getSub())
                    .role(User.UserRole.USER)
                    .status(User.UserStatus.ACTIVE)
                    .build();

            user = userRepository.save(user);
            isNewUser = true;
        }

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new AuthException("비활성화된 계정입니다");
        }

        user.setLastLoginAt(LocalDateTime.now());

        if (request.getMigrateSessionId() != null && !request.getMigrateSessionId().isBlank()) {
            migrateSessionProjects(request.getMigrateSessionId(), user.getId());
        }

        return createAuthResponse(user, isNewUser);
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new AuthException("유효하지 않은 Refresh Token입니다"));

        if (refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new AuthException("만료된 Refresh Token입니다");
        }

        User user = refreshToken.getUser();

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new AuthException("비활성화된 계정입니다");
        }

        refreshTokenRepository.delete(refreshToken);

        return createAuthResponse(user, false);
    }

    @Transactional
    public void logout(UUID userId, String refreshTokenStr) {
        if (refreshTokenStr != null && !refreshTokenStr.isBlank()) {
            refreshTokenRepository.deleteByToken(refreshTokenStr);
        }
    }

    @Transactional
    public void logoutAll(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional
    public int migrateSessionProjects(String sessionId, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AuthException("사용자를 찾을 수 없습니다"));

        List<Project> sessionProjects = projectRepository.findBySessionIdAndUserIsNull(sessionId);

        for (Project project : sessionProjects) {
            project.setUser(user);
            project.setSessionId(null);
        }

        return sessionProjects.size();
    }

    private AuthResponse createAuthResponse(User user, boolean isNewUser) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshTokenStr)
                .expiresAt(LocalDateTime.now().plusMillis(jwtService.getRefreshTokenExpirationMs()))
                .build();

        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenStr)
                .user(UserResponse.from(user))
                .newUser(isNewUser)
                .build();
    }
}
