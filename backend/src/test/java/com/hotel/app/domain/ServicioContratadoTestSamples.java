package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ServicioContratadoTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static ServicioContratado getServicioContratadoSample1() {
        return new ServicioContratado().id(1L).cantidad(1).observaciones("observaciones1");
    }

    public static ServicioContratado getServicioContratadoSample2() {
        return new ServicioContratado().id(2L).cantidad(2).observaciones("observaciones2");
    }

    public static ServicioContratado getServicioContratadoRandomSampleGenerator() {
        return new ServicioContratado()
            .id(longCount.incrementAndGet())
            .cantidad(intCount.incrementAndGet())
            .observaciones(UUID.randomUUID().toString());
    }
}
