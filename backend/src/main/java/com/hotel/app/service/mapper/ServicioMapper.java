package com.hotel.app.service.mapper;

import com.hotel.app.domain.Servicio;
import com.hotel.app.service.dto.ServicioDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Servicio} and its DTO {@link ServicioDTO}.
 */
@Mapper(componentModel = "spring")
public interface ServicioMapper extends EntityMapper<ServicioDTO, Servicio> {
    @Mapping(target = "imagenes", ignore = true)
    ServicioDTO toDto(Servicio s);
}
