package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class HabitacionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Habitacion getHabitacionSample1() {
        return new Habitacion().id(1L).numero("numero1").capacidad(1).descripcion("descripcion1").imagen("imagen1");
    }

    public static Habitacion getHabitacionSample2() {
        return new Habitacion().id(2L).numero("numero2").capacidad(2).descripcion("descripcion2").imagen("imagen2");
    }

    public static Habitacion getHabitacionRandomSampleGenerator() {
        return new Habitacion()
            .id(longCount.incrementAndGet())
            .numero(UUID.randomUUID().toString())
            .capacidad(intCount.incrementAndGet())
            .descripcion(UUID.randomUUID().toString())
            .imagen(UUID.randomUUID().toString());
    }
}
