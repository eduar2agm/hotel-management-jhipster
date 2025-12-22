package com.hotel.app.service.mapper;

import com.hotel.app.domain.RedSociallanding;
import com.hotel.app.service.dto.RedSociallandingDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link RedSociallanding} and its DTO {@link RedSociallandingDTO}.
 */
@Mapper(componentModel = "spring")
public interface RedSociallandingMapper extends EntityMapper<RedSociallandingDTO, RedSociallanding> {}
