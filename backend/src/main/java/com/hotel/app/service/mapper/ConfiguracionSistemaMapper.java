package com.hotel.app.service.mapper;

import com.hotel.app.domain.ConfiguracionSistema;
import com.hotel.app.domain.Imagen;
import com.hotel.app.service.dto.ConfiguracionSistemaDTO;
import com.hotel.app.service.dto.ImagenDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link ConfiguracionSistema} and its DTO {@link ConfiguracionSistemaDTO}.
 */
@Mapper(componentModel = "spring")
public interface ConfiguracionSistemaMapper extends EntityMapper<ConfiguracionSistemaDTO, ConfiguracionSistema> {
    @Mapping(target = "imagen", source = "imagen", qualifiedByName = "imagenNombre")
    ConfiguracionSistemaDTO toDto(ConfiguracionSistema s);

    @Named("imagenNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    ImagenDTO toDtoImagenNombre(Imagen imagen);
}
