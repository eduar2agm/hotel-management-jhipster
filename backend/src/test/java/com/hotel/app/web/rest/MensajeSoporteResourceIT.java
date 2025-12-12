package com.hotel.app.web.rest;

import static com.hotel.app.domain.MensajeSoporteAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.MensajeSoporte;
import com.hotel.app.repository.MensajeSoporteRepository;
import com.hotel.app.service.dto.MensajeSoporteDTO;
import com.hotel.app.service.mapper.MensajeSoporteMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
 * Integration tests for the {@link MensajeSoporteResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class MensajeSoporteResourceIT {

    private static final String DEFAULT_MENSAJE = "AAAAAAAAAA";
    private static final String UPDATED_MENSAJE = "BBBBBBBBBB";

    private static final Instant DEFAULT_FECHA_MENSAJE = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA_MENSAJE = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_USER_ID = "AAAAAAAAAA";
    private static final String UPDATED_USER_ID = "BBBBBBBBBB";

    private static final String DEFAULT_USER_NAME = "AAAAAAAAAA";
    private static final String UPDATED_USER_NAME = "BBBBBBBBBB";

    private static final Boolean DEFAULT_LEIDO = false;
    private static final Boolean UPDATED_LEIDO = true;

    private static final String ENTITY_API_URL = "/api/mensaje-soportes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private MensajeSoporteRepository mensajeSoporteRepository;

    @Autowired
    private MensajeSoporteMapper mensajeSoporteMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restMensajeSoporteMockMvc;

    private MensajeSoporte mensajeSoporte;

    private MensajeSoporte insertedMensajeSoporte;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MensajeSoporte createEntity() {
        return new MensajeSoporte()
            .mensaje(DEFAULT_MENSAJE)
            .fechaMensaje(DEFAULT_FECHA_MENSAJE)
            .userId(DEFAULT_USER_ID)
            .userName(DEFAULT_USER_NAME)
            .leido(DEFAULT_LEIDO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MensajeSoporte createUpdatedEntity() {
        return new MensajeSoporte()
            .mensaje(UPDATED_MENSAJE)
            .fechaMensaje(UPDATED_FECHA_MENSAJE)
            .userId(UPDATED_USER_ID)
            .userName(UPDATED_USER_NAME)
            .leido(UPDATED_LEIDO);
    }

    @BeforeEach
    void initTest() {
        mensajeSoporte = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedMensajeSoporte != null) {
            mensajeSoporteRepository.delete(insertedMensajeSoporte);
            insertedMensajeSoporte = null;
        }
    }

    @Test
    @Transactional
    void createMensajeSoporte() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the MensajeSoporte
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);
        var returnedMensajeSoporteDTO = om.readValue(
            restMensajeSoporteMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(mensajeSoporteDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            MensajeSoporteDTO.class
        );

        // Validate the MensajeSoporte in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedMensajeSoporte = mensajeSoporteMapper.toEntity(returnedMensajeSoporteDTO);
        assertMensajeSoporteUpdatableFieldsEquals(returnedMensajeSoporte, getPersistedMensajeSoporte(returnedMensajeSoporte));

        insertedMensajeSoporte = returnedMensajeSoporte;
    }

    @Test
    @Transactional
    void createMensajeSoporteWithExistingId() throws Exception {
        // Create the MensajeSoporte with an existing ID
        mensajeSoporte.setId(1L);
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restMensajeSoporteMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkMensajeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        mensajeSoporte.setMensaje(null);

        // Create the MensajeSoporte, which fails.
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        restMensajeSoporteMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFechaMensajeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        mensajeSoporte.setFechaMensaje(null);

        // Create the MensajeSoporte, which fails.
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        restMensajeSoporteMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkUserIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        mensajeSoporte.setUserId(null);

        // Create the MensajeSoporte, which fails.
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        restMensajeSoporteMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLeidoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        mensajeSoporte.setLeido(null);

        // Create the MensajeSoporte, which fails.
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        restMensajeSoporteMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllMensajeSoportes() throws Exception {
        // Initialize the database
        insertedMensajeSoporte = mensajeSoporteRepository.saveAndFlush(mensajeSoporte);

        // Get all the mensajeSoporteList
        restMensajeSoporteMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(mensajeSoporte.getId().intValue())))
            .andExpect(jsonPath("$.[*].mensaje").value(hasItem(DEFAULT_MENSAJE)))
            .andExpect(jsonPath("$.[*].fechaMensaje").value(hasItem(DEFAULT_FECHA_MENSAJE.toString())))
            .andExpect(jsonPath("$.[*].userId").value(hasItem(DEFAULT_USER_ID)))
            .andExpect(jsonPath("$.[*].userName").value(hasItem(DEFAULT_USER_NAME)))
            .andExpect(jsonPath("$.[*].leido").value(hasItem(DEFAULT_LEIDO)));
    }

    @Test
    @Transactional
    void getMensajeSoporte() throws Exception {
        // Initialize the database
        insertedMensajeSoporte = mensajeSoporteRepository.saveAndFlush(mensajeSoporte);

        // Get the mensajeSoporte
        restMensajeSoporteMockMvc
            .perform(get(ENTITY_API_URL_ID, mensajeSoporte.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(mensajeSoporte.getId().intValue()))
            .andExpect(jsonPath("$.mensaje").value(DEFAULT_MENSAJE))
            .andExpect(jsonPath("$.fechaMensaje").value(DEFAULT_FECHA_MENSAJE.toString()))
            .andExpect(jsonPath("$.userId").value(DEFAULT_USER_ID))
            .andExpect(jsonPath("$.userName").value(DEFAULT_USER_NAME))
            .andExpect(jsonPath("$.leido").value(DEFAULT_LEIDO));
    }

    @Test
    @Transactional
    void getNonExistingMensajeSoporte() throws Exception {
        // Get the mensajeSoporte
        restMensajeSoporteMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingMensajeSoporte() throws Exception {
        // Initialize the database
        insertedMensajeSoporte = mensajeSoporteRepository.saveAndFlush(mensajeSoporte);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mensajeSoporte
        MensajeSoporte updatedMensajeSoporte = mensajeSoporteRepository.findById(mensajeSoporte.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedMensajeSoporte are not directly saved in db
        em.detach(updatedMensajeSoporte);
        updatedMensajeSoporte
            .mensaje(UPDATED_MENSAJE)
            .fechaMensaje(UPDATED_FECHA_MENSAJE)
            .userId(UPDATED_USER_ID)
            .userName(UPDATED_USER_NAME)
            .leido(UPDATED_LEIDO);
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(updatedMensajeSoporte);

        restMensajeSoporteMockMvc
            .perform(
                put(ENTITY_API_URL_ID, mensajeSoporteDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isOk());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedMensajeSoporteToMatchAllProperties(updatedMensajeSoporte);
    }

    @Test
    @Transactional
    void putNonExistingMensajeSoporte() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mensajeSoporte.setId(longCount.incrementAndGet());

        // Create the MensajeSoporte
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMensajeSoporteMockMvc
            .perform(
                put(ENTITY_API_URL_ID, mensajeSoporteDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchMensajeSoporte() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mensajeSoporte.setId(longCount.incrementAndGet());

        // Create the MensajeSoporte
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMensajeSoporteMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamMensajeSoporte() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mensajeSoporte.setId(longCount.incrementAndGet());

        // Create the MensajeSoporte
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMensajeSoporteMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateMensajeSoporteWithPatch() throws Exception {
        // Initialize the database
        insertedMensajeSoporte = mensajeSoporteRepository.saveAndFlush(mensajeSoporte);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mensajeSoporte using partial update
        MensajeSoporte partialUpdatedMensajeSoporte = new MensajeSoporte();
        partialUpdatedMensajeSoporte.setId(mensajeSoporte.getId());

        partialUpdatedMensajeSoporte
            .mensaje(UPDATED_MENSAJE)
            .fechaMensaje(UPDATED_FECHA_MENSAJE)
            .userId(UPDATED_USER_ID)
            .leido(UPDATED_LEIDO);

        restMensajeSoporteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMensajeSoporte.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMensajeSoporte))
            )
            .andExpect(status().isOk());

        // Validate the MensajeSoporte in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMensajeSoporteUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedMensajeSoporte, mensajeSoporte),
            getPersistedMensajeSoporte(mensajeSoporte)
        );
    }

    @Test
    @Transactional
    void fullUpdateMensajeSoporteWithPatch() throws Exception {
        // Initialize the database
        insertedMensajeSoporte = mensajeSoporteRepository.saveAndFlush(mensajeSoporte);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mensajeSoporte using partial update
        MensajeSoporte partialUpdatedMensajeSoporte = new MensajeSoporte();
        partialUpdatedMensajeSoporte.setId(mensajeSoporte.getId());

        partialUpdatedMensajeSoporte
            .mensaje(UPDATED_MENSAJE)
            .fechaMensaje(UPDATED_FECHA_MENSAJE)
            .userId(UPDATED_USER_ID)
            .userName(UPDATED_USER_NAME)
            .leido(UPDATED_LEIDO);

        restMensajeSoporteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMensajeSoporte.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMensajeSoporte))
            )
            .andExpect(status().isOk());

        // Validate the MensajeSoporte in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMensajeSoporteUpdatableFieldsEquals(partialUpdatedMensajeSoporte, getPersistedMensajeSoporte(partialUpdatedMensajeSoporte));
    }

    @Test
    @Transactional
    void patchNonExistingMensajeSoporte() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mensajeSoporte.setId(longCount.incrementAndGet());

        // Create the MensajeSoporte
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMensajeSoporteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, mensajeSoporteDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchMensajeSoporte() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mensajeSoporte.setId(longCount.incrementAndGet());

        // Create the MensajeSoporte
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMensajeSoporteMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamMensajeSoporte() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mensajeSoporte.setId(longCount.incrementAndGet());

        // Create the MensajeSoporte
        MensajeSoporteDTO mensajeSoporteDTO = mensajeSoporteMapper.toDto(mensajeSoporte);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMensajeSoporteMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mensajeSoporteDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the MensajeSoporte in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteMensajeSoporte() throws Exception {
        // Initialize the database
        insertedMensajeSoporte = mensajeSoporteRepository.saveAndFlush(mensajeSoporte);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the mensajeSoporte
        restMensajeSoporteMockMvc
            .perform(delete(ENTITY_API_URL_ID, mensajeSoporte.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return mensajeSoporteRepository.count();
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

    protected MensajeSoporte getPersistedMensajeSoporte(MensajeSoporte mensajeSoporte) {
        return mensajeSoporteRepository.findById(mensajeSoporte.getId()).orElseThrow();
    }

    protected void assertPersistedMensajeSoporteToMatchAllProperties(MensajeSoporte expectedMensajeSoporte) {
        assertMensajeSoporteAllPropertiesEquals(expectedMensajeSoporte, getPersistedMensajeSoporte(expectedMensajeSoporte));
    }

    protected void assertPersistedMensajeSoporteToMatchUpdatableProperties(MensajeSoporte expectedMensajeSoporte) {
        assertMensajeSoporteAllUpdatablePropertiesEquals(expectedMensajeSoporte, getPersistedMensajeSoporte(expectedMensajeSoporte));
    }
}
