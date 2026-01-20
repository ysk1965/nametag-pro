package com.nametagpro.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class ApiErrorResponse {

    private String code;
    private String message;
    private Map<String, Object> details;

    public static ApiErrorResponse of(String code, String message) {
        return ApiErrorResponse.builder()
            .code(code)
            .message(message)
            .build();
    }

    public static ApiErrorResponse of(String code, String message, Map<String, Object> details) {
        return ApiErrorResponse.builder()
            .code(code)
            .message(message)
            .details(details)
            .build();
    }
}
