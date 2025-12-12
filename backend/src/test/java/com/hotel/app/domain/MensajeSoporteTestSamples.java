package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MensajeSoporteTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static MensajeSoporte getMensajeSoporteSample1() {
        return new MensajeSoporte().id(1L).mensaje("mensaje1").userId("userId1").userName("userName1");
    }

    public static MensajeSoporte getMensajeSoporteSample2() {
        return new MensajeSoporte().id(2L).mensaje("mensaje2").userId("userId2").userName("userName2");
    }

    public static MensajeSoporte getMensajeSoporteRandomSampleGenerator() {
        return new MensajeSoporte()
            .id(longCount.incrementAndGet())
            .mensaje(UUID.randomUUID().toString())
            .userId(UUID.randomUUID().toString())
            .userName(UUID.randomUUID().toString());
    }
}
