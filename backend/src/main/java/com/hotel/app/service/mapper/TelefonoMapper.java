package com.hotel.app.service.mapper;

import com.hotel.app.domain.Telefono;
import com.hotel.app.service.dto.TelefonoDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Telefono} and its DTO {@link TelefonoDTO}.
 */
@Mapper(componentModel = "spring")
public interface TelefonoMapper extends EntityMapper<TelefonoDTO, Telefono> {}
