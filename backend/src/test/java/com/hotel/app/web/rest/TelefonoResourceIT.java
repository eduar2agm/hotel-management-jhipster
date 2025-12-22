package com.hotel.app.web.rest;

import static com.hotel.app.domain.TelefonoAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.Telefono;
import com.hotel.app.repository.TelefonoRepository;
import com.hotel.app.service.dto.TelefonoDTO;
import com.hotel.app.service.mapper.TelefonoMapper;
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
 * Integration tests for the {@link TelefonoResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TelefonoResourceIT {

    private static final String DEFAULT_NUMERO_TEL = "AAAAAAAAAA";
    private static final String UPDATED_NUMERO_TEL = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/telefonos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TelefonoRepository telefonoRepository;

    @Autowired
    private TelefonoMapper telefonoMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTelefonoMockMvc;

    private Telefono telefono;

    private Telefono insertedTelefono;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Telefono createEntity() {
        return new Telefono().numeroTel(DEFAULT_NUMERO_TEL).activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Telefono createUpdatedEntity() {
        return new Telefono().numeroTel(UPDATED_NUMERO_TEL).activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        telefono = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedTelefono != null) {
            telefonoRepository.delete(insertedTelefono);
            insertedTelefono = null;
        }
    }

    @Test
    @Transactional
    void createTelefono() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Telefono
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);
        var returnedTelefonoDTO = om.readValue(
            restTelefonoMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(telefonoDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TelefonoDTO.class
        );

        // Validate the Telefono in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedTelefono = telefonoMapper.toEntity(returnedTelefonoDTO);
        assertTelefonoUpdatableFieldsEquals(returnedTelefono, getPersistedTelefono(returnedTelefono));

        insertedTelefono = returnedTelefono;
    }

    @Test
    @Transactional
    void createTelefonoWithExistingId() throws Exception {
        // Create the Telefono with an existing ID
        telefono.setId(1L);
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTelefonoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(telefonoDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNumeroTelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        telefono.setNumeroTel(null);

        // Create the Telefono, which fails.
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        restTelefonoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(telefonoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        telefono.setActivo(null);

        // Create the Telefono, which fails.
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        restTelefonoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(telefonoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTelefonos() throws Exception {
        // Initialize the database
        insertedTelefono = telefonoRepository.saveAndFlush(telefono);

        // Get all the telefonoList
        restTelefonoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(telefono.getId().intValue())))
            .andExpect(jsonPath("$.[*].numeroTel").value(hasItem(DEFAULT_NUMERO_TEL)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getTelefono() throws Exception {
        // Initialize the database
        insertedTelefono = telefonoRepository.saveAndFlush(telefono);

        // Get the telefono
        restTelefonoMockMvc
            .perform(get(ENTITY_API_URL_ID, telefono.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(telefono.getId().intValue()))
            .andExpect(jsonPath("$.numeroTel").value(DEFAULT_NUMERO_TEL))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingTelefono() throws Exception {
        // Get the telefono
        restTelefonoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTelefono() throws Exception {
        // Initialize the database
        insertedTelefono = telefonoRepository.saveAndFlush(telefono);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the telefono
        Telefono updatedTelefono = telefonoRepository.findById(telefono.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTelefono are not directly saved in db
        em.detach(updatedTelefono);
        updatedTelefono.numeroTel(UPDATED_NUMERO_TEL).activo(UPDATED_ACTIVO);
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(updatedTelefono);

        restTelefonoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, telefonoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(telefonoDTO))
            )
            .andExpect(status().isOk());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTelefonoToMatchAllProperties(updatedTelefono);
    }

    @Test
    @Transactional
    void putNonExistingTelefono() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        telefono.setId(longCount.incrementAndGet());

        // Create the Telefono
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTelefonoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, telefonoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(telefonoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTelefono() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        telefono.setId(longCount.incrementAndGet());

        // Create the Telefono
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTelefonoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(telefonoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTelefono() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        telefono.setId(longCount.incrementAndGet());

        // Create the Telefono
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTelefonoMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(telefonoDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTelefonoWithPatch() throws Exception {
        // Initialize the database
        insertedTelefono = telefonoRepository.saveAndFlush(telefono);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the telefono using partial update
        Telefono partialUpdatedTelefono = new Telefono();
        partialUpdatedTelefono.setId(telefono.getId());

        partialUpdatedTelefono.numeroTel(UPDATED_NUMERO_TEL).activo(UPDATED_ACTIVO);

        restTelefonoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTelefono.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTelefono))
            )
            .andExpect(status().isOk());

        // Validate the Telefono in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTelefonoUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedTelefono, telefono), getPersistedTelefono(telefono));
    }

    @Test
    @Transactional
    void fullUpdateTelefonoWithPatch() throws Exception {
        // Initialize the database
        insertedTelefono = telefonoRepository.saveAndFlush(telefono);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the telefono using partial update
        Telefono partialUpdatedTelefono = new Telefono();
        partialUpdatedTelefono.setId(telefono.getId());

        partialUpdatedTelefono.numeroTel(UPDATED_NUMERO_TEL).activo(UPDATED_ACTIVO);

        restTelefonoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTelefono.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTelefono))
            )
            .andExpect(status().isOk());

        // Validate the Telefono in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTelefonoUpdatableFieldsEquals(partialUpdatedTelefono, getPersistedTelefono(partialUpdatedTelefono));
    }

    @Test
    @Transactional
    void patchNonExistingTelefono() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        telefono.setId(longCount.incrementAndGet());

        // Create the Telefono
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTelefonoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, telefonoDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(telefonoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTelefono() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        telefono.setId(longCount.incrementAndGet());

        // Create the Telefono
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTelefonoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(telefonoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTelefono() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        telefono.setId(longCount.incrementAndGet());

        // Create the Telefono
        TelefonoDTO telefonoDTO = telefonoMapper.toDto(telefono);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTelefonoMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(telefonoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Telefono in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTelefono() throws Exception {
        // Initialize the database
        insertedTelefono = telefonoRepository.saveAndFlush(telefono);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the telefono
        restTelefonoMockMvc
            .perform(delete(ENTITY_API_URL_ID, telefono.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return telefonoRepository.count();
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

    protected Telefono getPersistedTelefono(Telefono telefono) {
        return telefonoRepository.findById(telefono.getId()).orElseThrow();
    }

    protected void assertPersistedTelefonoToMatchAllProperties(Telefono expectedTelefono) {
        assertTelefonoAllPropertiesEquals(expectedTelefono, getPersistedTelefono(expectedTelefono));
    }

    protected void assertPersistedTelefonoToMatchUpdatableProperties(Telefono expectedTelefono) {
        assertTelefonoAllUpdatablePropertiesEquals(expectedTelefono, getPersistedTelefono(expectedTelefono));
    }
}
