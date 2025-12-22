package com.hotel.app.service.mapper;

import com.hotel.app.domain.RedSocial;
import com.hotel.app.service.dto.RedSocialDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link RedSocial} and its DTO {@link RedSocialDTO}.
 */
@Mapper(componentModel = "spring")
public interface RedSocialMapper extends EntityMapper<RedSocialDTO, RedSocial> {}
