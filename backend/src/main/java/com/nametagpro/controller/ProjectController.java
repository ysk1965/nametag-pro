package com.nametagpro.controller;

import com.nametagpro.dto.request.ProjectCreateRequest;
import com.nametagpro.dto.request.ProjectUpdateRequest;
import com.nametagpro.dto.response.*;
import com.nametagpro.entity.Project;
import com.nametagpro.entity.Roster;
import com.nametagpro.service.ProjectService;
import com.nametagpro.service.RosterService;
import com.nametagpro.service.TemplateService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final TemplateService templateService;
    private final RosterService rosterService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createProject(
            @CookieValue(name = "session_id", required = false) String sessionId,
            @RequestBody @Valid ProjectCreateRequest request,
            HttpServletResponse response) {

        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
            Cookie cookie = new Cookie("session_id", sessionId);
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(60 * 60 * 24 * 7); // 7 days
            response.addCookie(cookie);
        }

        Project project = projectService.createProject(sessionId, request.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("project", ProjectResponse.from(project)));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> getProject(
            @CookieValue(name = "session_id", required = false) String sessionId,
            @PathVariable UUID projectId) {

        if (sessionId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Session not found"));
        }

        Project project = projectService.getProject(projectId, sessionId);
        var templates = templateService.getTemplates(projectId)
            .stream()
            .map(TemplateResponse::from)
            .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("project", ProjectResponse.from(project));
        result.put("templates", templates);

        try {
            Roster roster = rosterService.getRoster(projectId);
            var persons = rosterService.getPersons(roster.getId())
                .stream()
                .map(PersonResponse::from)
                .collect(Collectors.toList());

            result.put("roster", RosterResponse.from(roster, parseColumns(roster.getColumns())));
            result.put("persons", persons);
        } catch (Exception e) {
            result.put("roster", null);
            result.put("persons", List.of());
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<Map<String, Object>> updateProject(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId,
            @RequestBody ProjectUpdateRequest request) {

        Project project = projectService.updateProject(projectId, sessionId, request);

        return ResponseEntity.ok(Map.of("project", ProjectResponse.from(project)));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId) {

        projectService.deleteProject(projectId, sessionId);
        return ResponseEntity.noContent().build();
    }

    private List<String> parseColumns(String columnsJson) {
        try {
            return Arrays.asList(columnsJson.replace("[", "").replace("]", "")
                .replace("\"", "").split(","));
        } catch (Exception e) {
            return List.of();
        }
    }
}
