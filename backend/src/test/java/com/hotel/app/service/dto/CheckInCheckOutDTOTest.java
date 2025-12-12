package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CheckInCheckOutDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CheckInCheckOutDTO.class);
        CheckInCheckOutDTO checkInCheckOutDTO1 = new CheckInCheckOutDTO();
        checkInCheckOutDTO1.setId(1L);
        CheckInCheckOutDTO checkInCheckOutDTO2 = new CheckInCheckOutDTO();
        assertThat(checkInCheckOutDTO1).isNotEqualTo(checkInCheckOutDTO2);
        checkInCheckOutDTO2.setId(checkInCheckOutDTO1.getId());
        assertThat(checkInCheckOutDTO1).isEqualTo(checkInCheckOutDTO2);
        checkInCheckOutDTO2.setId(2L);
        assertThat(checkInCheckOutDTO1).isNotEqualTo(checkInCheckOutDTO2);
        checkInCheckOutDTO1.setId(null);
        assertThat(checkInCheckOutDTO1).isNotEqualTo(checkInCheckOutDTO2);
    }
}
