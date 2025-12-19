package com.hotel.app.web.rest;

import static com.hotel.app.domain.ConfiguracionSistemaAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.ConfiguracionSistema;
import com.hotel.app.domain.enumeration.TipoConfiguracion;
import com.hotel.app.repository.ConfiguracionSistemaRepository;
import com.hotel.app.service.ConfiguracionSistemaService;
import com.hotel.app.service.dto.ConfiguracionSistemaDTO;
import com.hotel.app.service.mapper.ConfiguracionSistemaMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link ConfiguracionSistemaResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ConfiguracionSistemaResourceIT {

    private static final String DEFAULT_CLAVE = "AAAAAAAAAA";
    private static final String UPDATED_CLAVE = "BBBBBBBBBB";

    private static final String DEFAULT_VALOR = "AAAAAAAAAA";
    private static final String UPDATED_VALOR = "BBBBBBBBBB";

    private static final TipoConfiguracion DEFAULT_TIPO = TipoConfiguracion.TEXT;
    private static final TipoConfiguracion UPDATED_TIPO = TipoConfiguracion.NUMBER;

    private static final String DEFAULT_CATEGORIA = "AAAAAAAAAA";
    private static final String UPDATED_CATEGORIA = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final Instant DEFAULT_FECHA_MODIFICACION = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA_MODIFICACION = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/configuracion-sistemas";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ConfiguracionSistemaRepository configuracionSistemaRepository;

    @Mock
    private ConfiguracionSistemaRepository configuracionSistemaRepositoryMock;

    @Autowired
    private ConfiguracionSistemaMapper configuracionSistemaMapper;

    @Mock
    private ConfiguracionSistemaService configuracionSistemaServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restConfiguracionSistemaMockMvc;

    private ConfiguracionSistema configuracionSistema;

    private ConfiguracionSistema insertedConfiguracionSistema;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ConfiguracionSistema createEntity() {
        return new ConfiguracionSistema()
            .clave(DEFAULT_CLAVE)
            .valor(DEFAULT_VALOR)
            .tipo(DEFAULT_TIPO)
            .categoria(DEFAULT_CATEGORIA)
            .descripcion(DEFAULT_DESCRIPCION)
            .activo(DEFAULT_ACTIVO)
            .fechaModificacion(DEFAULT_FECHA_MODIFICACION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ConfiguracionSistema createUpdatedEntity() {
        return new ConfiguracionSistema()
            .clave(UPDATED_CLAVE)
            .valor(UPDATED_VALOR)
            .tipo(UPDATED_TIPO)
            .categoria(UPDATED_CATEGORIA)
            .descripcion(UPDATED_DESCRIPCION)
            .activo(UPDATED_ACTIVO)
            .fechaModificacion(UPDATED_FECHA_MODIFICACION);
    }

    @BeforeEach
    void initTest() {
        configuracionSistema = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedConfiguracionSistema != null) {
            configuracionSistemaRepository.delete(insertedConfiguracionSistema);
            insertedConfiguracionSistema = null;
        }
    }

    @Test
    @Transactional
    void createConfiguracionSistema() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ConfiguracionSistema
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);
        var returnedConfiguracionSistemaDTO = om.readValue(
            restConfiguracionSistemaMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(configuracionSistemaDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ConfiguracionSistemaDTO.class
        );

        // Validate the ConfiguracionSistema in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedConfiguracionSistema = configuracionSistemaMapper.toEntity(returnedConfiguracionSistemaDTO);
        assertConfiguracionSistemaUpdatableFieldsEquals(
            returnedConfiguracionSistema,
            getPersistedConfiguracionSistema(returnedConfiguracionSistema)
        );

        insertedConfiguracionSistema = returnedConfiguracionSistema;
    }

    @Test
    @Transactional
    void createConfiguracionSistemaWithExistingId() throws Exception {
        // Create the ConfiguracionSistema with an existing ID
        configuracionSistema.setId(1L);
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restConfiguracionSistemaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkClaveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        configuracionSistema.setClave(null);

        // Create the ConfiguracionSistema, which fails.
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        restConfiguracionSistemaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTipoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        configuracionSistema.setTipo(null);

        // Create the ConfiguracionSistema, which fails.
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        restConfiguracionSistemaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        configuracionSistema.setActivo(null);

        // Create the ConfiguracionSistema, which fails.
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        restConfiguracionSistemaMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllConfiguracionSistemas() throws Exception {
        // Initialize the database
        insertedConfiguracionSistema = configuracionSistemaRepository.saveAndFlush(configuracionSistema);

        // Get all the configuracionSistemaList
        restConfiguracionSistemaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(configuracionSistema.getId().intValue())))
            .andExpect(jsonPath("$.[*].clave").value(hasItem(DEFAULT_CLAVE)))
            .andExpect(jsonPath("$.[*].valor").value(hasItem(DEFAULT_VALOR)))
            .andExpect(jsonPath("$.[*].tipo").value(hasItem(DEFAULT_TIPO.toString())))
            .andExpect(jsonPath("$.[*].categoria").value(hasItem(DEFAULT_CATEGORIA)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)))
            .andExpect(jsonPath("$.[*].fechaModificacion").value(hasItem(DEFAULT_FECHA_MODIFICACION.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllConfiguracionSistemasWithEagerRelationshipsIsEnabled() throws Exception {
        when(configuracionSistemaServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restConfiguracionSistemaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(configuracionSistemaServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllConfiguracionSistemasWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(configuracionSistemaServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restConfiguracionSistemaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(configuracionSistemaRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getConfiguracionSistema() throws Exception {
        // Initialize the database
        insertedConfiguracionSistema = configuracionSistemaRepository.saveAndFlush(configuracionSistema);

        // Get the configuracionSistema
        restConfiguracionSistemaMockMvc
            .perform(get(ENTITY_API_URL_ID, configuracionSistema.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(configuracionSistema.getId().intValue()))
            .andExpect(jsonPath("$.clave").value(DEFAULT_CLAVE))
            .andExpect(jsonPath("$.valor").value(DEFAULT_VALOR))
            .andExpect(jsonPath("$.tipo").value(DEFAULT_TIPO.toString()))
            .andExpect(jsonPath("$.categoria").value(DEFAULT_CATEGORIA))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO))
            .andExpect(jsonPath("$.fechaModificacion").value(DEFAULT_FECHA_MODIFICACION.toString()));
    }

    @Test
    @Transactional
    void getNonExistingConfiguracionSistema() throws Exception {
        // Get the configuracionSistema
        restConfiguracionSistemaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingConfiguracionSistema() throws Exception {
        // Initialize the database
        insertedConfiguracionSistema = configuracionSistemaRepository.saveAndFlush(configuracionSistema);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the configuracionSistema
        ConfiguracionSistema updatedConfiguracionSistema = configuracionSistemaRepository
            .findById(configuracionSistema.getId())
            .orElseThrow();
        // Disconnect from session so that the updates on updatedConfiguracionSistema are not directly saved in db
        em.detach(updatedConfiguracionSistema);
        updatedConfiguracionSistema
            .clave(UPDATED_CLAVE)
            .valor(UPDATED_VALOR)
            .tipo(UPDATED_TIPO)
            .categoria(UPDATED_CATEGORIA)
            .descripcion(UPDATED_DESCRIPCION)
            .activo(UPDATED_ACTIVO)
            .fechaModificacion(UPDATED_FECHA_MODIFICACION);
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(updatedConfiguracionSistema);

        restConfiguracionSistemaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, configuracionSistemaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isOk());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedConfiguracionSistemaToMatchAllProperties(updatedConfiguracionSistema);
    }

    @Test
    @Transactional
    void putNonExistingConfiguracionSistema() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        configuracionSistema.setId(longCount.incrementAndGet());

        // Create the ConfiguracionSistema
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConfiguracionSistemaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, configuracionSistemaDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchConfiguracionSistema() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        configuracionSistema.setId(longCount.incrementAndGet());

        // Create the ConfiguracionSistema
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConfiguracionSistemaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamConfiguracionSistema() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        configuracionSistema.setId(longCount.incrementAndGet());

        // Create the ConfiguracionSistema
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConfiguracionSistemaMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateConfiguracionSistemaWithPatch() throws Exception {
        // Initialize the database
        insertedConfiguracionSistema = configuracionSistemaRepository.saveAndFlush(configuracionSistema);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the configuracionSistema using partial update
        ConfiguracionSistema partialUpdatedConfiguracionSistema = new ConfiguracionSistema();
        partialUpdatedConfiguracionSistema.setId(configuracionSistema.getId());

        partialUpdatedConfiguracionSistema
            .valor(UPDATED_VALOR)
            .tipo(UPDATED_TIPO)
            .descripcion(UPDATED_DESCRIPCION)
            .activo(UPDATED_ACTIVO)
            .fechaModificacion(UPDATED_FECHA_MODIFICACION);

        restConfiguracionSistemaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConfiguracionSistema.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedConfiguracionSistema))
            )
            .andExpect(status().isOk());

        // Validate the ConfiguracionSistema in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertConfiguracionSistemaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedConfiguracionSistema, configuracionSistema),
            getPersistedConfiguracionSistema(configuracionSistema)
        );
    }

    @Test
    @Transactional
    void fullUpdateConfiguracionSistemaWithPatch() throws Exception {
        // Initialize the database
        insertedConfiguracionSistema = configuracionSistemaRepository.saveAndFlush(configuracionSistema);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the configuracionSistema using partial update
        ConfiguracionSistema partialUpdatedConfiguracionSistema = new ConfiguracionSistema();
        partialUpdatedConfiguracionSistema.setId(configuracionSistema.getId());

        partialUpdatedConfiguracionSistema
            .clave(UPDATED_CLAVE)
            .valor(UPDATED_VALOR)
            .tipo(UPDATED_TIPO)
            .categoria(UPDATED_CATEGORIA)
            .descripcion(UPDATED_DESCRIPCION)
            .activo(UPDATED_ACTIVO)
            .fechaModificacion(UPDATED_FECHA_MODIFICACION);

        restConfiguracionSistemaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedConfiguracionSistema.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedConfiguracionSistema))
            )
            .andExpect(status().isOk());

        // Validate the ConfiguracionSistema in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertConfiguracionSistemaUpdatableFieldsEquals(
            partialUpdatedConfiguracionSistema,
            getPersistedConfiguracionSistema(partialUpdatedConfiguracionSistema)
        );
    }

    @Test
    @Transactional
    void patchNonExistingConfiguracionSistema() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        configuracionSistema.setId(longCount.incrementAndGet());

        // Create the ConfiguracionSistema
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restConfiguracionSistemaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, configuracionSistemaDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchConfiguracionSistema() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        configuracionSistema.setId(longCount.incrementAndGet());

        // Create the ConfiguracionSistema
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConfiguracionSistemaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamConfiguracionSistema() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        configuracionSistema.setId(longCount.incrementAndGet());

        // Create the ConfiguracionSistema
        ConfiguracionSistemaDTO configuracionSistemaDTO = configuracionSistemaMapper.toDto(configuracionSistema);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restConfiguracionSistemaMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(configuracionSistemaDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ConfiguracionSistema in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteConfiguracionSistema() throws Exception {
        // Initialize the database
        insertedConfiguracionSistema = configuracionSistemaRepository.saveAndFlush(configuracionSistema);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the configuracionSistema
        restConfiguracionSistemaMockMvc
            .perform(delete(ENTITY_API_URL_ID, configuracionSistema.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return configuracionSistemaRepository.count();
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

    protected ConfiguracionSistema getPersistedConfiguracionSistema(ConfiguracionSistema configuracionSistema) {
        return configuracionSistemaRepository.findById(configuracionSistema.getId()).orElseThrow();
    }

    protected void assertPersistedConfiguracionSistemaToMatchAllProperties(ConfiguracionSistema expectedConfiguracionSistema) {
        assertConfiguracionSistemaAllPropertiesEquals(
            expectedConfiguracionSistema,
            getPersistedConfiguracionSistema(expectedConfiguracionSistema)
        );
    }

    protected void assertPersistedConfiguracionSistemaToMatchUpdatableProperties(ConfiguracionSistema expectedConfiguracionSistema) {
        assertConfiguracionSistemaAllUpdatablePropertiesEquals(
            expectedConfiguracionSistema,
            getPersistedConfiguracionSistema(expectedConfiguracionSistema)
        );
    }
}
