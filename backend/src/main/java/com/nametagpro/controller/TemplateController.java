package com.nametagpro.controller;

import com.nametagpro.dto.response.TemplateResponse;
import com.nametagpro.entity.Project;
import com.nametagpro.entity.Template;
import com.nametagpro.service.ProjectService;
import com.nametagpro.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;
    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadTemplates(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId,
            @RequestParam("files") List<MultipartFile> files) throws IOException {

        Project project = projectService.getProject(projectId, sessionId);
        List<Template> templates = templateService.uploadTemplates(project, files);

        var response = templates.stream()
            .map(TemplateResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("templates", response));
    }

    @PutMapping("/{templateId}")
    public ResponseEntity<Map<String, Object>> updateTemplate(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId,
            @PathVariable UUID templateId,
            @RequestBody Map<String, String> request) {

        // Verify project ownership
        projectService.getProject(projectId, sessionId);

        Template template = templateService.updateTemplateRole(templateId, request.get("role"));

        return ResponseEntity.ok(Map.of("template", TemplateResponse.from(template)));
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> deleteTemplate(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId,
            @PathVariable UUID templateId) {

        // Verify project ownership
        projectService.getProject(projectId, sessionId);

        templateService.deleteTemplate(templateId);

        return ResponseEntity.noContent().build();
    }
}
