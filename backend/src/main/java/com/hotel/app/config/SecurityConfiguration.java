package com.hotel.app.config;

import static org.springframework.security.config.Customizer.withDefaults;
import static org.springframework.security.oauth2.core.oidc.StandardClaimNames.PREFERRED_USERNAME;

import com.hotel.app.security.*;
import com.hotel.app.security.oauth2.AudienceValidator;
import java.util.*;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import tech.jhipster.config.JHipsterConstants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableMethodSecurity(securedEnabled = true, prePostEnabled = true)
public class SecurityConfiguration {

    private final JHipsterProperties jHipsterProperties;
    private final Environment env;

    @Value("${spring.security.oauth2.client.provider.oidc.issuer-uri}")
    private String issuerUri;

    public SecurityConfiguration(JHipsterProperties jHipsterProperties, Environment env) {
        this.jHipsterProperties = jHipsterProperties;
        this.env = env;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, MvcRequestMatcher.Builder mvc) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> {
                    // prettier-ignore
                    authz
                            .requestMatchers(mvc.pattern("/api/stripe/webhook")).permitAll()
                            .requestMatchers(mvc.pattern("/api/authenticate")).permitAll()
                            .requestMatchers(mvc.pattern("/api/auth-info")).permitAll()
                            .requestMatchers(mvc.pattern("/api/habitacions/**")).permitAll()
                            .requestMatchers(mvc.pattern("/api/servicios/**")).permitAll()
                            .requestMatchers(mvc.pattern("/api/seccion-heroes/**")).permitAll()
                            .requestMatchers(mvc.pattern("/api/red-socials/**")).permitAll()
                            .requestMatchers(mvc.pattern("/images/**")).permitAll()
                            .requestMatchers(mvc.pattern("/api/seccion-contactos/**")).permitAll()
                            .requestMatchers(mvc.pattern("/api/red-socials/**")).permitAll()
                            .requestMatchers(mvc.pattern("/api/telefonos/**")).permitAll()
                            .requestMatchers(mvc.pattern("/api/admin/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                            .requestMatchers(mvc.pattern("/api/admin/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                            .requestMatchers(mvc.pattern("/api/**")).authenticated();
                    // OpenAPI docs: permit in dev, otherwise require ADMIN
                    if (env != null && env.acceptsProfiles(Profiles.of(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT))) {
                        authz.requestMatchers(mvc.pattern("/v3/api-docs/**")).permitAll();
                    } else {
                        authz.requestMatchers(mvc.pattern("/v3/api-docs/**")).hasAuthority(AuthoritiesConstants.ADMIN);
                    }
                    authz
                            .requestMatchers(mvc.pattern("/swagger-ui/**")).permitAll()
                            .requestMatchers(mvc.pattern("/management/health")).permitAll()
                            .requestMatchers(mvc.pattern("/management/health/**")).permitAll()
                            .requestMatchers(mvc.pattern("/management/info")).permitAll()
                            .requestMatchers(mvc.pattern("/management/prometheus")).permitAll()
                            .requestMatchers(mvc.pattern("/management/**")).hasAuthority(AuthoritiesConstants.ADMIN);
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(authenticationConverter())))
                .oauth2Client(withDefaults());
        return http.build();
    }

    @Bean
    MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
        return new MvcRequestMatcher.Builder(introspector);
    }

    Converter<Jwt, AbstractAuthenticationToken> authenticationConverter() {
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                new Converter<Jwt, Collection<GrantedAuthority>>() {
                    @Override
                    public Collection<GrantedAuthority> convert(Jwt jwt) {
                        return SecurityUtils.extractAuthorityFromClaims(jwt.getClaims());
                    }
                });
        jwtAuthenticationConverter.setPrincipalClaimName(PREFERRED_USERNAME);
        return jwtAuthenticationConverter;
    }

    @Bean
    JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = JwtDecoders.fromOidcIssuerLocation(issuerUri);

        OAuth2TokenValidator<Jwt> audienceValidator = new AudienceValidator(
                jHipsterProperties.getSecurity().getOauth2().getAudience());
        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuerUri);
        OAuth2TokenValidator<Jwt> withAudience = new DelegatingOAuth2TokenValidator<Jwt>(withIssuer, audienceValidator);

        jwtDecoder.setJwtValidator(withAudience);

        return jwtDecoder;
    }
}
