package com.nametagpro.service;

import com.nametagpro.exception.AuthException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    @Value("${google.client-id:}")
    private String googleClientId;

    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    public GoogleUserInfo verifyIdToken(String idToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(
                    GOOGLE_TOKEN_INFO_URL + idToken,
                    Map.class
            );

            if (response == null) {
                throw new AuthException("Google 인증에 실패했습니다");
            }

            String aud = (String) response.get("aud");
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(aud)) {
                throw new AuthException("유효하지 않은 Google 클라이언트입니다");
            }

            GoogleUserInfo userInfo = new GoogleUserInfo();
            userInfo.setSub((String) response.get("sub"));
            userInfo.setEmail((String) response.get("email"));
            userInfo.setName((String) response.get("name"));
            userInfo.setPicture((String) response.get("picture"));
            userInfo.setEmailVerified("true".equals(response.get("email_verified")));

            if (!userInfo.isEmailVerified()) {
                throw new AuthException("이메일 인증이 완료되지 않은 Google 계정입니다");
            }

            return userInfo;
        } catch (AuthException e) {
            throw e;
        } catch (Exception e) {
            throw new AuthException("Google 토큰 검증에 실패했습니다: " + e.getMessage());
        }
    }

    @Data
    public static class GoogleUserInfo {
        private String sub;
        private String email;
        private String name;
        private String picture;
        private boolean emailVerified;
    }
}
