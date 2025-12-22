package com.hotel.app.service.mapper;

import com.hotel.app.domain.SeccionHero;
import com.hotel.app.service.dto.SeccionHeroDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link SeccionHero} and its DTO {@link SeccionHeroDTO}.
 */
@Mapper(componentModel = "spring")
public interface SeccionHeroMapper extends EntityMapper<SeccionHeroDTO, SeccionHero> {}
