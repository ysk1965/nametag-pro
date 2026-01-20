package com.nametagpro.dto.response;

import com.nametagpro.entity.Project;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProjectResponse {

    private UUID id;
    private String name;
    private String status;
    private String textConfig;
    private String exportConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
            .id(project.getId())
            .name(project.getName())
            .status(project.getStatus().name().toLowerCase())
            .textConfig(project.getTextConfig())
            .exportConfig(project.getExportConfig())
            .createdAt(project.getCreatedAt())
            .updatedAt(project.getUpdatedAt())
            .build();
    }
}
