package com.nametagpro.dto.response;

import com.nametagpro.entity.Person;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PersonResponse {

    private UUID id;
    private String name;
    private String role;
    private UUID templateId;

    public static PersonResponse from(Person person) {
        return PersonResponse.builder()
            .id(person.getId())
            .name(person.getName())
            .role(person.getRole())
            .templateId(person.getTemplate() != null ? person.getTemplate().getId() : null)
            .build();
    }
}
