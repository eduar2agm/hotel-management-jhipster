package com.hotel.app.service.mapper;

import com.hotel.app.domain.CarouselItem;
import com.hotel.app.domain.ConfiguracionSistema;
import com.hotel.app.domain.Imagen;
import com.hotel.app.service.dto.CarouselItemDTO;
import com.hotel.app.service.dto.ConfiguracionSistemaDTO;
import com.hotel.app.service.dto.ImagenDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link CarouselItem} and its DTO {@link CarouselItemDTO}.
 */
@Mapper(componentModel = "spring")
public interface CarouselItemMapper extends EntityMapper<CarouselItemDTO, CarouselItem> {
    @Mapping(target = "imagen", source = "imagen", qualifiedByName = "imagenNombre")
    @Mapping(target = "configuracion", source = "configuracion", qualifiedByName = "configuracionSistemaClave")
    CarouselItemDTO toDto(CarouselItem s);

    @Named("imagenNombre")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "nombre", source = "nombre")
    ImagenDTO toDtoImagenNombre(Imagen imagen);

    @Named("configuracionSistemaClave")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "clave", source = "clave")
    ConfiguracionSistemaDTO toDtoConfiguracionSistemaClave(ConfiguracionSistema configuracionSistema);
}
