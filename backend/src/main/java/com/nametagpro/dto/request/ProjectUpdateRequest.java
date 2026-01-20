package com.nametagpro.dto.request;

import lombok.Data;

@Data
public class ProjectUpdateRequest {

    private String name;
    private TextConfigDto textConfig;
    private ExportConfigDto exportConfig;

    @Data
    public static class TextConfigDto {
        private PositionDto position;
        private StyleDto style;

        @Data
        public static class PositionDto {
            private Double x;
            private Double y;
            private String anchor;
        }

        @Data
        public static class StyleDto {
            private String fontFamily;
            private Integer fontSize;
            private Integer fontWeight;
            private String color;
        }
    }

    @Data
    public static class ExportConfigDto {
        private String paperSize;
        private String layout;
        private Integer margin;
        private Integer dpi;
    }
}
