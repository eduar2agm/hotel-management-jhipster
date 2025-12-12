package com.hotel.app.service.mapper;

import com.hotel.app.domain.CategoriaHabitacion;
import com.hotel.app.domain.EstadoHabitacion;
import com.hotel.app.domain.Habitacion;
import com.hotel.app.service.dto.CategoriaHabitacionDTO;
import com.hotel.app.service.dto.EstadoHabitacionDTO;
import com.hotel.app.service.dto.HabitacionDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Habitacion} and its DTO {@link HabitacionDTO}.
 */
@Mapper(componentModel = "spring")
public interface HabitacionMapper extends EntityMapper<HabitacionDTO, Habitacion> {
    @Mapping(target = "categoriaHabitacion", source = "categoriaHabitacion", qualifiedByName = "categoriaHabitacionNombre")
    @Mapping(target = "estadoHabitacion", source = "estadoHabitacion", qualifiedByName = "estadoHabitacionNombre")
    HabitacionDTO toDto(Habitacion s);

    @Named("categoriaHabitacionNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    CategoriaHabitacionDTO toDtoCategoriaHabitacionNombre(CategoriaHabitacion categoriaHabitacion);

    @Named("estadoHabitacionNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    EstadoHabitacionDTO toDtoEstadoHabitacionNombre(EstadoHabitacion estadoHabitacion);
}
