package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class EstadoHabitacionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(EstadoHabitacionDTO.class);
        EstadoHabitacionDTO estadoHabitacionDTO1 = new EstadoHabitacionDTO();
        estadoHabitacionDTO1.setId(1L);
        EstadoHabitacionDTO estadoHabitacionDTO2 = new EstadoHabitacionDTO();
        assertThat(estadoHabitacionDTO1).isNotEqualTo(estadoHabitacionDTO2);
        estadoHabitacionDTO2.setId(estadoHabitacionDTO1.getId());
        assertThat(estadoHabitacionDTO1).isEqualTo(estadoHabitacionDTO2);
        estadoHabitacionDTO2.setId(2L);
        assertThat(estadoHabitacionDTO1).isNotEqualTo(estadoHabitacionDTO2);
        estadoHabitacionDTO1.setId(null);
        assertThat(estadoHabitacionDTO1).isNotEqualTo(estadoHabitacionDTO2);
    }
}
