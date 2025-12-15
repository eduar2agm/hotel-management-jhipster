package com.hotel.app.service.mapper;

import com.hotel.app.domain.Cliente;
import com.hotel.app.domain.Reserva;
import com.hotel.app.service.dto.ClienteDTO;
import com.hotel.app.service.dto.ReservaDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Reserva} and its DTO {@link ReservaDTO}.
 */
@Mapper(componentModel = "spring")
public interface ReservaMapper extends EntityMapper<ReservaDTO, Reserva> {
    @Mapping(target = "cliente", source = "cliente", qualifiedByName = "clienteNombre")
    ReservaDTO toDto(Reserva s);

    @Named("clienteNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    @Mapping(target = "apellido", source = "apellido")
    ClienteDTO toDtoClienteNombre(Cliente cliente);
}
