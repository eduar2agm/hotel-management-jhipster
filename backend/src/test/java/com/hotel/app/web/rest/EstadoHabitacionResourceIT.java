package com.hotel.app.web.rest;

import static com.hotel.app.domain.EstadoHabitacionAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.EstadoHabitacion;
import com.hotel.app.domain.enumeration.EstadoHabitacionNombre;
import com.hotel.app.repository.EstadoHabitacionRepository;
import com.hotel.app.service.dto.EstadoHabitacionDTO;
import com.hotel.app.service.mapper.EstadoHabitacionMapper;
import jakarta.persistence.EntityManager;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link EstadoHabitacionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class EstadoHabitacionResourceIT {

    private static final EstadoHabitacionNombre DEFAULT_NOMBRE = EstadoHabitacionNombre.DISPONIBLE;
    private static final EstadoHabitacionNombre UPDATED_NOMBRE = EstadoHabitacionNombre.OCUPADA;

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/estado-habitacions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private EstadoHabitacionRepository estadoHabitacionRepository;

    @Autowired
    private EstadoHabitacionMapper estadoHabitacionMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEstadoHabitacionMockMvc;

    private EstadoHabitacion estadoHabitacion;

    private EstadoHabitacion insertedEstadoHabitacion;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EstadoHabitacion createEntity() {
        return new EstadoHabitacion().nombre(DEFAULT_NOMBRE).descripcion(DEFAULT_DESCRIPCION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EstadoHabitacion createUpdatedEntity() {
        return new EstadoHabitacion().nombre(UPDATED_NOMBRE).descripcion(UPDATED_DESCRIPCION);
    }

    @BeforeEach
    void initTest() {
        estadoHabitacion = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedEstadoHabitacion != null) {
            estadoHabitacionRepository.delete(insertedEstadoHabitacion);
            insertedEstadoHabitacion = null;
        }
    }

    @Test
    @Transactional
    void createEstadoHabitacion() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the EstadoHabitacion
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);
        var returnedEstadoHabitacionDTO = om.readValue(
            restEstadoHabitacionMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(estadoHabitacionDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            EstadoHabitacionDTO.class
        );

        // Validate the EstadoHabitacion in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedEstadoHabitacion = estadoHabitacionMapper.toEntity(returnedEstadoHabitacionDTO);
        assertEstadoHabitacionUpdatableFieldsEquals(returnedEstadoHabitacion, getPersistedEstadoHabitacion(returnedEstadoHabitacion));

        insertedEstadoHabitacion = returnedEstadoHabitacion;
    }

    @Test
    @Transactional
    void createEstadoHabitacionWithExistingId() throws Exception {
        // Create the EstadoHabitacion with an existing ID
        estadoHabitacion.setId(1L);
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEstadoHabitacionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        estadoHabitacion.setNombre(null);

        // Create the EstadoHabitacion, which fails.
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        restEstadoHabitacionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEstadoHabitacions() throws Exception {
        // Initialize the database
        insertedEstadoHabitacion = estadoHabitacionRepository.saveAndFlush(estadoHabitacion);

        // Get all the estadoHabitacionList
        restEstadoHabitacionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(estadoHabitacion.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE.toString())))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)));
    }

    @Test
    @Transactional
    void getEstadoHabitacion() throws Exception {
        // Initialize the database
        insertedEstadoHabitacion = estadoHabitacionRepository.saveAndFlush(estadoHabitacion);

        // Get the estadoHabitacion
        restEstadoHabitacionMockMvc
            .perform(get(ENTITY_API_URL_ID, estadoHabitacion.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(estadoHabitacion.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE.toString()))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION));
    }

    @Test
    @Transactional
    void getNonExistingEstadoHabitacion() throws Exception {
        // Get the estadoHabitacion
        restEstadoHabitacionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingEstadoHabitacion() throws Exception {
        // Initialize the database
        insertedEstadoHabitacion = estadoHabitacionRepository.saveAndFlush(estadoHabitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the estadoHabitacion
        EstadoHabitacion updatedEstadoHabitacion = estadoHabitacionRepository.findById(estadoHabitacion.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedEstadoHabitacion are not directly saved in db
        em.detach(updatedEstadoHabitacion);
        updatedEstadoHabitacion.nombre(UPDATED_NOMBRE).descripcion(UPDATED_DESCRIPCION);
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(updatedEstadoHabitacion);

        restEstadoHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, estadoHabitacionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isOk());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedEstadoHabitacionToMatchAllProperties(updatedEstadoHabitacion);
    }

    @Test
    @Transactional
    void putNonExistingEstadoHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        estadoHabitacion.setId(longCount.incrementAndGet());

        // Create the EstadoHabitacion
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEstadoHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, estadoHabitacionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEstadoHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        estadoHabitacion.setId(longCount.incrementAndGet());

        // Create the EstadoHabitacion
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEstadoHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEstadoHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        estadoHabitacion.setId(longCount.incrementAndGet());

        // Create the EstadoHabitacion
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEstadoHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEstadoHabitacionWithPatch() throws Exception {
        // Initialize the database
        insertedEstadoHabitacion = estadoHabitacionRepository.saveAndFlush(estadoHabitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the estadoHabitacion using partial update
        EstadoHabitacion partialUpdatedEstadoHabitacion = new EstadoHabitacion();
        partialUpdatedEstadoHabitacion.setId(estadoHabitacion.getId());

        restEstadoHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEstadoHabitacion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEstadoHabitacion))
            )
            .andExpect(status().isOk());

        // Validate the EstadoHabitacion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEstadoHabitacionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedEstadoHabitacion, estadoHabitacion),
            getPersistedEstadoHabitacion(estadoHabitacion)
        );
    }

    @Test
    @Transactional
    void fullUpdateEstadoHabitacionWithPatch() throws Exception {
        // Initialize the database
        insertedEstadoHabitacion = estadoHabitacionRepository.saveAndFlush(estadoHabitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the estadoHabitacion using partial update
        EstadoHabitacion partialUpdatedEstadoHabitacion = new EstadoHabitacion();
        partialUpdatedEstadoHabitacion.setId(estadoHabitacion.getId());

        partialUpdatedEstadoHabitacion.nombre(UPDATED_NOMBRE).descripcion(UPDATED_DESCRIPCION);

        restEstadoHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEstadoHabitacion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEstadoHabitacion))
            )
            .andExpect(status().isOk());

        // Validate the EstadoHabitacion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEstadoHabitacionUpdatableFieldsEquals(
            partialUpdatedEstadoHabitacion,
            getPersistedEstadoHabitacion(partialUpdatedEstadoHabitacion)
        );
    }

    @Test
    @Transactional
    void patchNonExistingEstadoHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        estadoHabitacion.setId(longCount.incrementAndGet());

        // Create the EstadoHabitacion
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEstadoHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, estadoHabitacionDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEstadoHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        estadoHabitacion.setId(longCount.incrementAndGet());

        // Create the EstadoHabitacion
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEstadoHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEstadoHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        estadoHabitacion.setId(longCount.incrementAndGet());

        // Create the EstadoHabitacion
        EstadoHabitacionDTO estadoHabitacionDTO = estadoHabitacionMapper.toDto(estadoHabitacion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEstadoHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(estadoHabitacionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the EstadoHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEstadoHabitacion() throws Exception {
        // Initialize the database
        insertedEstadoHabitacion = estadoHabitacionRepository.saveAndFlush(estadoHabitacion);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the estadoHabitacion
        restEstadoHabitacionMockMvc
            .perform(delete(ENTITY_API_URL_ID, estadoHabitacion.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return estadoHabitacionRepository.count();
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

    protected EstadoHabitacion getPersistedEstadoHabitacion(EstadoHabitacion estadoHabitacion) {
        return estadoHabitacionRepository.findById(estadoHabitacion.getId()).orElseThrow();
    }

    protected void assertPersistedEstadoHabitacionToMatchAllProperties(EstadoHabitacion expectedEstadoHabitacion) {
        assertEstadoHabitacionAllPropertiesEquals(expectedEstadoHabitacion, getPersistedEstadoHabitacion(expectedEstadoHabitacion));
    }

    protected void assertPersistedEstadoHabitacionToMatchUpdatableProperties(EstadoHabitacion expectedEstadoHabitacion) {
        assertEstadoHabitacionAllUpdatablePropertiesEquals(
            expectedEstadoHabitacion,
            getPersistedEstadoHabitacion(expectedEstadoHabitacion)
        );
    }
}
