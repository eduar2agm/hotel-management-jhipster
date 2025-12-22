package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class SeccionContactoTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static SeccionContacto getSeccionContactoSample1() {
        return new SeccionContacto().id(1L).titulo("titulo1").imagenFondoUrl("imagenFondoUrl1").correo("correo1");
    }

    public static SeccionContacto getSeccionContactoSample2() {
        return new SeccionContacto().id(2L).titulo("titulo2").imagenFondoUrl("imagenFondoUrl2").correo("correo2");
    }

    public static SeccionContacto getSeccionContactoRandomSampleGenerator() {
        return new SeccionContacto()
            .id(longCount.incrementAndGet())
            .titulo(UUID.randomUUID().toString())
            .imagenFondoUrl(UUID.randomUUID().toString())
            .correo(UUID.randomUUID().toString());
    }
}
