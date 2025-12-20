package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ServicioTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Servicio getServicioSample1() {
        return new Servicio().id(1L).nombre("nombre1").descripcion("descripcion1").urlImage("urlImage1");
    }

    public static Servicio getServicioSample2() {
        return new Servicio().id(2L).nombre("nombre2").descripcion("descripcion2").urlImage("urlImage2");
    }

    public static Servicio getServicioRandomSampleGenerator() {
        return new Servicio()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .descripcion(UUID.randomUUID().toString())
            .urlImage(UUID.randomUUID().toString());
    }
}
