package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CategoriaHabitacionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static CategoriaHabitacion getCategoriaHabitacionSample1() {
        return new CategoriaHabitacion().id(1L).descripcion("descripcion1");
    }

    public static CategoriaHabitacion getCategoriaHabitacionSample2() {
        return new CategoriaHabitacion().id(2L).descripcion("descripcion2");
    }

    public static CategoriaHabitacion getCategoriaHabitacionRandomSampleGenerator() {
        return new CategoriaHabitacion().id(longCount.incrementAndGet()).descripcion(UUID.randomUUID().toString());
    }
}
