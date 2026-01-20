package com.nametagpro.dto.response;

import com.nametagpro.entity.Roster;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class RosterResponse {

    private UUID id;
    private String fileName;
    private List<String> columns;
    private String nameColumn;
    private String roleColumn;
    private Integer totalCount;

    public static RosterResponse from(Roster roster, List<String> columns) {
        return RosterResponse.builder()
            .id(roster.getId())
            .fileName(roster.getFileName())
            .columns(columns)
            .nameColumn(roster.getNameColumn())
            .roleColumn(roster.getRoleColumn())
            .totalCount(roster.getTotalCount())
            .build();
    }
}
