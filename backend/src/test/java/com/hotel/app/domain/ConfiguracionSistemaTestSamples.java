package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ConfiguracionSistemaTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ConfiguracionSistema getConfiguracionSistemaSample1() {
        return new ConfiguracionSistema().id(1L).clave("clave1").valor("valor1").categoria("categoria1").descripcion("descripcion1");
    }

    public static ConfiguracionSistema getConfiguracionSistemaSample2() {
        return new ConfiguracionSistema().id(2L).clave("clave2").valor("valor2").categoria("categoria2").descripcion("descripcion2");
    }

    public static ConfiguracionSistema getConfiguracionSistemaRandomSampleGenerator() {
        return new ConfiguracionSistema()
            .id(longCount.incrementAndGet())
            .clave(UUID.randomUUID().toString())
            .valor(UUID.randomUUID().toString())
            .categoria(UUID.randomUUID().toString())
            .descripcion(UUID.randomUUID().toString());
    }
}
