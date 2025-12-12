package com.hotel.app.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.hotel.app.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CategoriaHabitacionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CategoriaHabitacionDTO.class);
        CategoriaHabitacionDTO categoriaHabitacionDTO1 = new CategoriaHabitacionDTO();
        categoriaHabitacionDTO1.setId(1L);
        CategoriaHabitacionDTO categoriaHabitacionDTO2 = new CategoriaHabitacionDTO();
        assertThat(categoriaHabitacionDTO1).isNotEqualTo(categoriaHabitacionDTO2);
        categoriaHabitacionDTO2.setId(categoriaHabitacionDTO1.getId());
        assertThat(categoriaHabitacionDTO1).isEqualTo(categoriaHabitacionDTO2);
        categoriaHabitacionDTO2.setId(2L);
        assertThat(categoriaHabitacionDTO1).isNotEqualTo(categoriaHabitacionDTO2);
        categoriaHabitacionDTO1.setId(null);
        assertThat(categoriaHabitacionDTO1).isNotEqualTo(categoriaHabitacionDTO2);
    }
}
