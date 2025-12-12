package com.hotel.app.service.mapper;

import com.hotel.app.domain.CheckInCheckOut;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.service.dto.CheckInCheckOutDTO;
import com.hotel.app.service.dto.ReservaDetalleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link CheckInCheckOut} and its DTO {@link CheckInCheckOutDTO}.
 */
@Mapper(componentModel = "spring")
public interface CheckInCheckOutMapper extends EntityMapper<CheckInCheckOutDTO, CheckInCheckOut> {
    @Mapping(target = "reservaDetalle", source = "reservaDetalle", qualifiedByName = "reservaDetalleId")
    CheckInCheckOutDTO toDto(CheckInCheckOut s);

    @Named("reservaDetalleId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ReservaDetalleDTO toDtoReservaDetalleId(ReservaDetalle reservaDetalle);
}
