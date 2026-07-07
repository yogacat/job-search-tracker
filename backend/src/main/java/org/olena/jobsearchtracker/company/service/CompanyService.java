package org.olena.jobsearchtracker.company.service;

import org.olena.jobsearchtracker.common.NotFoundException;
import org.olena.jobsearchtracker.company.dto.CreateCompanyRequest;
import org.olena.jobsearchtracker.company.dto.UpdateCompanyRequest;
import org.olena.jobsearchtracker.company.repository.Company;
import org.olena.jobsearchtracker.company.repository.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CompanyService {
    private final CompanyRepository repository;

    public CompanyService(CompanyRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Company> list() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Company get(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Company " + id + " not found"));
    }

    public Company create(CreateCompanyRequest request) {
        Company company = new Company(
               request.name(), request.website(), request.location(), request.notes());
        return repository.save(company);
    }

    public Company update(Long id, UpdateCompanyRequest request) {
        Company company = get(id);
        company.setName(request.name());
        company.setWebsite(request.website());
        company.setLocation(request.location());
        company.setNotes(request.notes());

        return company;
    }

    public void delete(Long id) {
        repository.delete(get(id));
    }
}
