package com.hotel.app.service.mapper;

import com.hotel.app.domain.Pago;
import com.hotel.app.domain.Reserva;
import com.hotel.app.service.dto.PagoDTO;
import com.hotel.app.service.dto.ReservaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Pago} and its DTO {@link PagoDTO}.
 */
@Mapper(componentModel = "spring")
public interface PagoMapper extends EntityMapper<PagoDTO, Pago> {
    @Mapping(target = "reserva", source = "reserva", qualifiedByName = "reservaId")
    PagoDTO toDto(Pago s);

    @Named("reservaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ReservaDTO toDtoReservaId(Reserva reserva);
}
