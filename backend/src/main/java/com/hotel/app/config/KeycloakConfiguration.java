package com.hotel.app.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfiguration {

    @Value("${keycloak.auth-server-url:http://localhost:9080}")
    private String serverUrl;

    @Value("${keycloak.realm:jhipster}")
    private String realm;

    @Value("${keycloak.resource:admin-cli}")
    private String clientId;

    @Value("${keycloak.credentials.secret:}")
    private String clientSecret;

    // Credentials for the creating user (Admin)
    // In a real prod environment, this should be a service account or configured
    // securely
    // For this task, we will default to the standard dev admin credentials if not
    // provided
    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                .clientId(clientId)
                .username(adminUsername)
                .password(adminPassword)
                .build();
    }
}
