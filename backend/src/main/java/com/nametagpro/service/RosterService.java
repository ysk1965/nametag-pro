package com.nametagpro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nametagpro.entity.Person;
import com.nametagpro.entity.Project;
import com.nametagpro.entity.Roster;
import com.nametagpro.entity.Template;
import com.nametagpro.exception.ResourceNotFoundException;
import com.nametagpro.exception.ValidationException;
import com.nametagpro.repository.PersonRepository;
import com.nametagpro.repository.RosterRepository;
import com.nametagpro.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RosterService {

    private final RosterRepository rosterRepository;
    private final PersonRepository personRepository;
    private final TemplateRepository templateRepository;
    private final ObjectMapper objectMapper;

    private static final List<String> NAME_PATTERNS = List.of("이름", "name", "성명", "참가자", "참석자");
    private static final List<String> ROLE_PATTERNS = List.of("역할", "role", "직분", "구분", "직책", "그룹", "소속");

    @Transactional
    public Roster uploadRoster(Project project, MultipartFile file) throws IOException {
        // Delete existing roster if present
        rosterRepository.findByProjectId(project.getId())
            .ifPresent(roster -> {
                personRepository.deleteByRosterId(roster.getId());
                rosterRepository.delete(roster);
            });

        // Parse Excel file
        List<Map<String, String>> rows = parseExcelFile(file);

        if (rows.isEmpty()) {
            throw new ValidationException("파일에 데이터가 없습니다");
        }

        // Get columns and detect name/role columns
        List<String> columns = new ArrayList<>(rows.get(0).keySet());
        String nameColumn = detectColumn(columns, NAME_PATTERNS);
        String roleColumn = detectColumn(columns, ROLE_PATTERNS);

        // Create Roster entity
        Roster roster = Roster.builder()
            .project(project)
            .fileName(file.getOriginalFilename())
            .columns(serializeColumns(columns))
            .nameColumn(nameColumn)
            .roleColumn(roleColumn)
            .totalCount(rows.size())
            .build();
        roster = rosterRepository.save(roster);

        // Create Person entities
        List<Person> persons = new ArrayList<>();
        int order = 0;
        for (Map<String, String> row : rows) {
            String name = row.get(nameColumn);
            if (name == null || name.isBlank()) continue;

            Person person = Person.builder()
                .roster(roster)
                .name(name.trim())
                .role(roleColumn != null ? row.get(roleColumn) : null)
                .sortOrder(order++)
                .build();
            persons.add(person);
        }
        personRepository.saveAll(persons);

        roster.setPersons(persons);
        roster.setTotalCount(persons.size());

        return rosterRepository.save(roster);
    }

    @Transactional(readOnly = true)
    public Roster getRoster(UUID projectId) {
        return rosterRepository.findByProjectId(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Roster not found"));
    }

    @Transactional(readOnly = true)
    public List<Person> getPersons(UUID rosterId) {
        return personRepository.findByRosterIdOrderBySortOrderAsc(rosterId);
    }

    @Transactional
    public List<Person> updateRoleMapping(UUID projectId, List<Map.Entry<String, UUID>> mappings) {
        Roster roster = getRoster(projectId);
        List<Person> persons = getPersons(roster.getId());
        List<Template> templates = templateRepository.findByProjectIdOrderBySortOrderAsc(projectId);

        Map<UUID, Template> templateMap = templates.stream()
            .collect(Collectors.toMap(Template::getId, t -> t));

        Map<String, UUID> roleToTemplateId = mappings.stream()
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        for (Person person : persons) {
            if (person.getRole() != null && roleToTemplateId.containsKey(person.getRole())) {
                UUID templateId = roleToTemplateId.get(person.getRole());
                person.setTemplate(templateMap.get(templateId));
            } else if (!templates.isEmpty()) {
                // Default to first template if no role mapping
                person.setTemplate(templates.get(0));
            }
        }

        return personRepository.saveAll(persons);
    }

    @Transactional
    public void deleteRoster(UUID projectId) {
        rosterRepository.findByProjectId(projectId)
            .ifPresent(roster -> {
                personRepository.deleteByRosterId(roster.getId());
                rosterRepository.delete(roster);
            });
    }

    private List<Map<String, String>> parseExcelFile(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            // Get header row
            if (!rowIterator.hasNext()) return rows;
            Row headerRow = rowIterator.next();
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }

            // Parse data rows
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                Map<String, String> rowData = new LinkedHashMap<>();
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = row.getCell(i);
                    rowData.put(headers.get(i), getCellValueAsString(cell));
                }
                if (rowData.values().stream().anyMatch(v -> v != null && !v.isBlank())) {
                    rows.add(rowData);
                }
            }
        }

        return rows;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                }
                yield String.valueOf((int) cell.getNumericCellValue());
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private String detectColumn(List<String> columns, List<String> patterns) {
        for (String col : columns) {
            String lowerCol = col.toLowerCase().trim();
            if (patterns.stream().anyMatch(p -> lowerCol.contains(p.toLowerCase()))) {
                return col;
            }
        }
        return columns.isEmpty() ? null : columns.get(0);
    }

    private String serializeColumns(List<String> columns) {
        try {
            return objectMapper.writeValueAsString(columns);
        } catch (Exception e) {
            return "[]";
        }
    }
}
