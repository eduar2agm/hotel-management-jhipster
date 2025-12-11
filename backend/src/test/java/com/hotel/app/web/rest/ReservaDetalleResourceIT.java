package com.hotel.app.web.rest;

import static com.hotel.app.domain.ReservaDetalleAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.ReservaDetalle;
import com.hotel.app.repository.ReservaDetalleRepository;
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
 * Integration tests for the {@link ReservaDetalleResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ReservaDetalleResourceIT {

    private static final String DEFAULT_NOTA = "AAAAAAAAAA";
    private static final String UPDATED_NOTA = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/reserva-detalles";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ReservaDetalleRepository reservaDetalleRepository;

    @Mock
    private ReservaDetalleRepository reservaDetalleRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restReservaDetalleMockMvc;

    private ReservaDetalle reservaDetalle;

    private ReservaDetalle insertedReservaDetalle;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ReservaDetalle createEntity() {
        return new ReservaDetalle().nota(DEFAULT_NOTA);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ReservaDetalle createUpdatedEntity() {
        return new ReservaDetalle().nota(UPDATED_NOTA);
    }

    @BeforeEach
    void initTest() {
        reservaDetalle = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedReservaDetalle != null) {
            reservaDetalleRepository.delete(insertedReservaDetalle);
            insertedReservaDetalle = null;
        }
    }

    @Test
    @Transactional
    void createReservaDetalle() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ReservaDetalle
        var returnedReservaDetalle = om.readValue(
            restReservaDetalleMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reservaDetalle))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ReservaDetalle.class
        );

        // Validate the ReservaDetalle in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertReservaDetalleUpdatableFieldsEquals(returnedReservaDetalle, getPersistedReservaDetalle(returnedReservaDetalle));

        insertedReservaDetalle = returnedReservaDetalle;
    }

    @Test
    @Transactional
    void createReservaDetalleWithExistingId() throws Exception {
        // Create the ReservaDetalle with an existing ID
        reservaDetalle.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restReservaDetalleMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reservaDetalle))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllReservaDetalles() throws Exception {
        // Initialize the database
        insertedReservaDetalle = reservaDetalleRepository.saveAndFlush(reservaDetalle);

        // Get all the reservaDetalleList
        restReservaDetalleMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(reservaDetalle.getId().intValue())))
            .andExpect(jsonPath("$.[*].nota").value(hasItem(DEFAULT_NOTA)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllReservaDetallesWithEagerRelationshipsIsEnabled() throws Exception {
        when(reservaDetalleRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restReservaDetalleMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(reservaDetalleRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllReservaDetallesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(reservaDetalleRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restReservaDetalleMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(reservaDetalleRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getReservaDetalle() throws Exception {
        // Initialize the database
        insertedReservaDetalle = reservaDetalleRepository.saveAndFlush(reservaDetalle);

        // Get the reservaDetalle
        restReservaDetalleMockMvc
            .perform(get(ENTITY_API_URL_ID, reservaDetalle.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(reservaDetalle.getId().intValue()))
            .andExpect(jsonPath("$.nota").value(DEFAULT_NOTA));
    }

    @Test
    @Transactional
    void getNonExistingReservaDetalle() throws Exception {
        // Get the reservaDetalle
        restReservaDetalleMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingReservaDetalle() throws Exception {
        // Initialize the database
        insertedReservaDetalle = reservaDetalleRepository.saveAndFlush(reservaDetalle);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the reservaDetalle
        ReservaDetalle updatedReservaDetalle = reservaDetalleRepository.findById(reservaDetalle.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedReservaDetalle are not directly saved in db
        em.detach(updatedReservaDetalle);
        updatedReservaDetalle.nota(UPDATED_NOTA);

        restReservaDetalleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedReservaDetalle.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedReservaDetalle))
            )
            .andExpect(status().isOk());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedReservaDetalleToMatchAllProperties(updatedReservaDetalle);
    }

    @Test
    @Transactional
    void putNonExistingReservaDetalle() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reservaDetalle.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReservaDetalleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, reservaDetalle.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(reservaDetalle))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchReservaDetalle() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reservaDetalle.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReservaDetalleMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(reservaDetalle))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamReservaDetalle() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reservaDetalle.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReservaDetalleMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(reservaDetalle)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateReservaDetalleWithPatch() throws Exception {
        // Initialize the database
        insertedReservaDetalle = reservaDetalleRepository.saveAndFlush(reservaDetalle);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the reservaDetalle using partial update
        ReservaDetalle partialUpdatedReservaDetalle = new ReservaDetalle();
        partialUpdatedReservaDetalle.setId(reservaDetalle.getId());

        restReservaDetalleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReservaDetalle.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReservaDetalle))
            )
            .andExpect(status().isOk());

        // Validate the ReservaDetalle in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReservaDetalleUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedReservaDetalle, reservaDetalle),
            getPersistedReservaDetalle(reservaDetalle)
        );
    }

    @Test
    @Transactional
    void fullUpdateReservaDetalleWithPatch() throws Exception {
        // Initialize the database
        insertedReservaDetalle = reservaDetalleRepository.saveAndFlush(reservaDetalle);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the reservaDetalle using partial update
        ReservaDetalle partialUpdatedReservaDetalle = new ReservaDetalle();
        partialUpdatedReservaDetalle.setId(reservaDetalle.getId());

        partialUpdatedReservaDetalle.nota(UPDATED_NOTA);

        restReservaDetalleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedReservaDetalle.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedReservaDetalle))
            )
            .andExpect(status().isOk());

        // Validate the ReservaDetalle in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertReservaDetalleUpdatableFieldsEquals(partialUpdatedReservaDetalle, getPersistedReservaDetalle(partialUpdatedReservaDetalle));
    }

    @Test
    @Transactional
    void patchNonExistingReservaDetalle() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reservaDetalle.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restReservaDetalleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, reservaDetalle.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(reservaDetalle))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchReservaDetalle() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reservaDetalle.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReservaDetalleMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(reservaDetalle))
            )
            .andExpect(status().isBadRequest());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamReservaDetalle() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        reservaDetalle.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restReservaDetalleMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(reservaDetalle))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ReservaDetalle in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteReservaDetalle() throws Exception {
        // Initialize the database
        insertedReservaDetalle = reservaDetalleRepository.saveAndFlush(reservaDetalle);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the reservaDetalle
        restReservaDetalleMockMvc
            .perform(delete(ENTITY_API_URL_ID, reservaDetalle.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return reservaDetalleRepository.count();
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

    protected ReservaDetalle getPersistedReservaDetalle(ReservaDetalle reservaDetalle) {
        return reservaDetalleRepository.findById(reservaDetalle.getId()).orElseThrow();
    }

    protected void assertPersistedReservaDetalleToMatchAllProperties(ReservaDetalle expectedReservaDetalle) {
        assertReservaDetalleAllPropertiesEquals(expectedReservaDetalle, getPersistedReservaDetalle(expectedReservaDetalle));
    }

    protected void assertPersistedReservaDetalleToMatchUpdatableProperties(ReservaDetalle expectedReservaDetalle) {
        assertReservaDetalleAllUpdatablePropertiesEquals(expectedReservaDetalle, getPersistedReservaDetalle(expectedReservaDetalle));
    }
}
