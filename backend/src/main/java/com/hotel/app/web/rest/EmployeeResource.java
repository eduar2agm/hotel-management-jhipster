package com.hotel.app.web.rest;

import com.hotel.app.security.AuthoritiesConstants;
import com.hotel.app.service.EmployeeService;
import com.hotel.app.service.dto.EmployeeDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class EmployeeResource {

    private final Logger log = LoggerFactory.getLogger(EmployeeResource.class);

    private final EmployeeService employeeService;

    public EmployeeResource(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    /**
     * {@code POST  /employees} : Create a new employee (user).
     *
     * @param employeeDTO the dto to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with
     *         body containing key info (password).
     */
    @PostMapping("/employees")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Map<String, String>> createEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) {
        log.debug("REST request to save Employee : {}", employeeDTO);
        try {
            String tempPassword = employeeService.createEmployee(employeeDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("password", tempPassword));
        } catch (Exception e) {
            log.error("Error creating employee", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * {@code GET  /employees} : get all employees.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list
     *         of employees.
     */
    @GetMapping("/employees")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        log.debug("REST request to get all Employees");
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @PutMapping("/employees")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> updateEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) {
        log.debug("REST request to update Employee : {}", employeeDTO);
        employeeService.updateEmployee(employeeDTO);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/employees/{login}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deactivateEmployee(@PathVariable String login) {
        log.debug("REST request to deactivate Employee : {}", login);
        employeeService.deactivateEmployee(login);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/employees/{login}/activate")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> activateEmployee(@PathVariable String login) {
        log.debug("REST request to activate Employee : {}", login);
        employeeService.activateEmployee(login);
        return ResponseEntity.ok().build();
    }
}
