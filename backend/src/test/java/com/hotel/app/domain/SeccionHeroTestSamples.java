package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class SeccionHeroTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static SeccionHero getSeccionHeroSample1() {
        return new SeccionHero()
            .id(1L)
            .titulo("titulo1")
            .imagenFondoUrl("imagenFondoUrl1")
            .textoBoton("textoBoton1")
            .enlaceBoton("enlaceBoton1")
            .orden(1);
    }

    public static SeccionHero getSeccionHeroSample2() {
        return new SeccionHero()
            .id(2L)
            .titulo("titulo2")
            .imagenFondoUrl("imagenFondoUrl2")
            .textoBoton("textoBoton2")
            .enlaceBoton("enlaceBoton2")
            .orden(2);
    }

    public static SeccionHero getSeccionHeroRandomSampleGenerator() {
        return new SeccionHero()
            .id(longCount.incrementAndGet())
            .titulo(UUID.randomUUID().toString())
            .imagenFondoUrl(UUID.randomUUID().toString())
            .textoBoton(UUID.randomUUID().toString())
            .enlaceBoton(UUID.randomUUID().toString())
            .orden(intCount.incrementAndGet());
    }
}
