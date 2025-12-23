package com.hotel.app.service.mapper;

import com.hotel.app.domain.Ubicacion;
import com.hotel.app.service.dto.UbicacionDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Ubicacion} and its DTO {@link UbicacionDTO}.
 */
@Mapper(componentModel = "spring")
public interface UbicacionMapper extends EntityMapper<UbicacionDTO, Ubicacion> {}
