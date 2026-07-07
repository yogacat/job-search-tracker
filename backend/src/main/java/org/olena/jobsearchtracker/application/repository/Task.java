package org.olena.jobsearchtracker.application.repository;

import jakarta.persistence.*;
import lombok.*;
import org.olena.jobsearchtracker.common.BaseEntity;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "task")
public class Task extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(nullable = false)
    private String title;

    @Column(name = "due_on")
    private LocalDate dueOn;

    @Column(nullable = false)
    private boolean done = false;

    private String note;
}
