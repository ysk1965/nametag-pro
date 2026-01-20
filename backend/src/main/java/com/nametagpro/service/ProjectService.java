package com.nametagpro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nametagpro.dto.request.ProjectUpdateRequest;
import com.nametagpro.entity.Project;
import com.nametagpro.exception.ResourceNotFoundException;
import com.nametagpro.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ObjectMapper objectMapper;

    private static final String DEFAULT_TEXT_CONFIG = """
        {
            "position": {"x": 50, "y": 50, "anchor": "center"},
            "style": {"fontFamily": "Inter", "fontSize": 36, "fontWeight": 700, "color": "#000000"}
        }
        """;

    private static final String DEFAULT_EXPORT_CONFIG = """
        {
            "paperSize": "A4",
            "layout": "2x2",
            "margin": 10,
            "dpi": 300
        }
        """;

    @Transactional
    public Project createProject(String sessionId, String name) {
        Project project = Project.builder()
            .sessionId(sessionId)
            .name(name)
            .status(Project.ProjectStatus.DRAFT)
            .textConfig(DEFAULT_TEXT_CONFIG)
            .exportConfig(DEFAULT_EXPORT_CONFIG)
            .build();

        return projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public Project getProject(UUID projectId, String sessionId) {
        return projectRepository.findBySessionIdAndId(sessionId, projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    @Transactional(readOnly = true)
    public List<Project> getProjects(String sessionId) {
        return projectRepository.findBySessionIdOrderByCreatedAtDesc(sessionId);
    }

    @Transactional
    public Project updateProject(UUID projectId, String sessionId, ProjectUpdateRequest request) {
        Project project = getProject(projectId, sessionId);

        if (request.getName() != null) {
            project.setName(request.getName());
        }

        if (request.getTextConfig() != null) {
            try {
                project.setTextConfig(objectMapper.writeValueAsString(request.getTextConfig()));
            } catch (Exception e) {
                log.error("Failed to serialize text config", e);
            }
        }

        if (request.getExportConfig() != null) {
            try {
                project.setExportConfig(objectMapper.writeValueAsString(request.getExportConfig()));
            } catch (Exception e) {
                log.error("Failed to serialize export config", e);
            }
        }

        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(UUID projectId, String sessionId) {
        Project project = getProject(projectId, sessionId);
        projectRepository.delete(project);
    }
}
