package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class TelefonoTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Telefono getTelefonoSample1() {
        return new Telefono().id(1L).numeroTel("numeroTel1");
    }

    public static Telefono getTelefonoSample2() {
        return new Telefono().id(2L).numeroTel("numeroTel2");
    }

    public static Telefono getTelefonoRandomSampleGenerator() {
        return new Telefono().id(longCount.incrementAndGet()).numeroTel(UUID.randomUUID().toString());
    }
}
