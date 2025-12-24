package com.hotel.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class StaticResourcesWebConfiguration implements WebMvcConfigurer {

    private final Logger log = LoggerFactory.getLogger(StaticResourcesWebConfiguration.class);

    @Value("${application.image-path:images/}")
    private String imagePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String path = Paths.get(imagePath).toAbsolutePath().toUri().toString();
        log.info("Registering static resource handler for images: /images/** -> {}", path);

        registry.addResourceHandler("/images/**")
                .addResourceLocations(path)
                .setCachePeriod(3600);
    }
}
