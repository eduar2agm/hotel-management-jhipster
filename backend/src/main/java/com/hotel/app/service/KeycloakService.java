package com.hotel.app.service;

import java.util.Collections;
import java.util.List;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class KeycloakService {

    private static final Logger LOG = LoggerFactory.getLogger(KeycloakService.class);

    @Value("${application.keycloak.server-url}")
    private String serverUrl;

    @Value("${application.keycloak.realm}")
    private String realm;

    @Value("${application.keycloak.client-id}")
    private String clientId;

    @Value("${application.keycloak.username}")
    private String username;

    @Value("${application.keycloak.password}")
    private String password;

    public String createUser(String email, String firstName, String lastName) {
        Keycloak keycloak = null;
        try {
            keycloak = KeycloakBuilder.builder()
                    .serverUrl(serverUrl)
                    .realm(realm)
                    .clientId(clientId)
                    .username(username)
                    .password(password)
                    .build();

            UserRepresentation user = new UserRepresentation();
            user.setEnabled(true);
            user.setUsername(email);
            user.setEmail(email);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmailVerified(true);
            user.setRequiredActions(Collections.singletonList("UPDATE_PASSWORD"));

            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue("Bienvenido@123");
            credential.setTemporary(true);
            user.setCredentials(Collections.singletonList(credential));

            try (var response = keycloak.realm(realm).users().create(user)) {
                if (response.getStatus() == 201) {
                    String path = response.getLocation().getPath();
                    String userId = path.substring(path.lastIndexOf("/") + 1);
                    LOG.info("Created Keycloak user with ID: {}", userId);

                    // Assign ROLE_CLIENT
                    try {
                        org.keycloak.representations.idm.RoleRepresentation clientRole = keycloak.realm(realm).roles()
                                .get("ROLE_CLIENT").toRepresentation();
                        keycloak.realm(realm).users().get(userId).roles().realmLevel()
                                .add(Collections.singletonList(clientRole));
                        LOG.info("Assigned ROLE_CLIENT to user {}", userId);
                    } catch (Exception e) {
                        LOG.error("Failed to assign ROLE_CLIENT to user {}", userId, e);
                    }

                    return userId;
                } else if (response.getStatus() == 409) {
                    LOG.warn("User already exists in Keycloak: {}", email);
                    List<UserRepresentation> existing = keycloak.realm(realm).users().search(email);
                    if (!existing.isEmpty()) {
                        return existing.get(0).getId();
                    }
                } else {
                    LOG.error("Failed to create user in Keycloak. Status: {}", response.getStatus());
                }
            }
        } catch (Exception e) {
            LOG.error("Error connecting to Keycloak or creating user", e);
        } finally {
            if (keycloak != null) {
                keycloak.close();
            }
        }
        return null;
    }
}
