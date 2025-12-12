package com.hotel.app.service.mapper;

import com.hotel.app.domain.MensajeSoporte;
import com.hotel.app.domain.Reserva;
import com.hotel.app.service.dto.MensajeSoporteDTO;
import com.hotel.app.service.dto.ReservaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link MensajeSoporte} and its DTO {@link MensajeSoporteDTO}.
 */
@Mapper(componentModel = "spring")
public interface MensajeSoporteMapper extends EntityMapper<MensajeSoporteDTO, MensajeSoporte> {
    @Mapping(target = "reserva", source = "reserva", qualifiedByName = "reservaId")
    MensajeSoporteDTO toDto(MensajeSoporte s);

    @Named("reservaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ReservaDTO toDtoReservaId(Reserva reserva);
}
