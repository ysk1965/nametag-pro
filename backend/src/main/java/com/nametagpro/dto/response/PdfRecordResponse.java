package com.nametagpro.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfRecordResponse {

    private UUID id;
    private String projectName;
    private Integer pageCount;
    private Integer nametagCount;
    private String status;
    private Boolean watermarkEnabled;
    private String watermarkText;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    // 남은 일수
    private Integer daysUntilExpiry;
}
