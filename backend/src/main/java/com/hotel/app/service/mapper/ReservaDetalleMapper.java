package com.hotel.app.service.mapper;

import com.hotel.app.domain.CategoriaHabitacion;
import com.hotel.app.domain.Habitacion;
import com.hotel.app.domain.Reserva;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.service.dto.CategoriaHabitacionDTO;
import com.hotel.app.service.dto.HabitacionDTO;
import com.hotel.app.service.dto.ReservaDTO;
import com.hotel.app.service.dto.ReservaDetalleDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ReservaDetalle} and its DTO
 * {@link ReservaDetalleDTO}.
 * 
 * Note: includes custom mappings to show Room Price and Category Name in
 * details.
 */
@Mapper(componentModel = "spring", uses = { ReservaMapper.class })
public interface ReservaDetalleMapper extends EntityMapper<ReservaDetalleDTO, ReservaDetalle> {
    @Mapping(target = "reserva", source = "reserva")
    @Mapping(target = "habitacion", source = "habitacion", qualifiedByName = "habitacionNumero")
    ReservaDetalleDTO toDto(ReservaDetalle s);

    @Named("reservaId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ReservaDTO toDtoReservaId(Reserva reserva);

    @Named("habitacionNumero")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "numero", source = "numero")
    @Mapping(target = "imagen", source = "imagen")
    @Mapping(target = "categoriaHabitacion", ignore = true)
    HabitacionDTO toDtoHabitacionNumero(Habitacion habitacion);

    @AfterMapping
    default void mapCategoriaHabitacion(Habitacion habitacion, @MappingTarget HabitacionDTO dto) {
        if (habitacion.getCategoriaHabitacion() != null) {
            dto.setCategoriaHabitacion(toDtoCategoriaHabitacionNombrePrecio(habitacion.getCategoriaHabitacion()));
        }
    }

    @Named("categoriaHabitacionNombrePrecio")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    @Mapping(target = "precioBase", source = "precioBase")
    CategoriaHabitacionDTO toDtoCategoriaHabitacionNombrePrecio(CategoriaHabitacion categoriaHabitacion);
}
