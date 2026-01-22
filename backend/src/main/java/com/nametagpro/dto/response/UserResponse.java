package com.nametagpro.dto.response;

import com.nametagpro.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;
    private String email;
    private String name;
    private String profileImageUrl;
    private String authProvider;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId().toString())
                .email(user.getEmail())
                .name(user.getName())
                .profileImageUrl(user.getProfileImageUrl())
                .authProvider(user.getAuthProvider().name())
                .build();
    }
}
