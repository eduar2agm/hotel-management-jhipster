package com.hotel.app.service.mapper;

import com.hotel.app.domain.Cliente;
import com.hotel.app.domain.Pago;
import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.Servicio;
import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.service.dto.ClienteDTO;
import com.hotel.app.service.dto.PagoDTO;
import com.hotel.app.service.dto.ReservaDTO;
import com.hotel.app.service.dto.ServicioContratadoDTO;
import com.hotel.app.service.dto.ServicioDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ServicioContratado} and its DTO {@link ServicioContratadoDTO}.
 */
@Mapper(componentModel = "spring")
public interface ServicioContratadoMapper extends EntityMapper<ServicioContratadoDTO, ServicioContratado> {
    @Mapping(target = "servicio", source = "servicio", qualifiedByName = "servicioNombre")
    @Mapping(target = "reserva", source = "reserva", qualifiedByName = "reservaId")
    @Mapping(target = "cliente", source = "cliente", qualifiedByName = "clienteNombre")
    @Mapping(target = "pago", source = "pago", qualifiedByName = "pagoId")
    ServicioContratadoDTO toDto(ServicioContratado s);

    @Named("servicioNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    ServicioDTO toDtoServicioNombre(Servicio servicio);

    @Named("reservaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ReservaDTO toDtoReservaId(Reserva reserva);

    @Named("clienteNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    ClienteDTO toDtoClienteNombre(Cliente cliente);

    @Named("pagoId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PagoDTO toDtoPagoId(Pago pago);
}
