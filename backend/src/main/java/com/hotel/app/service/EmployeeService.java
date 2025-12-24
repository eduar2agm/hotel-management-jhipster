package com.hotel.app.service;

import com.hotel.app.service.dto.EmployeeDTO;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import org.keycloak.admin.client.CreatedResponseUtil;
import jakarta.ws.rs.core.Response;

@Service
public class EmployeeService {

    private final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final Keycloak keycloak;

    @Value("${keycloak.realm:jhipster}")
    private String realm;

    public EmployeeService(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    public String createEmployee(EmployeeDTO employeeDTO) {
        log.debug("Request to create employee in Keycloak: {}", employeeDTO);

        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        // 1. Create User Representation
        UserRepresentation user = new UserRepresentation();
        user.setUsername(employeeDTO.getLogin());
        user.setEmail(employeeDTO.getEmail());
        user.setFirstName(employeeDTO.getFirstName());
        user.setLastName(employeeDTO.getLastName());
        user.setEnabled(true);
        user.setEmailVerified(true);

        // 2. Create User in Keycloak
        Response response = usersResource.create(user);

        if (response.getStatus() != 201) {
            throw new RuntimeException("Failed to create user in Keycloak. Status: " + response.getStatusInfo());
        }

        String userId = CreatedResponseUtil.getCreatedId(response);
        log.info("Created user with ID: {}", userId);

        // 3. Set Password
        String tempPassword = "User123!";
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(tempPassword);
        credential.setTemporary(true); // User must change it

        UserResource userResource = usersResource.get(userId);
        userResource.resetPassword(credential);

        // 4. Assign Role
        String roleName = employeeDTO.getRole();
        if (roleName != null) {
            // Ensure compatibility (JHipster roles usually start with ROLE_)
            if (!roleName.startsWith("ROLE_")) {
                roleName = "ROLE_" + roleName;
            }

            // Default mappings if simple names used
            if ("ADMIN".equalsIgnoreCase(employeeDTO.getRole()))
                roleName = "ROLE_ADMIN";
            if ("EMPLOYEE".equalsIgnoreCase(employeeDTO.getRole()))
                roleName = "ROLE_EMPLOYEE";

            RoleRepresentation realmRole = realmResource.roles().get(roleName).toRepresentation();
            userResource.roles().realmLevel().add(Collections.singletonList(realmRole));
        }

        // 5. Clean up Default Roles (User/Client) that are not needed for Staff
        try {
            // List of roles to remove if present (to avoid Staff having Client roles)
            String[] rolesToRemove = { "default-roles-jhipster", "ROLE_CLIENT", "ROLE_USER" };

            List<RoleRepresentation> removalList = new java.util.ArrayList<>();

            for (String rName : rolesToRemove) {
                try {
                    // Check if user has this role (directly or inherited - though we can only
                    // remove direct assignments usually)
                    // But 'default-roles-jhipster' is usually directly assigned as a default.
                    // We try to fetch the role definition first
                    RoleRepresentation rRef = realmResource.roles().get(rName).toRepresentation();
                    removalList.add(rRef);
                } catch (Exception ex) {
                    // Role might not exist in realm, ignore
                }
            }

            if (!removalList.isEmpty()) {
                userResource.roles().realmLevel().remove(removalList);
            }

        } catch (Exception e) {
            log.warn("Could not clean up default roles for user {}: {}", userId, e.getMessage());
        }

        return tempPassword;
    }

    public void updateEmployee(EmployeeDTO employeeDTO) {
        RealmResource realmResource = keycloak.realm(realm);
        // Find user by username
        List<UserRepresentation> users = realmResource.users().search(employeeDTO.getLogin());
        if (users.isEmpty()) {
            throw new RuntimeException("User not found: " + employeeDTO.getLogin());
        }
        UserRepresentation user = users.get(0);

        user.setFirstName(employeeDTO.getFirstName());
        user.setLastName(employeeDTO.getLastName());
        user.setEmail(employeeDTO.getEmail());

        realmResource.users().get(user.getId()).update(user);

        // Handle Role Update
        if (employeeDTO.getRole() != null) {
            UserResource userResource = realmResource.users().get(user.getId());

            // Get current roles
            List<RoleRepresentation> currentRoles = userResource.roles().realmLevel().listAll();

            // Define target role name
            String targetRoleName = employeeDTO.getRole();
            if (!targetRoleName.startsWith("ROLE_")) {
                if ("ADMIN".equalsIgnoreCase(targetRoleName))
                    targetRoleName = "ROLE_ADMIN";
                else if ("EMPLOYEE".equalsIgnoreCase(targetRoleName))
                    targetRoleName = "ROLE_EMPLOYEE";
                else
                    targetRoleName = "ROLE_" + targetRoleName;
            }

            // Check if user already has this role
            String finalTargetRoleName = targetRoleName;
            boolean hasRole = currentRoles.stream().anyMatch(r -> r.getName().equals(finalTargetRoleName));

            if (!hasRole) {
                // Remove other relevant roles (ADMIN/EMPLOYEE) to ensure single role if that's
                // the logic
                // For simplicity, we remove ADMIN if switching to EMPLOYEE and vice-versa
                RoleRepresentation adminRole = realmResource.roles().get("ROLE_ADMIN").toRepresentation();
                RoleRepresentation employeeRole = realmResource.roles().get("ROLE_EMPLOYEE").toRepresentation();

                userResource.roles().realmLevel().remove(java.util.Arrays.asList(adminRole, employeeRole));

                // Add new role
                RoleRepresentation newRole = realmResource.roles().get(targetRoleName).toRepresentation();
                userResource.roles().realmLevel().add(Collections.singletonList(newRole));
            }
        }
    }

    public void deactivateEmployee(String login) {
        RealmResource realmResource = keycloak.realm(realm);
        List<UserRepresentation> users = realmResource.users().search(login);
        if (!users.isEmpty()) {
            UserRepresentation user = users.get(0);
            user.setEnabled(false);
            realmResource.users().get(user.getId()).update(user);
        }
    }

    public void activateEmployee(String login) {
        RealmResource realmResource = keycloak.realm(realm);
        List<UserRepresentation> users = realmResource.users().search(login);
        if (!users.isEmpty()) {
            UserRepresentation user = users.get(0);
            user.setEnabled(true);
            realmResource.users().get(user.getId()).update(user);
        }
    }

    public List<EmployeeDTO> getAllEmployees() {
        RealmResource realmResource = keycloak.realm(realm);
        List<EmployeeDTO> employees = new java.util.ArrayList<>();

        // Helper to fetch keys
        String adminRole = "ROLE_ADMIN";
        String employeeRole = "ROLE_EMPLOYEE";

        try {
            // Get users with ROLE_ADMIN
            realmResource.roles().get(adminRole).getUserMembers().stream()
                    .forEach(u -> employees.add(mapToDTO(u, "ADMIN")));

            // Get users with ROLE_EMPLOYEE
            realmResource.roles().get(employeeRole).getUserMembers().stream()
                    .filter(u -> employees.stream().noneMatch(e -> e.getLogin().equals(u.getUsername()))) // Avoid
                                                                                                          // duplicates
                                                                                                          // if user has
                                                                                                          // both
                    .forEach(u -> employees.add(mapToDTO(u, "EMPLOYEE")));

        } catch (Exception e) {
            log.error("Error fetching employees from Keycloak", e);
            // Fallback or empty list
        }

        return employees;
    }

    private EmployeeDTO mapToDTO(UserRepresentation u, String role) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setLogin(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        dto.setRole(role);
        dto.setActive(u.isEnabled() != null ? u.isEnabled() : false);
        return dto;
    }
}
