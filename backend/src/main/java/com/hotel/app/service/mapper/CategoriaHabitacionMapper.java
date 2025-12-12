package com.hotel.app.service.mapper;

import com.hotel.app.domain.CategoriaHabitacion;
import com.hotel.app.service.dto.CategoriaHabitacionDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link CategoriaHabitacion} and its DTO {@link CategoriaHabitacionDTO}.
 */
@Mapper(componentModel = "spring")
public interface CategoriaHabitacionMapper extends EntityMapper<CategoriaHabitacionDTO, CategoriaHabitacion> {}
