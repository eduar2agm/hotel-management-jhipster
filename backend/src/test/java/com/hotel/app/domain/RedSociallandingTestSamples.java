package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class RedSociallandingTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static RedSociallanding getRedSociallandingSample1() {
        return new RedSociallanding().id(1L).nombre("nombre1").urlEnlace("urlEnlace1").iconoUrl("iconoUrl1").colorHex("colorHex1");
    }

    public static RedSociallanding getRedSociallandingSample2() {
        return new RedSociallanding().id(2L).nombre("nombre2").urlEnlace("urlEnlace2").iconoUrl("iconoUrl2").colorHex("colorHex2");
    }

    public static RedSociallanding getRedSociallandingRandomSampleGenerator() {
        return new RedSociallanding()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .urlEnlace(UUID.randomUUID().toString())
            .iconoUrl(UUID.randomUUID().toString())
            .colorHex(UUID.randomUUID().toString());
    }
}
