package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ImagenTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Imagen getImagenSample1() {
        return new Imagen().id(1L).nombre("nombre1").descripcion("descripcion1").nombreArchivo("nombreArchivo1");
    }

    public static Imagen getImagenSample2() {
        return new Imagen().id(2L).nombre("nombre2").descripcion("descripcion2").nombreArchivo("nombreArchivo2");
    }

    public static Imagen getImagenRandomSampleGenerator() {
        return new Imagen()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .descripcion(UUID.randomUUID().toString())
            .nombreArchivo(UUID.randomUUID().toString());
    }
}
