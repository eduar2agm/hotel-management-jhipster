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
@Mapper(componentModel = "spring", uses = { CategoriaHabitacionMapper.class, EstadoHabitacionMapper.class })
public interface HabitacionMapper extends EntityMapper<HabitacionDTO, Habitacion> {
    @Mapping(target = "categoriaHabitacion", source = "categoriaHabitacion", qualifiedByName = "categoriaHabitacionId")
    @Mapping(target = "estadoHabitacion", source = "estadoHabitacion", qualifiedByName = "estadoHabitacionId")
    HabitacionDTO toDto(Habitacion s);

    @Named("categoriaHabitacionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    @Mapping(target = "precioBase", source = "precioBase")
    @Mapping(target = "descripcion", source = "descripcion")
    CategoriaHabitacionDTO toDtoCategoriaHabitacionId(CategoriaHabitacion categoriaHabitacion);

    @Named("estadoHabitacionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    EstadoHabitacionDTO toDtoEstadoHabitacionId(EstadoHabitacion estadoHabitacion);
}
