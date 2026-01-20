package com.nametagpro.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nametagpro.dto.request.RoleMappingRequest;
import com.nametagpro.dto.response.PersonResponse;
import com.nametagpro.dto.response.RosterResponse;
import com.nametagpro.entity.Person;
import com.nametagpro.entity.Project;
import com.nametagpro.entity.Roster;
import com.nametagpro.service.ProjectService;
import com.nametagpro.service.RosterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/roster")
@RequiredArgsConstructor
public class RosterController {

    private final RosterService rosterService;
    private final ProjectService projectService;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadRoster(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId,
            @RequestParam("file") MultipartFile file) throws IOException {

        Project project = projectService.getProject(projectId, sessionId);
        Roster roster = rosterService.uploadRoster(project, file);
        List<Person> persons = rosterService.getPersons(roster.getId());

        var personResponses = persons.stream()
            .map(PersonResponse::from)
            .collect(Collectors.toList());

        // Calculate role counts
        Map<String, Long> roleCounts = persons.stream()
            .filter(p -> p.getRole() != null && !p.getRole().isBlank())
            .collect(Collectors.groupingBy(Person::getRole, Collectors.counting()));

        List<Map<String, Object>> roleCountList = roleCounts.entrySet().stream()
            .map(e -> Map.of("role", (Object) e.getKey(), "count", (Object) e.getValue()))
            .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of(
                "roster", RosterResponse.from(roster, parseColumns(roster.getColumns())),
                "persons", personResponses,
                "roleCounts", roleCountList
            ));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getRoster(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId) {

        projectService.getProject(projectId, sessionId);
        Roster roster = rosterService.getRoster(projectId);
        List<Person> persons = rosterService.getPersons(roster.getId());

        var personResponses = persons.stream()
            .map(PersonResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "roster", RosterResponse.from(roster, parseColumns(roster.getColumns())),
            "persons", personResponses
        ));
    }

    @PutMapping("/mapping")
    public ResponseEntity<Map<String, Object>> updateRoleMapping(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId,
            @RequestBody @Valid RoleMappingRequest request) {

        projectService.getProject(projectId, sessionId);

        List<Map.Entry<String, UUID>> mappings = request.getMappings().stream()
            .map(m -> Map.entry(m.getRole(), m.getTemplateId()))
            .collect(Collectors.toList());

        List<Person> persons = rosterService.updateRoleMapping(projectId, mappings);

        var personResponses = persons.stream()
            .map(PersonResponse::from)
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("persons", personResponses));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteRoster(
            @CookieValue(name = "session_id") String sessionId,
            @PathVariable UUID projectId) {

        projectService.getProject(projectId, sessionId);
        rosterService.deleteRoster(projectId);

        return ResponseEntity.noContent().build();
    }

    private List<String> parseColumns(String columnsJson) {
        try {
            return objectMapper.readValue(columnsJson,
                objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return List.of();
        }
    }
}
