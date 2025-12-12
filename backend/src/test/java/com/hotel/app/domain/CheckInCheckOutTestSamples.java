package com.hotel.app.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class CheckInCheckOutTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static CheckInCheckOut getCheckInCheckOutSample1() {
        return new CheckInCheckOut().id(1L);
    }

    public static CheckInCheckOut getCheckInCheckOutSample2() {
        return new CheckInCheckOut().id(2L);
    }

    public static CheckInCheckOut getCheckInCheckOutRandomSampleGenerator() {
        return new CheckInCheckOut().id(longCount.incrementAndGet());
    }
}
