package com.hotel.app.service.mapper;

import com.hotel.app.domain.EstadoHabitacion;
import com.hotel.app.service.dto.EstadoHabitacionDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link EstadoHabitacion} and its DTO {@link EstadoHabitacionDTO}.
 */
@Mapper(componentModel = "spring")
public interface EstadoHabitacionMapper extends EntityMapper<EstadoHabitacionDTO, EstadoHabitacion> {}
