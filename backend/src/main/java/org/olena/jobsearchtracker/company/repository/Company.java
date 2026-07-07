package org.olena.jobsearchtracker.company.repository;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;
import org.olena.jobsearchtracker.common.BaseEntity;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(name = "company")
public class Company extends BaseEntity {
    @Column(nullable = false, unique = true)
    private String name;

    private String website;

    private String location;

    private String notes;
}
