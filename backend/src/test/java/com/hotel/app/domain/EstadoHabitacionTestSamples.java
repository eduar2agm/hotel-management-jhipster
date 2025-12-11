package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class EstadoHabitacionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static EstadoHabitacion getEstadoHabitacionSample1() {
        return new EstadoHabitacion().id(1L).descripcion("descripcion1");
    }

    public static EstadoHabitacion getEstadoHabitacionSample2() {
        return new EstadoHabitacion().id(2L).descripcion("descripcion2");
    }

    public static EstadoHabitacion getEstadoHabitacionRandomSampleGenerator() {
        return new EstadoHabitacion().id(longCount.incrementAndGet()).descripcion(UUID.randomUUID().toString());
    }
}
