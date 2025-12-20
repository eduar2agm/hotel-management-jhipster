package com.hotel.app.config;

import java.nio.file.Paths;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourcesConfiguration implements WebMvcConfigurer {

    private final ApplicationProperties applicationProperties;

    public StaticResourcesConfiguration(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String imagePath = applicationProperties.getImagePath();
        String absolutePath = new java.io.File(imagePath).getAbsolutePath();
        if (!absolutePath.endsWith(java.io.File.separator)) {
            absolutePath += java.io.File.separator;
        }

        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + absolutePath.replace("\\", "/"))
                .setCachePeriod(0);
    }
}
