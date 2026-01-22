package com.nametagpro.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "generations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Generation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String pdfUrl;

    private String zipUrl;

    private Integer pageCount;

    private Integer nametagCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GenerationStatus status = GenerationStatus.PROCESSING;

    // JSON 데이터 필드 (PDF 재생성용)
    @Column(columnDefinition = "jsonb")
    private String templateData;

    @Column(columnDefinition = "jsonb")
    private String personsData;

    @Column(columnDefinition = "jsonb")
    private String textFieldsData;

    @Column(columnDefinition = "jsonb")
    private String exportConfigData;

    @Column(columnDefinition = "jsonb")
    private String roleMappingsData;

    @Column(columnDefinition = "jsonb")
    private String roleColorsData;

    // 워터마크 설정
    @Builder.Default
    private Boolean watermarkEnabled = false;

    private String watermarkText;

    // 프로젝트 이름 (목록 표시용)
    private String projectName;

    private LocalDateTime expiresAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum GenerationStatus {
        PROCESSING, COMPLETED, FAILED
    }
}
