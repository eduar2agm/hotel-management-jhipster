package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class HabitacionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HabitacionDTO.class);
        HabitacionDTO habitacionDTO1 = new HabitacionDTO();
        habitacionDTO1.setId(1L);
        HabitacionDTO habitacionDTO2 = new HabitacionDTO();
        assertThat(habitacionDTO1).isNotEqualTo(habitacionDTO2);
        habitacionDTO2.setId(habitacionDTO1.getId());
        assertThat(habitacionDTO1).isEqualTo(habitacionDTO2);
        habitacionDTO2.setId(2L);
        assertThat(habitacionDTO1).isNotEqualTo(habitacionDTO2);
        habitacionDTO1.setId(null);
        assertThat(habitacionDTO1).isNotEqualTo(habitacionDTO2);
    }
}
