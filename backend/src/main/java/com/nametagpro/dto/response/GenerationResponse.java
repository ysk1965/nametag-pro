package com.nametagpro.dto.response;

import com.nametagpro.entity.Generation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GenerationResponse {

    private UUID id;
    private String pdfUrl;
    private String zipUrl;
    private Integer pageCount;
    private Integer nametagCount;
    private String status;
    private Integer progress;
    private LocalDateTime createdAt;

    public static GenerationResponse from(Generation generation) {
        return GenerationResponse.builder()
            .id(generation.getId())
            .pdfUrl(generation.getPdfUrl())
            .zipUrl(generation.getZipUrl())
            .pageCount(generation.getPageCount())
            .nametagCount(generation.getNametagCount())
            .status(generation.getStatus().name().toLowerCase())
            .progress(generation.getStatus() == Generation.GenerationStatus.COMPLETED ? 100 :
                      generation.getStatus() == Generation.GenerationStatus.PROCESSING ? 50 : 0)
            .createdAt(generation.getCreatedAt())
            .build();
    }
}
