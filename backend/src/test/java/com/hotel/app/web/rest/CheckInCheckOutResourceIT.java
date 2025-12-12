package com.hotel.app.web.rest;

import static com.hotel.app.domain.CheckInCheckOutAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.hotel.app.web.rest.TestUtil.sameInstant;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.CheckInCheckOut;
import com.hotel.app.domain.enumeration.EstadoCheckInCheckOut;
import com.hotel.app.repository.CheckInCheckOutRepository;
import com.hotel.app.service.dto.CheckInCheckOutDTO;
import com.hotel.app.service.mapper.CheckInCheckOutMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
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
 * Integration tests for the {@link CheckInCheckOutResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CheckInCheckOutResourceIT {

    private static final ZonedDateTime DEFAULT_FECHA_HORA_CHECK_IN = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_FECHA_HORA_CHECK_IN = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final ZonedDateTime DEFAULT_FECHA_HORA_CHECK_OUT = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime UPDATED_FECHA_HORA_CHECK_OUT = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);

    private static final EstadoCheckInCheckOut DEFAULT_ESTADO = EstadoCheckInCheckOut.PENDIENTE;
    private static final EstadoCheckInCheckOut UPDATED_ESTADO = EstadoCheckInCheckOut.REALIZADO;

    private static final String ENTITY_API_URL = "/api/check-in-check-outs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CheckInCheckOutRepository checkInCheckOutRepository;

    @Autowired
    private CheckInCheckOutMapper checkInCheckOutMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCheckInCheckOutMockMvc;

    private CheckInCheckOut checkInCheckOut;

    private CheckInCheckOut insertedCheckInCheckOut;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CheckInCheckOut createEntity() {
        return new CheckInCheckOut()
            .fechaHoraCheckIn(DEFAULT_FECHA_HORA_CHECK_IN)
            .fechaHoraCheckOut(DEFAULT_FECHA_HORA_CHECK_OUT)
            .estado(DEFAULT_ESTADO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CheckInCheckOut createUpdatedEntity() {
        return new CheckInCheckOut()
            .fechaHoraCheckIn(UPDATED_FECHA_HORA_CHECK_IN)
            .fechaHoraCheckOut(UPDATED_FECHA_HORA_CHECK_OUT)
            .estado(UPDATED_ESTADO);
    }

    @BeforeEach
    void initTest() {
        checkInCheckOut = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCheckInCheckOut != null) {
            checkInCheckOutRepository.delete(insertedCheckInCheckOut);
            insertedCheckInCheckOut = null;
        }
    }

    @Test
    @Transactional
    void createCheckInCheckOut() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CheckInCheckOut
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);
        var returnedCheckInCheckOutDTO = om.readValue(
            restCheckInCheckOutMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(checkInCheckOutDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CheckInCheckOutDTO.class
        );

        // Validate the CheckInCheckOut in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCheckInCheckOut = checkInCheckOutMapper.toEntity(returnedCheckInCheckOutDTO);
        assertCheckInCheckOutUpdatableFieldsEquals(returnedCheckInCheckOut, getPersistedCheckInCheckOut(returnedCheckInCheckOut));

        insertedCheckInCheckOut = returnedCheckInCheckOut;
    }

    @Test
    @Transactional
    void createCheckInCheckOutWithExistingId() throws Exception {
        // Create the CheckInCheckOut with an existing ID
        checkInCheckOut.setId(1L);
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCheckInCheckOutMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFechaHoraCheckInIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checkInCheckOut.setFechaHoraCheckIn(null);

        // Create the CheckInCheckOut, which fails.
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        restCheckInCheckOutMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEstadoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checkInCheckOut.setEstado(null);

        // Create the CheckInCheckOut, which fails.
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        restCheckInCheckOutMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCheckInCheckOuts() throws Exception {
        // Initialize the database
        insertedCheckInCheckOut = checkInCheckOutRepository.saveAndFlush(checkInCheckOut);

        // Get all the checkInCheckOutList
        restCheckInCheckOutMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(checkInCheckOut.getId().intValue())))
            .andExpect(jsonPath("$.[*].fechaHoraCheckIn").value(hasItem(sameInstant(DEFAULT_FECHA_HORA_CHECK_IN))))
            .andExpect(jsonPath("$.[*].fechaHoraCheckOut").value(hasItem(sameInstant(DEFAULT_FECHA_HORA_CHECK_OUT))))
            .andExpect(jsonPath("$.[*].estado").value(hasItem(DEFAULT_ESTADO.toString())));
    }

    @Test
    @Transactional
    void getCheckInCheckOut() throws Exception {
        // Initialize the database
        insertedCheckInCheckOut = checkInCheckOutRepository.saveAndFlush(checkInCheckOut);

        // Get the checkInCheckOut
        restCheckInCheckOutMockMvc
            .perform(get(ENTITY_API_URL_ID, checkInCheckOut.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(checkInCheckOut.getId().intValue()))
            .andExpect(jsonPath("$.fechaHoraCheckIn").value(sameInstant(DEFAULT_FECHA_HORA_CHECK_IN)))
            .andExpect(jsonPath("$.fechaHoraCheckOut").value(sameInstant(DEFAULT_FECHA_HORA_CHECK_OUT)))
            .andExpect(jsonPath("$.estado").value(DEFAULT_ESTADO.toString()));
    }

    @Test
    @Transactional
    void getNonExistingCheckInCheckOut() throws Exception {
        // Get the checkInCheckOut
        restCheckInCheckOutMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCheckInCheckOut() throws Exception {
        // Initialize the database
        insertedCheckInCheckOut = checkInCheckOutRepository.saveAndFlush(checkInCheckOut);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checkInCheckOut
        CheckInCheckOut updatedCheckInCheckOut = checkInCheckOutRepository.findById(checkInCheckOut.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCheckInCheckOut are not directly saved in db
        em.detach(updatedCheckInCheckOut);
        updatedCheckInCheckOut
            .fechaHoraCheckIn(UPDATED_FECHA_HORA_CHECK_IN)
            .fechaHoraCheckOut(UPDATED_FECHA_HORA_CHECK_OUT)
            .estado(UPDATED_ESTADO);
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(updatedCheckInCheckOut);

        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL_ID, checkInCheckOutDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isOk());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCheckInCheckOutToMatchAllProperties(updatedCheckInCheckOut);
    }

    @Test
    @Transactional
    void putNonExistingCheckInCheckOut() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checkInCheckOut.setId(longCount.incrementAndGet());

        // Create the CheckInCheckOut
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL_ID, checkInCheckOutDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCheckInCheckOut() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checkInCheckOut.setId(longCount.incrementAndGet());

        // Create the CheckInCheckOut
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCheckInCheckOut() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checkInCheckOut.setId(longCount.incrementAndGet());

        // Create the CheckInCheckOut
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCheckInCheckOutWithPatch() throws Exception {
        // Initialize the database
        insertedCheckInCheckOut = checkInCheckOutRepository.saveAndFlush(checkInCheckOut);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checkInCheckOut using partial update
        CheckInCheckOut partialUpdatedCheckInCheckOut = new CheckInCheckOut();
        partialUpdatedCheckInCheckOut.setId(checkInCheckOut.getId());

        partialUpdatedCheckInCheckOut.estado(UPDATED_ESTADO);

        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCheckInCheckOut.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCheckInCheckOut))
            )
            .andExpect(status().isOk());

        // Validate the CheckInCheckOut in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCheckInCheckOutUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCheckInCheckOut, checkInCheckOut),
            getPersistedCheckInCheckOut(checkInCheckOut)
        );
    }

    @Test
    @Transactional
    void fullUpdateCheckInCheckOutWithPatch() throws Exception {
        // Initialize the database
        insertedCheckInCheckOut = checkInCheckOutRepository.saveAndFlush(checkInCheckOut);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the checkInCheckOut using partial update
        CheckInCheckOut partialUpdatedCheckInCheckOut = new CheckInCheckOut();
        partialUpdatedCheckInCheckOut.setId(checkInCheckOut.getId());

        partialUpdatedCheckInCheckOut
            .fechaHoraCheckIn(UPDATED_FECHA_HORA_CHECK_IN)
            .fechaHoraCheckOut(UPDATED_FECHA_HORA_CHECK_OUT)
            .estado(UPDATED_ESTADO);

        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCheckInCheckOut.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCheckInCheckOut))
            )
            .andExpect(status().isOk());

        // Validate the CheckInCheckOut in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCheckInCheckOutUpdatableFieldsEquals(
            partialUpdatedCheckInCheckOut,
            getPersistedCheckInCheckOut(partialUpdatedCheckInCheckOut)
        );
    }

    @Test
    @Transactional
    void patchNonExistingCheckInCheckOut() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checkInCheckOut.setId(longCount.incrementAndGet());

        // Create the CheckInCheckOut
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, checkInCheckOutDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCheckInCheckOut() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checkInCheckOut.setId(longCount.incrementAndGet());

        // Create the CheckInCheckOut
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCheckInCheckOut() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        checkInCheckOut.setId(longCount.incrementAndGet());

        // Create the CheckInCheckOut
        CheckInCheckOutDTO checkInCheckOutDTO = checkInCheckOutMapper.toDto(checkInCheckOut);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checkInCheckOutDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCheckInCheckOut() throws Exception {
        // Initialize the database
        insertedCheckInCheckOut = checkInCheckOutRepository.saveAndFlush(checkInCheckOut);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the checkInCheckOut
        restCheckInCheckOutMockMvc
            .perform(delete(ENTITY_API_URL_ID, checkInCheckOut.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return checkInCheckOutRepository.count();
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

    protected CheckInCheckOut getPersistedCheckInCheckOut(CheckInCheckOut checkInCheckOut) {
        return checkInCheckOutRepository.findById(checkInCheckOut.getId()).orElseThrow();
    }

    protected void assertPersistedCheckInCheckOutToMatchAllProperties(CheckInCheckOut expectedCheckInCheckOut) {
        assertCheckInCheckOutAllPropertiesEquals(expectedCheckInCheckOut, getPersistedCheckInCheckOut(expectedCheckInCheckOut));
    }

    protected void assertPersistedCheckInCheckOutToMatchUpdatableProperties(CheckInCheckOut expectedCheckInCheckOut) {
        assertCheckInCheckOutAllUpdatablePropertiesEquals(expectedCheckInCheckOut, getPersistedCheckInCheckOut(expectedCheckInCheckOut));
    }
}
