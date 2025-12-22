package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class RedSocialTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static RedSocial getRedSocialSample1() {
        return new RedSocial().id(1L).nombre("nombre1").urlEnlace("urlEnlace1").iconoUrl("iconoUrl1").colorHex("colorHex1");
    }

    public static RedSocial getRedSocialSample2() {
        return new RedSocial().id(2L).nombre("nombre2").urlEnlace("urlEnlace2").iconoUrl("iconoUrl2").colorHex("colorHex2");
    }

    public static RedSocial getRedSocialRandomSampleGenerator() {
        return new RedSocial()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .urlEnlace(UUID.randomUUID().toString())
            .iconoUrl(UUID.randomUUID().toString())
            .colorHex(UUID.randomUUID().toString());
    }
}
