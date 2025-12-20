package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class CarouselItemTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static CarouselItem getCarouselItemSample1() {
        return new CarouselItem().id(1L).titulo("titulo1").descripcion("descripcion1").orden(1);
    }

    public static CarouselItem getCarouselItemSample2() {
        return new CarouselItem().id(2L).titulo("titulo2").descripcion("descripcion2").orden(2);
    }

    public static CarouselItem getCarouselItemRandomSampleGenerator() {
        return new CarouselItem()
            .id(longCount.incrementAndGet())
            .titulo(UUID.randomUUID().toString())
            .descripcion(UUID.randomUUID().toString())
            .orden(intCount.incrementAndGet());
    }
}
