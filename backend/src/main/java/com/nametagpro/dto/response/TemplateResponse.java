package com.nametagpro.dto.response;

import com.nametagpro.entity.Template;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TemplateResponse {

    private UUID id;
    private String fileName;
    private String imageUrl;
    private String thumbnailUrl;
    private String role;
    private Integer width;
    private Integer height;

    public static TemplateResponse from(Template template) {
        return TemplateResponse.builder()
            .id(template.getId())
            .fileName(template.getFileName())
            .imageUrl(template.getImageUrl())
            .thumbnailUrl(template.getThumbnailUrl())
            .role(template.getRole())
            .width(template.getWidth())
            .height(template.getHeight())
            .build();
    }
}
