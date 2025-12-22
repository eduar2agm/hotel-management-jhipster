package com.hotel.app.service.mapper;

import com.hotel.app.domain.SeccionContacto;
import com.hotel.app.service.dto.SeccionContactoDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link SeccionContacto} and its DTO {@link SeccionContactoDTO}.
 */
@Mapper(componentModel = "spring")
public interface SeccionContactoMapper extends EntityMapper<SeccionContactoDTO, SeccionContacto> {}
