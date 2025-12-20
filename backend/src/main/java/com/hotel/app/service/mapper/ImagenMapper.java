package com.hotel.app.service.mapper;

import com.hotel.app.domain.Habitacion;
import com.hotel.app.domain.Imagen;
import com.hotel.app.domain.Servicio;
import com.hotel.app.service.dto.HabitacionDTO;
import com.hotel.app.service.dto.ImagenDTO;
import com.hotel.app.service.dto.ServicioDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Imagen} and its DTO {@link ImagenDTO}.
 */
@Mapper(componentModel = "spring")
public interface ImagenMapper extends EntityMapper<ImagenDTO, Imagen> {
    @Mapping(target = "habitacion", source = "habitacion", qualifiedByName = "habitacionNumero")
    @Mapping(target = "servicio", source = "servicio", qualifiedByName = "servicioNombre")
    ImagenDTO toDto(Imagen s);

    @Named("habitacionNumero")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "numero", source = "numero")
    HabitacionDTO toDtoHabitacionNumero(Habitacion habitacion);

    @Named("servicioNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    ServicioDTO toDtoServicioNombre(Servicio servicio);
}
