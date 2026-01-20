package com.nametagpro.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rosters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Roster {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @Column(nullable = false)
    private String fileName;

    @Column(columnDefinition = "jsonb")
    private String columns;

    @Column(nullable = false)
    private String nameColumn;

    private String roleColumn;

    @Column(nullable = false)
    private Integer totalCount;

    @OneToMany(mappedBy = "roster", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Person> persons = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;
}
