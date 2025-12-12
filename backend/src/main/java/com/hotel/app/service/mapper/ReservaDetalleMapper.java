package com.hotel.app.service.mapper;

import com.hotel.app.domain.Habitacion;
import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.service.dto.HabitacionDTO;
import com.hotel.app.service.dto.ReservaDTO;
import com.hotel.app.service.dto.ReservaDetalleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ReservaDetalle} and its DTO {@link ReservaDetalleDTO}.
 */
@Mapper(componentModel = "spring")
public interface ReservaDetalleMapper extends EntityMapper<ReservaDetalleDTO, ReservaDetalle> {
    @Mapping(target = "reserva", source = "reserva", qualifiedByName = "reservaId")
    @Mapping(target = "habitacion", source = "habitacion", qualifiedByName = "habitacionNumero")
    ReservaDetalleDTO toDto(ReservaDetalle s);

    @Named("reservaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ReservaDTO toDtoReservaId(Reserva reserva);

    @Named("habitacionNumero")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "numero", source = "numero")
    HabitacionDTO toDtoHabitacionNumero(Habitacion habitacion);
}
