package com.nametagpro.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfGenerateRequest {

    @NotEmpty(message = "템플릿 정보가 필요합니다")
    private List<TemplateData> templates;

    @NotEmpty(message = "명단 데이터가 필요합니다")
    private List<PersonData> persons;

    private List<TextFieldData> textFields;

    @NotNull(message = "PDF 설정이 필요합니다")
    private ExportConfigData exportConfig;

    private Map<String, String> roleMappings;

    private Map<String, String> roleColors;

    private String templateColumn;

    private String selectedTemplateId;

    // 워터마크 설정
    @Builder.Default
    private Boolean watermarkEnabled = false;

    private String watermarkText;

    // 프로젝트 정보 (기록용)
    private String projectName;

    private String projectId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TemplateData {
        private String id;
        private String fileName;
        private String imageUrl;
        private String dataUrl;
        private Integer width;
        private Integer height;
        private String role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PersonData {
        private String id;
        private Map<String, String> data;
        private String templateId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TextFieldData {
        private String id;
        private String column;
        private String label;
        private PositionData position;
        private StyleData style;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PositionData {
        private Double x;
        private Double y;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StyleData {
        private String fontFamily;
        private Integer fontSize;
        private Integer fontWeight;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExportConfigData {
        private String paperSize;  // A4, Letter
        private String layout;     // 2x2, 2x3, 3x3, 2x4
        private Integer margin;    // mm
        private Integer dpi;
        private String sizeMode;   // grid, fixed
        private Integer gridGap;   // mm
        private Integer fixedWidth;  // mm
        private Integer fixedHeight; // mm
        private Integer blankPages;
        private Map<String, Integer> blankPagesPerTemplate;
    }
}
