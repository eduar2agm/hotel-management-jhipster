package com.hotel.app.web.rest;

import static com.hotel.app.domain.SeccionContactoAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.SeccionContacto;
import com.hotel.app.repository.SeccionContactoRepository;
import com.hotel.app.service.dto.SeccionContactoDTO;
import com.hotel.app.service.mapper.SeccionContactoMapper;
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
 * Integration tests for the {@link SeccionContactoResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class SeccionContactoResourceIT {

    private static final String DEFAULT_TITULO = "AAAAAAAAAA";
    private static final String UPDATED_TITULO = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final String DEFAULT_IMAGEN_FONDO_URL = "AAAAAAAAAA";
    private static final String UPDATED_IMAGEN_FONDO_URL = "BBBBBBBBBB";

    private static final String DEFAULT_CORREO = "AAAAAAAAAA";
    private static final String UPDATED_CORREO = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/seccion-contactos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private SeccionContactoRepository seccionContactoRepository;

    @Autowired
    private SeccionContactoMapper seccionContactoMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSeccionContactoMockMvc;

    private SeccionContacto seccionContacto;

    private SeccionContacto insertedSeccionContacto;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SeccionContacto createEntity() {
        return new SeccionContacto()
            .titulo(DEFAULT_TITULO)
            .descripcion(DEFAULT_DESCRIPCION)
            .imagenFondoUrl(DEFAULT_IMAGEN_FONDO_URL)
            .correo(DEFAULT_CORREO)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SeccionContacto createUpdatedEntity() {
        return new SeccionContacto()
            .titulo(UPDATED_TITULO)
            .descripcion(UPDATED_DESCRIPCION)
            .imagenFondoUrl(UPDATED_IMAGEN_FONDO_URL)
            .correo(UPDATED_CORREO)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        seccionContacto = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedSeccionContacto != null) {
            seccionContactoRepository.delete(insertedSeccionContacto);
            insertedSeccionContacto = null;
        }
    }

    @Test
    @Transactional
    void createSeccionContacto() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the SeccionContacto
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);
        var returnedSeccionContactoDTO = om.readValue(
            restSeccionContactoMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(seccionContactoDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            SeccionContactoDTO.class
        );

        // Validate the SeccionContacto in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedSeccionContacto = seccionContactoMapper.toEntity(returnedSeccionContactoDTO);
        assertSeccionContactoUpdatableFieldsEquals(returnedSeccionContacto, getPersistedSeccionContacto(returnedSeccionContacto));

        insertedSeccionContacto = returnedSeccionContacto;
    }

    @Test
    @Transactional
    void createSeccionContactoWithExistingId() throws Exception {
        // Create the SeccionContacto with an existing ID
        seccionContacto.setId(1L);
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSeccionContactoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTituloIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        seccionContacto.setTitulo(null);

        // Create the SeccionContacto, which fails.
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        restSeccionContactoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkImagenFondoUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        seccionContacto.setImagenFondoUrl(null);

        // Create the SeccionContacto, which fails.
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        restSeccionContactoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        seccionContacto.setActivo(null);

        // Create the SeccionContacto, which fails.
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        restSeccionContactoMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSeccionContactos() throws Exception {
        // Initialize the database
        insertedSeccionContacto = seccionContactoRepository.saveAndFlush(seccionContacto);

        // Get all the seccionContactoList
        restSeccionContactoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(seccionContacto.getId().intValue())))
            .andExpect(jsonPath("$.[*].titulo").value(hasItem(DEFAULT_TITULO)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].imagenFondoUrl").value(hasItem(DEFAULT_IMAGEN_FONDO_URL)))
            .andExpect(jsonPath("$.[*].correo").value(hasItem(DEFAULT_CORREO)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getSeccionContacto() throws Exception {
        // Initialize the database
        insertedSeccionContacto = seccionContactoRepository.saveAndFlush(seccionContacto);

        // Get the seccionContacto
        restSeccionContactoMockMvc
            .perform(get(ENTITY_API_URL_ID, seccionContacto.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(seccionContacto.getId().intValue()))
            .andExpect(jsonPath("$.titulo").value(DEFAULT_TITULO))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.imagenFondoUrl").value(DEFAULT_IMAGEN_FONDO_URL))
            .andExpect(jsonPath("$.correo").value(DEFAULT_CORREO))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingSeccionContacto() throws Exception {
        // Get the seccionContacto
        restSeccionContactoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingSeccionContacto() throws Exception {
        // Initialize the database
        insertedSeccionContacto = seccionContactoRepository.saveAndFlush(seccionContacto);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the seccionContacto
        SeccionContacto updatedSeccionContacto = seccionContactoRepository.findById(seccionContacto.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedSeccionContacto are not directly saved in db
        em.detach(updatedSeccionContacto);
        updatedSeccionContacto
            .titulo(UPDATED_TITULO)
            .descripcion(UPDATED_DESCRIPCION)
            .imagenFondoUrl(UPDATED_IMAGEN_FONDO_URL)
            .correo(UPDATED_CORREO)
            .activo(UPDATED_ACTIVO);
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(updatedSeccionContacto);

        restSeccionContactoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, seccionContactoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isOk());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedSeccionContactoToMatchAllProperties(updatedSeccionContacto);
    }

    @Test
    @Transactional
    void putNonExistingSeccionContacto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionContacto.setId(longCount.incrementAndGet());

        // Create the SeccionContacto
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSeccionContactoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, seccionContactoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSeccionContacto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionContacto.setId(longCount.incrementAndGet());

        // Create the SeccionContacto
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionContactoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSeccionContacto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionContacto.setId(longCount.incrementAndGet());

        // Create the SeccionContacto
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionContactoMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSeccionContactoWithPatch() throws Exception {
        // Initialize the database
        insertedSeccionContacto = seccionContactoRepository.saveAndFlush(seccionContacto);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the seccionContacto using partial update
        SeccionContacto partialUpdatedSeccionContacto = new SeccionContacto();
        partialUpdatedSeccionContacto.setId(seccionContacto.getId());

        partialUpdatedSeccionContacto.descripcion(UPDATED_DESCRIPCION);

        restSeccionContactoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSeccionContacto.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSeccionContacto))
            )
            .andExpect(status().isOk());

        // Validate the SeccionContacto in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSeccionContactoUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedSeccionContacto, seccionContacto),
            getPersistedSeccionContacto(seccionContacto)
        );
    }

    @Test
    @Transactional
    void fullUpdateSeccionContactoWithPatch() throws Exception {
        // Initialize the database
        insertedSeccionContacto = seccionContactoRepository.saveAndFlush(seccionContacto);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the seccionContacto using partial update
        SeccionContacto partialUpdatedSeccionContacto = new SeccionContacto();
        partialUpdatedSeccionContacto.setId(seccionContacto.getId());

        partialUpdatedSeccionContacto
            .titulo(UPDATED_TITULO)
            .descripcion(UPDATED_DESCRIPCION)
            .imagenFondoUrl(UPDATED_IMAGEN_FONDO_URL)
            .correo(UPDATED_CORREO)
            .activo(UPDATED_ACTIVO);

        restSeccionContactoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSeccionContacto.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedSeccionContacto))
            )
            .andExpect(status().isOk());

        // Validate the SeccionContacto in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertSeccionContactoUpdatableFieldsEquals(
            partialUpdatedSeccionContacto,
            getPersistedSeccionContacto(partialUpdatedSeccionContacto)
        );
    }

    @Test
    @Transactional
    void patchNonExistingSeccionContacto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionContacto.setId(longCount.incrementAndGet());

        // Create the SeccionContacto
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSeccionContactoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, seccionContactoDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSeccionContacto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionContacto.setId(longCount.incrementAndGet());

        // Create the SeccionContacto
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionContactoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSeccionContacto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        seccionContacto.setId(longCount.incrementAndGet());

        // Create the SeccionContacto
        SeccionContactoDTO seccionContactoDTO = seccionContactoMapper.toDto(seccionContacto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSeccionContactoMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(seccionContactoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SeccionContacto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSeccionContacto() throws Exception {
        // Initialize the database
        insertedSeccionContacto = seccionContactoRepository.saveAndFlush(seccionContacto);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the seccionContacto
        restSeccionContactoMockMvc
            .perform(delete(ENTITY_API_URL_ID, seccionContacto.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return seccionContactoRepository.count();
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

    protected SeccionContacto getPersistedSeccionContacto(SeccionContacto seccionContacto) {
        return seccionContactoRepository.findById(seccionContacto.getId()).orElseThrow();
    }

    protected void assertPersistedSeccionContactoToMatchAllProperties(SeccionContacto expectedSeccionContacto) {
        assertSeccionContactoAllPropertiesEquals(expectedSeccionContacto, getPersistedSeccionContacto(expectedSeccionContacto));
    }

    protected void assertPersistedSeccionContactoToMatchUpdatableProperties(SeccionContacto expectedSeccionContacto) {
        assertSeccionContactoAllUpdatablePropertiesEquals(expectedSeccionContacto, getPersistedSeccionContacto(expectedSeccionContacto));
    }
}
