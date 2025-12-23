package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class UbicacionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Ubicacion getUbicacionSample1() {
        return new Ubicacion().id(1L).nombre("nombre1").direccion("direccion1").googleMapsUrl("googleMapsUrl1");
    }

    public static Ubicacion getUbicacionSample2() {
        return new Ubicacion().id(2L).nombre("nombre2").direccion("direccion2").googleMapsUrl("googleMapsUrl2");
    }

    public static Ubicacion getUbicacionRandomSampleGenerator() {
        return new Ubicacion()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .direccion(UUID.randomUUID().toString())
            .googleMapsUrl(UUID.randomUUID().toString());
    }
}
