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
public class PdfGenerateResponse {

    private UUID id;
    private String projectName;
    private Integer pageCount;
    private Integer nametagCount;
    private String status;
    private Boolean watermarkEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    // PDF 다운로드 URL (실제 다운로드 시점에 재생성)
    private String downloadUrl;
}
