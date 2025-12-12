package com.hotel.app.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ClienteTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Cliente getClienteSample1() {
        return new Cliente()
            .id(1L)
            .nombre("nombre1")
            .apellido("apellido1")
            .correo("correo1")
            .telefono("telefono1")
            .direccion("direccion1")
            .numeroIdentificacion("numeroIdentificacion1")
            .keycloakId("keycloakId1");
    }

    public static Cliente getClienteSample2() {
        return new Cliente()
            .id(2L)
            .nombre("nombre2")
            .apellido("apellido2")
            .correo("correo2")
            .telefono("telefono2")
            .direccion("direccion2")
            .numeroIdentificacion("numeroIdentificacion2")
            .keycloakId("keycloakId2");
    }

    public static Cliente getClienteRandomSampleGenerator() {
        return new Cliente()
            .id(longCount.incrementAndGet())
            .nombre(UUID.randomUUID().toString())
            .apellido(UUID.randomUUID().toString())
            .correo(UUID.randomUUID().toString())
            .telefono(UUID.randomUUID().toString())
            .direccion(UUID.randomUUID().toString())
            .numeroIdentificacion(UUID.randomUUID().toString())
            .keycloakId(UUID.randomUUID().toString());
    }
}
