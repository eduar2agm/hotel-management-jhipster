package com.hotel.app.service.mapper;

import com.hotel.app.domain.ServicioDisponibilidad;
import com.hotel.app.domain.Servicio;
import com.hotel.app.service.dto.ServicioDisponibilidadDTO;
import com.hotel.app.service.dto.ServicioDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ServicioDisponibilidad} and its DTO
 * {@link ServicioDisponibilidadDTO}.
 */
@Mapper(componentModel = "spring")
public interface ServicioDisponibilidadMapper extends EntityMapper<ServicioDisponibilidadDTO, ServicioDisponibilidad> {

    @Mapping(target = "servicio", source = "servicio", qualifiedByName = "servicioId")
    ServicioDisponibilidadDTO toDto(ServicioDisponibilidad s);

    @Named("servicioId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    ServicioDTO toDtoServicioId(Servicio servicio);
}
