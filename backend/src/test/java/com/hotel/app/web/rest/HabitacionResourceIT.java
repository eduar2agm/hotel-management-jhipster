package com.hotel.app.web.rest;

import static com.hotel.app.domain.HabitacionAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.Habitacion;
import com.hotel.app.repository.HabitacionRepository;
import com.hotel.app.service.HabitacionService;
import com.hotel.app.service.dto.HabitacionDTO;
import com.hotel.app.service.mapper.HabitacionMapper;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link HabitacionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class HabitacionResourceIT {

    private static final String DEFAULT_NUMERO = "AAAAAAAAAA";
    private static final String UPDATED_NUMERO = "BBBBBBBBBB";

    private static final Integer DEFAULT_CAPACIDAD = 1;
    private static final Integer UPDATED_CAPACIDAD = 2;

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final String DEFAULT_IMAGEN = "AAAAAAAAAA";
    private static final String UPDATED_IMAGEN = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/habitacions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HabitacionRepository habitacionRepository;

    @Mock
    private HabitacionRepository habitacionRepositoryMock;

    @Autowired
    private HabitacionMapper habitacionMapper;

    @Mock
    private HabitacionService habitacionServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHabitacionMockMvc;

    private Habitacion habitacion;

    private Habitacion insertedHabitacion;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Habitacion createEntity() {
        return new Habitacion().numero(DEFAULT_NUMERO).capacidad(DEFAULT_CAPACIDAD).descripcion(DEFAULT_DESCRIPCION).imagen(DEFAULT_IMAGEN);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Habitacion createUpdatedEntity() {
        return new Habitacion().numero(UPDATED_NUMERO).capacidad(UPDATED_CAPACIDAD).descripcion(UPDATED_DESCRIPCION).imagen(UPDATED_IMAGEN);
    }

    @BeforeEach
    void initTest() {
        habitacion = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedHabitacion != null) {
            habitacionRepository.delete(insertedHabitacion);
            insertedHabitacion = null;
        }
    }

    @Test
    @Transactional
    void createHabitacion() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Habitacion
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);
        var returnedHabitacionDTO = om.readValue(
            restHabitacionMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(habitacionDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HabitacionDTO.class
        );

        // Validate the Habitacion in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedHabitacion = habitacionMapper.toEntity(returnedHabitacionDTO);
        assertHabitacionUpdatableFieldsEquals(returnedHabitacion, getPersistedHabitacion(returnedHabitacion));

        insertedHabitacion = returnedHabitacion;
    }

    @Test
    @Transactional
    void createHabitacionWithExistingId() throws Exception {
        // Create the Habitacion with an existing ID
        habitacion.setId(1L);
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHabitacionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(habitacionDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNumeroIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        habitacion.setNumero(null);

        // Create the Habitacion, which fails.
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        restHabitacionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(habitacionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCapacidadIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        habitacion.setCapacidad(null);

        // Create the Habitacion, which fails.
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        restHabitacionMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(habitacionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHabitacions() throws Exception {
        // Initialize the database
        insertedHabitacion = habitacionRepository.saveAndFlush(habitacion);

        // Get all the habitacionList
        restHabitacionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(habitacion.getId().intValue())))
            .andExpect(jsonPath("$.[*].numero").value(hasItem(DEFAULT_NUMERO)))
            .andExpect(jsonPath("$.[*].capacidad").value(hasItem(DEFAULT_CAPACIDAD)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].imagen").value(hasItem(DEFAULT_IMAGEN)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllHabitacionsWithEagerRelationshipsIsEnabled() throws Exception {
        when(habitacionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restHabitacionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(habitacionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllHabitacionsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(habitacionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restHabitacionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(habitacionRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getHabitacion() throws Exception {
        // Initialize the database
        insertedHabitacion = habitacionRepository.saveAndFlush(habitacion);

        // Get the habitacion
        restHabitacionMockMvc
            .perform(get(ENTITY_API_URL_ID, habitacion.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(habitacion.getId().intValue()))
            .andExpect(jsonPath("$.numero").value(DEFAULT_NUMERO))
            .andExpect(jsonPath("$.capacidad").value(DEFAULT_CAPACIDAD))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.imagen").value(DEFAULT_IMAGEN));
    }

    @Test
    @Transactional
    void getNonExistingHabitacion() throws Exception {
        // Get the habitacion
        restHabitacionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingHabitacion() throws Exception {
        // Initialize the database
        insertedHabitacion = habitacionRepository.saveAndFlush(habitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the habitacion
        Habitacion updatedHabitacion = habitacionRepository.findById(habitacion.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedHabitacion are not directly saved in db
        em.detach(updatedHabitacion);
        updatedHabitacion.numero(UPDATED_NUMERO).capacidad(UPDATED_CAPACIDAD).descripcion(UPDATED_DESCRIPCION).imagen(UPDATED_IMAGEN);
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(updatedHabitacion);

        restHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, habitacionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(habitacionDTO))
            )
            .andExpect(status().isOk());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedHabitacionToMatchAllProperties(updatedHabitacion);
    }

    @Test
    @Transactional
    void putNonExistingHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        habitacion.setId(longCount.incrementAndGet());

        // Create the Habitacion
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, habitacionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(habitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        habitacion.setId(longCount.incrementAndGet());

        // Create the Habitacion
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(habitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        habitacion.setId(longCount.incrementAndGet());

        // Create the Habitacion
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHabitacionMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(habitacionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHabitacionWithPatch() throws Exception {
        // Initialize the database
        insertedHabitacion = habitacionRepository.saveAndFlush(habitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the habitacion using partial update
        Habitacion partialUpdatedHabitacion = new Habitacion();
        partialUpdatedHabitacion.setId(habitacion.getId());

        restHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHabitacion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHabitacion))
            )
            .andExpect(status().isOk());

        // Validate the Habitacion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHabitacionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedHabitacion, habitacion),
            getPersistedHabitacion(habitacion)
        );
    }

    @Test
    @Transactional
    void fullUpdateHabitacionWithPatch() throws Exception {
        // Initialize the database
        insertedHabitacion = habitacionRepository.saveAndFlush(habitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the habitacion using partial update
        Habitacion partialUpdatedHabitacion = new Habitacion();
        partialUpdatedHabitacion.setId(habitacion.getId());

        partialUpdatedHabitacion
            .numero(UPDATED_NUMERO)
            .capacidad(UPDATED_CAPACIDAD)
            .descripcion(UPDATED_DESCRIPCION)
            .imagen(UPDATED_IMAGEN);

        restHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHabitacion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHabitacion))
            )
            .andExpect(status().isOk());

        // Validate the Habitacion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHabitacionUpdatableFieldsEquals(partialUpdatedHabitacion, getPersistedHabitacion(partialUpdatedHabitacion));
    }

    @Test
    @Transactional
    void patchNonExistingHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        habitacion.setId(longCount.incrementAndGet());

        // Create the Habitacion
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, habitacionDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(habitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        habitacion.setId(longCount.incrementAndGet());

        // Create the Habitacion
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(habitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        habitacion.setId(longCount.incrementAndGet());

        // Create the Habitacion
        HabitacionDTO habitacionDTO = habitacionMapper.toDto(habitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(habitacionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Habitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHabitacion() throws Exception {
        // Initialize the database
        insertedHabitacion = habitacionRepository.saveAndFlush(habitacion);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the habitacion
        restHabitacionMockMvc
            .perform(delete(ENTITY_API_URL_ID, habitacion.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return habitacionRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Habitacion getPersistedHabitacion(Habitacion habitacion) {
        return habitacionRepository.findById(habitacion.getId()).orElseThrow();
    }

    protected void assertPersistedHabitacionToMatchAllProperties(Habitacion expectedHabitacion) {
        assertHabitacionAllPropertiesEquals(expectedHabitacion, getPersistedHabitacion(expectedHabitacion));
    }

    protected void assertPersistedHabitacionToMatchUpdatableProperties(Habitacion expectedHabitacion) {
        assertHabitacionAllUpdatablePropertiesEquals(expectedHabitacion, getPersistedHabitacion(expectedHabitacion));
    }
}
