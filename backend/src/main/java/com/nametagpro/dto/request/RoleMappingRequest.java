package com.nametagpro.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class RoleMappingRequest {

    @NotEmpty(message = "매핑 정보가 필요합니다")
    private List<RoleMapping> mappings;

    @Data
    public static class RoleMapping {
        private String role;
        private UUID templateId;
    }
}
