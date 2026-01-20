package com.nametagpro.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectCreateRequest {

    @NotBlank(message = "프로젝트 이름은 필수입니다")
    @Size(max = 255, message = "프로젝트 이름은 255자 이내여야 합니다")
    private String name;
}
