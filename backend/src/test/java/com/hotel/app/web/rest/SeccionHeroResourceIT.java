package com.hotel.app.web.rest;

import static com.hotel.app.domain.SeccionHeroAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.SeccionHero;
import com.hotel.app.repository.SeccionHeroRepository;
import com.hotel.app.service.dto.SeccionHeroDTO;
import com.hotel.app.service.mapper.SeccionHeroMapper;
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
 * Integration tests for the {@link SeccionHeroResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class SeccionHeroResourceIT {

    private static final String DEFAULT_TITULO = "AAAAAAAAAA";
    private static final String UPDATED_TITULO = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final String DEFAULT_IMAGEN_FONDO_URL = "AAAAAAAAAA";
    private static final String UPDATED_IMAGEN_FONDO_URL = "BBBBBBBBBB";

    private static final String DEFAULT_TEXTO_BOTON = "AAAAAAAAAA";
    private static final String UPDATED_TEXTO_BOTON = "BBBBBBBBBB";

    private static final String DEFAULT_ENLACE_BOTON = "AAAAAAAAAA";
    private static final String UPDATED_ENLACE_BOTON = "BBBBBBBBBB";

    private static final Integer DEFAULT_ORDEN = 1;
    private static final Integer UPDATED_ORDEN = 2;

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/seccion-heroes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private SeccionHeroRepository seccionHeroRepository;

    @Autowired
    private SeccionHeroMapper seccionHeroMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSeccionHeroMockMvc;

    private SeccionHero seccionHero;

    private SeccionHero insertedSeccionHero;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SeccionHero createEntity() {
        return new SeccionHero()
            .titulo(DEFAULT_TITULO)
            .descripcion(DEFAULT_DESCRIPCION)
            .imagenFondoUrl(DEFAULT_IMAGEN_FONDO_URL)
            .textoBoton(DEFAULT_TEXTO_BOTON)
            .enlaceBoton(DEFAULT_ENLACE_BOTON)
            .orden(DEFAULT_ORDEN)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SeccionHero createUpdatedEntity() {
        return new SeccionHero()
            .titulo(UPDATED_TITULO)
            .descripcion(UPDATED_DESCRIPCION)
            .imagenFondoUrl(UPDATED_IMAGEN_FONDO_URL)
            .textoBoton(UPDATED_TEXTO_BOTON)
            .enlaceBoton(UPDATED_ENLACE_BOTON)
            .orden(UPDATED_ORDEN)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        seccionHero = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedSeccionHero != null) {
            seccionHeroRepository.delete(insertedSeccionHero);
            insertedSeccionHero = null;
        }
    }

    @Test
    @Transactional
    void createSeccionHero() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the SeccionHero
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);
        var returnedSeccionHeroDTO = om.readValue(
            restSeccionHeroMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionHeroDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            SeccionHeroDTO.class
        );

        // Validate the SeccionHero in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedSeccionHero = seccionHeroMapper.toEntity(returnedSeccionHeroDTO);
        assertSeccionHeroUpdatableFieldsEquals(returnedSeccionHero, getPersistedSeccionHero(returnedSeccionHero));

        insertedSeccionHero = returnedSeccionHero;
    }

    @Test
    @Transactional
    void createSeccionHeroWithExistingId() throws Exception {
        // Create the SeccionHero with an existing ID
        seccionHero.setId(1L);
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSeccionHeroMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTituloIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        seccionHero.setTitulo(null);

        // Create the SeccionHero, which fails.
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        restSeccionHeroMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkImagenFondoUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        seccionHero.setImagenFondoUrl(null);

        // Create the SeccionHero, which fails.
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        restSeccionHeroMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkOrdenIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        seccionHero.setOrden(null);

        // Create the SeccionHero, which fails.
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        restSeccionHeroMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        seccionHero.setActivo(null);

        // Create the SeccionHero, which fails.
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        restSeccionHeroMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSeccionHeroes() throws Exception {
        // Initialize the database
        insertedSeccionHero = seccionHeroRepository.saveAndFlush(seccionHero);

        // Get all the seccionHeroList
        restSeccionHeroMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(seccionHero.getId().intValue())))
            .andExpect(jsonPath("$.[*].titulo").value(hasItem(DEFAULT_TITULO)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].imagenFondoUrl").value(hasItem(DEFAULT_IMAGEN_FONDO_URL)))
            .andExpect(jsonPath("$.[*].textoBoton").value(hasItem(DEFAULT_TEXTO_BOTON)))
            .andExpect(jsonPath("$.[*].enlaceBoton").value(hasItem(DEFAULT_ENLACE_BOTON)))
            .andExpect(jsonPath("$.[*].orden").value(hasItem(DEFAULT_ORDEN)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getSeccionHero() throws Exception {
        // Initialize the database
        insertedSeccionHero = seccionHeroRepository.saveAndFlush(seccionHero);

        // Get the seccionHero
        restSeccionHeroMockMvc
            .perform(get(ENTITY_API_URL_ID, seccionHero.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(seccionHero.getId().intValue()))
            .andExpect(jsonPath("$.titulo").value(DEFAULT_TITULO))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.imagenFondoUrl").value(DEFAULT_IMAGEN_FONDO_URL))
            .andExpect(jsonPath("$.textoBoton").value(DEFAULT_TEXTO_BOTON))
            .andExpect(jsonPath("$.enlaceBoton").value(DEFAULT_ENLACE_BOTON))
            .andExpect(jsonPath("$.orden").value(DEFAULT_ORDEN))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingSeccionHero() throws Exception {
        // Get the seccionHero
        restSeccionHeroMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingSeccionHero() throws Exception {
        // Initialize the database
        insertedSeccionHero = seccionHeroRepository.saveAndFlush(seccionHero);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the seccionHero
        SeccionHero updatedSeccionHero = seccionHeroRepository.findById(seccionHero.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedSeccionHero are not directly saved in db
        em.detach(updatedSeccionHero);
        updatedSeccionHero
            .titulo(UPDATED_TITULO)
            .descripcion(UPDATED_DESCRIPCION)
            .imagenFondoUrl(UPDATED_IMAGEN_FONDO_URL)
            .textoBoton(UPDATED_TEXTO_BOTON)
            .enlaceBoton(UPDATED_ENLACE_BOTON)
            .orden(UPDATED_ORDEN)
            .activo(UPDATED_ACTIVO);
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(updatedSeccionHero);

        restSeccionHeroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, seccionHeroDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isOk());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedSeccionHeroToMatchAllProperties(updatedSeccionHero);
    }

    @Test
    @Transactional
    void putNonExistingSeccionHero() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionHero.setId(longCount.incrementAndGet());

        // Create the SeccionHero
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSeccionHeroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, seccionHeroDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSeccionHero() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionHero.setId(longCount.incrementAndGet());

        // Create the SeccionHero
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionHeroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSeccionHero() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionHero.setId(longCount.incrementAndGet());

        // Create the SeccionHero
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionHeroMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionHeroDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSeccionHeroWithPatch() throws Exception {
        // Initialize the database
        insertedSeccionHero = seccionHeroRepository.saveAndFlush(seccionHero);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the seccionHero using partial update
        SeccionHero partialUpdatedSeccionHero = new SeccionHero();
        partialUpdatedSeccionHero.setId(seccionHero.getId());

        partialUpdatedSeccionHero.textoBoton(UPDATED_TEXTO_BOTON).enlaceBoton(UPDATED_ENLACE_BOTON).orden(UPDATED_ORDEN);

        restSeccionHeroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSeccionHero.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSeccionHero))
            )
            .andExpect(status().isOk());

        // Validate the SeccionHero in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSeccionHeroUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedSeccionHero, seccionHero),
            getPersistedSeccionHero(seccionHero)
        );
    }

    @Test
    @Transactional
    void fullUpdateSeccionHeroWithPatch() throws Exception {
        // Initialize the database
        insertedSeccionHero = seccionHeroRepository.saveAndFlush(seccionHero);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the seccionHero using partial update
        SeccionHero partialUpdatedSeccionHero = new SeccionHero();
        partialUpdatedSeccionHero.setId(seccionHero.getId());

        partialUpdatedSeccionHero
            .titulo(UPDATED_TITULO)
            .descripcion(UPDATED_DESCRIPCION)
            .imagenFondoUrl(UPDATED_IMAGEN_FONDO_URL)
            .textoBoton(UPDATED_TEXTO_BOTON)
            .enlaceBoton(UPDATED_ENLACE_BOTON)
            .orden(UPDATED_ORDEN)
            .activo(UPDATED_ACTIVO);

        restSeccionHeroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSeccionHero.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSeccionHero))
            )
            .andExpect(status().isOk());

        // Validate the SeccionHero in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSeccionHeroUpdatableFieldsEquals(partialUpdatedSeccionHero, getPersistedSeccionHero(partialUpdatedSeccionHero));
    }

    @Test
    @Transactional
    void patchNonExistingSeccionHero() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionHero.setId(longCount.incrementAndGet());

        // Create the SeccionHero
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSeccionHeroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, seccionHeroDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSeccionHero() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionHero.setId(longCount.incrementAndGet());

        // Create the SeccionHero
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionHeroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSeccionHero() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionHero.setId(longCount.incrementAndGet());

        // Create the SeccionHero
        SeccionHeroDTO seccionHeroDTO = seccionHeroMapper.toDto(seccionHero);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionHeroMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(seccionHeroDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SeccionHero in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSeccionHero() throws Exception {
        // Initialize the database
        insertedSeccionHero = seccionHeroRepository.saveAndFlush(seccionHero);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the seccionHero
        restSeccionHeroMockMvc
            .perform(delete(ENTITY_API_URL_ID, seccionHero.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return seccionHeroRepository.count();
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

    protected SeccionHero getPersistedSeccionHero(SeccionHero seccionHero) {
        return seccionHeroRepository.findById(seccionHero.getId()).orElseThrow();
    }

    protected void assertPersistedSeccionHeroToMatchAllProperties(SeccionHero expectedSeccionHero) {
        assertSeccionHeroAllPropertiesEquals(expectedSeccionHero, getPersistedSeccionHero(expectedSeccionHero));
    }

    protected void assertPersistedSeccionHeroToMatchUpdatableProperties(SeccionHero expectedSeccionHero) {
        assertSeccionHeroAllUpdatablePropertiesEquals(expectedSeccionHero, getPersistedSeccionHero(expectedSeccionHero));
    }
}
