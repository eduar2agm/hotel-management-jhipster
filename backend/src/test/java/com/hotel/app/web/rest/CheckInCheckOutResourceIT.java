package com.hotel.app.web.rest;

import static com.hotel.app.domain.CheckInCheckOutAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
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
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalTime;
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
 * Integration tests for the {@link CheckInCheckOutResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CheckInCheckOutResourceIT {

    private static final Instant DEFAULT_FECHA_CHECK_IN = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA_CHECK_IN = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final LocalTime DEFAULT_HORA_CHECK_IN = LocalTime.NOON;
    private static final LocalTime UPDATED_HORA_CHECK_IN = LocalTime.MAX.withNano(0);

    private static final Instant DEFAULT_FECHA_CHECK_OUT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA_CHECK_OUT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final LocalTime DEFAULT_HORA_CHECK_OUT = LocalTime.NOON;
    private static final LocalTime UPDATED_HORA_CHECK_OUT = LocalTime.MAX.withNano(0);

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
            .fechaCheckIn(DEFAULT_FECHA_CHECK_IN)
            .horaCheckIn(DEFAULT_HORA_CHECK_IN)
            .fechaCheckOut(DEFAULT_FECHA_CHECK_OUT)
            .horaCheckOut(DEFAULT_HORA_CHECK_OUT)
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
            .fechaCheckIn(UPDATED_FECHA_CHECK_IN)
            .horaCheckIn(UPDATED_HORA_CHECK_IN)
            .fechaCheckOut(UPDATED_FECHA_CHECK_OUT)
            .horaCheckOut(UPDATED_HORA_CHECK_OUT)
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
        var returnedCheckInCheckOut = om.readValue(
            restCheckInCheckOutMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOut))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CheckInCheckOut.class
        );

        // Validate the CheckInCheckOut in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertCheckInCheckOutUpdatableFieldsEquals(returnedCheckInCheckOut, getPersistedCheckInCheckOut(returnedCheckInCheckOut));

        insertedCheckInCheckOut = returnedCheckInCheckOut;
    }

    @Test
    @Transactional
    void createCheckInCheckOutWithExistingId() throws Exception {
        // Create the CheckInCheckOut with an existing ID
        checkInCheckOut.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCheckInCheckOutMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOut))
            )
            .andExpect(status().isBadRequest());

        // Validate the CheckInCheckOut in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFechaCheckInIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checkInCheckOut.setFechaCheckIn(null);

        // Create the CheckInCheckOut, which fails.

        restCheckInCheckOutMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOut))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkHoraCheckInIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        checkInCheckOut.setHoraCheckIn(null);

        // Create the CheckInCheckOut, which fails.

        restCheckInCheckOutMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOut))
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

        restCheckInCheckOutMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOut))
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
            .andExpect(jsonPath("$.[*].fechaCheckIn").value(hasItem(DEFAULT_FECHA_CHECK_IN.toString())))
            .andExpect(jsonPath("$.[*].horaCheckIn").value(hasItem(DEFAULT_HORA_CHECK_IN.toString())))
            .andExpect(jsonPath("$.[*].fechaCheckOut").value(hasItem(DEFAULT_FECHA_CHECK_OUT.toString())))
            .andExpect(jsonPath("$.[*].horaCheckOut").value(hasItem(DEFAULT_HORA_CHECK_OUT.toString())))
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
            .andExpect(jsonPath("$.fechaCheckIn").value(DEFAULT_FECHA_CHECK_IN.toString()))
            .andExpect(jsonPath("$.horaCheckIn").value(DEFAULT_HORA_CHECK_IN.toString()))
            .andExpect(jsonPath("$.fechaCheckOut").value(DEFAULT_FECHA_CHECK_OUT.toString()))
            .andExpect(jsonPath("$.horaCheckOut").value(DEFAULT_HORA_CHECK_OUT.toString()))
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
            .fechaCheckIn(UPDATED_FECHA_CHECK_IN)
            .horaCheckIn(UPDATED_HORA_CHECK_IN)
            .fechaCheckOut(UPDATED_FECHA_CHECK_OUT)
            .horaCheckOut(UPDATED_HORA_CHECK_OUT)
            .estado(UPDATED_ESTADO);

        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCheckInCheckOut.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedCheckInCheckOut))
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

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL_ID, checkInCheckOut.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checkInCheckOut))
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

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(checkInCheckOut))
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

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(checkInCheckOut))
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

        partialUpdatedCheckInCheckOut.fechaCheckOut(UPDATED_FECHA_CHECK_OUT);

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
            .fechaCheckIn(UPDATED_FECHA_CHECK_IN)
            .horaCheckIn(UPDATED_HORA_CHECK_IN)
            .fechaCheckOut(UPDATED_FECHA_CHECK_OUT)
            .horaCheckOut(UPDATED_HORA_CHECK_OUT)
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

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, checkInCheckOut.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checkInCheckOut))
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

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checkInCheckOut))
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

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCheckInCheckOutMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(checkInCheckOut))
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
