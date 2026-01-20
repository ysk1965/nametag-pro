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
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private String pdfUrl;

    private String zipUrl;

    private Integer pageCount;

    private Integer nametagCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GenerationStatus status = GenerationStatus.PROCESSING;

    private LocalDateTime expiresAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum GenerationStatus {
        PROCESSING, COMPLETED, FAILED
    }
}
