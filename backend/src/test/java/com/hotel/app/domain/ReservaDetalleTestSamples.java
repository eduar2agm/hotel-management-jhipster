package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ReservaDetalleTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static ReservaDetalle getReservaDetalleSample1() {
        return new ReservaDetalle().id(1L).nota("nota1");
    }

    public static ReservaDetalle getReservaDetalleSample2() {
        return new ReservaDetalle().id(2L).nota("nota2");
    }

    public static ReservaDetalle getReservaDetalleRandomSampleGenerator() {
        return new ReservaDetalle().id(longCount.incrementAndGet()).nota(UUID.randomUUID().toString());
    }
}
