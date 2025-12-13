package com.hotel.app.web.rest;

import static com.hotel.app.domain.PagoAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.hotel.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.Pago;
import com.hotel.app.domain.enumeration.EstadoPago;
import com.hotel.app.domain.enumeration.MetodoPago;
import com.hotel.app.repository.PagoRepository;
import com.hotel.app.service.dto.PagoDTO;
import com.hotel.app.service.mapper.PagoMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link PagoResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PagoResourceIT {

    private static final Instant DEFAULT_FECHA_PAGO = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA_PAGO = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final BigDecimal DEFAULT_MONTO = new BigDecimal(1);
    private static final BigDecimal UPDATED_MONTO = new BigDecimal(2);

    private static final MetodoPago DEFAULT_METODO_PAGO = MetodoPago.TARJETA;
    private static final MetodoPago UPDATED_METODO_PAGO = MetodoPago.EFECTIVO;

    private static final EstadoPago DEFAULT_ESTADO = EstadoPago.PENDIENTE;
    private static final EstadoPago UPDATED_ESTADO = EstadoPago.COMPLETADO;

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/pagos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PagoRepository pagoRepository;

    @Autowired
    private PagoMapper pagoMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPagoMockMvc;

    private Pago pago;

    private Pago insertedPago;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Pago createEntity() {
        return new Pago()
            .fechaPago(DEFAULT_FECHA_PAGO)
            .monto(DEFAULT_MONTO)
            .metodoPago(DEFAULT_METODO_PAGO)
            .estado(DEFAULT_ESTADO)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Pago createUpdatedEntity() {
        return new Pago()
            .fechaPago(UPDATED_FECHA_PAGO)
            .monto(UPDATED_MONTO)
            .metodoPago(UPDATED_METODO_PAGO)
            .estado(UPDATED_ESTADO)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        pago = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPago != null) {
            pagoRepository.delete(insertedPago);
            insertedPago = null;
        }
    }

    @Test
    @Transactional
    void createPago() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Pago
        PagoDTO pagoDTO = pagoMapper.toDto(pago);
        var returnedPagoDTO = om.readValue(
            restPagoMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PagoDTO.class
        );

        // Validate the Pago in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPago = pagoMapper.toEntity(returnedPagoDTO);
        assertPagoUpdatableFieldsEquals(returnedPago, getPersistedPago(returnedPago));

        insertedPago = returnedPago;
    }

    @Test
    @Transactional
    void createPagoWithExistingId() throws Exception {
        // Create the Pago with an existing ID
        pago.setId(1L);
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPagoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFechaPagoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pago.setFechaPago(null);

        // Create the Pago, which fails.
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        restPagoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMontoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pago.setMonto(null);

        // Create the Pago, which fails.
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        restPagoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMetodoPagoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pago.setMetodoPago(null);

        // Create the Pago, which fails.
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        restPagoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEstadoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pago.setEstado(null);

        // Create the Pago, which fails.
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        restPagoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        pago.setActivo(null);

        // Create the Pago, which fails.
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        restPagoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPagos() throws Exception {
        // Initialize the database
        insertedPago = pagoRepository.saveAndFlush(pago);

        // Get all the pagoList
        restPagoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(pago.getId().intValue())))
            .andExpect(jsonPath("$.[*].fechaPago").value(hasItem(DEFAULT_FECHA_PAGO.toString())))
            .andExpect(jsonPath("$.[*].monto").value(hasItem(sameNumber(DEFAULT_MONTO))))
            .andExpect(jsonPath("$.[*].metodoPago").value(hasItem(DEFAULT_METODO_PAGO.toString())))
            .andExpect(jsonPath("$.[*].estado").value(hasItem(DEFAULT_ESTADO.toString())))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getPago() throws Exception {
        // Initialize the database
        insertedPago = pagoRepository.saveAndFlush(pago);

        // Get the pago
        restPagoMockMvc
            .perform(get(ENTITY_API_URL_ID, pago.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(pago.getId().intValue()))
            .andExpect(jsonPath("$.fechaPago").value(DEFAULT_FECHA_PAGO.toString()))
            .andExpect(jsonPath("$.monto").value(sameNumber(DEFAULT_MONTO)))
            .andExpect(jsonPath("$.metodoPago").value(DEFAULT_METODO_PAGO.toString()))
            .andExpect(jsonPath("$.estado").value(DEFAULT_ESTADO.toString()))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingPago() throws Exception {
        // Get the pago
        restPagoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPago() throws Exception {
        // Initialize the database
        insertedPago = pagoRepository.saveAndFlush(pago);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the pago
        Pago updatedPago = pagoRepository.findById(pago.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPago are not directly saved in db
        em.detach(updatedPago);
        updatedPago
            .fechaPago(UPDATED_FECHA_PAGO)
            .monto(UPDATED_MONTO)
            .metodoPago(UPDATED_METODO_PAGO)
            .estado(UPDATED_ESTADO)
            .activo(UPDATED_ACTIVO);
        PagoDTO pagoDTO = pagoMapper.toDto(updatedPago);

        restPagoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, pagoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(pagoDTO))
            )
            .andExpect(status().isOk());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPagoToMatchAllProperties(updatedPago);
    }

    @Test
    @Transactional
    void putNonExistingPago() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pago.setId(longCount.incrementAndGet());

        // Create the Pago
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPagoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, pagoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(pagoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPago() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pago.setId(longCount.incrementAndGet());

        // Create the Pago
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPagoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(pagoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPago() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pago.setId(longCount.incrementAndGet());

        // Create the Pago
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPagoMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePagoWithPatch() throws Exception {
        // Initialize the database
        insertedPago = pagoRepository.saveAndFlush(pago);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the pago using partial update
        Pago partialUpdatedPago = new Pago();
        partialUpdatedPago.setId(pago.getId());

        partialUpdatedPago.metodoPago(UPDATED_METODO_PAGO).estado(UPDATED_ESTADO).activo(UPDATED_ACTIVO);

        restPagoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPago.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPago))
            )
            .andExpect(status().isOk());

        // Validate the Pago in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPagoUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPago, pago), getPersistedPago(pago));
    }

    @Test
    @Transactional
    void fullUpdatePagoWithPatch() throws Exception {
        // Initialize the database
        insertedPago = pagoRepository.saveAndFlush(pago);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the pago using partial update
        Pago partialUpdatedPago = new Pago();
        partialUpdatedPago.setId(pago.getId());

        partialUpdatedPago
            .fechaPago(UPDATED_FECHA_PAGO)
            .monto(UPDATED_MONTO)
            .metodoPago(UPDATED_METODO_PAGO)
            .estado(UPDATED_ESTADO)
            .activo(UPDATED_ACTIVO);

        restPagoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPago.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPago))
            )
            .andExpect(status().isOk());

        // Validate the Pago in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPagoUpdatableFieldsEquals(partialUpdatedPago, getPersistedPago(partialUpdatedPago));
    }

    @Test
    @Transactional
    void patchNonExistingPago() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pago.setId(longCount.incrementAndGet());

        // Create the Pago
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPagoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, pagoDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(pagoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPago() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pago.setId(longCount.incrementAndGet());

        // Create the Pago
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPagoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(pagoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPago() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        pago.setId(longCount.incrementAndGet());

        // Create the Pago
        PagoDTO pagoDTO = pagoMapper.toDto(pago);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPagoMockMvc
            .perform(patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(pagoDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Pago in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePago() throws Exception {
        // Initialize the database
        insertedPago = pagoRepository.saveAndFlush(pago);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the pago
        restPagoMockMvc
            .perform(delete(ENTITY_API_URL_ID, pago.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return pagoRepository.count();
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

    protected Pago getPersistedPago(Pago pago) {
        return pagoRepository.findById(pago.getId()).orElseThrow();
    }

    protected void assertPersistedPagoToMatchAllProperties(Pago expectedPago) {
        assertPagoAllPropertiesEquals(expectedPago, getPersistedPago(expectedPago));
    }

    protected void assertPersistedPagoToMatchUpdatableProperties(Pago expectedPago) {
        assertPagoAllUpdatablePropertiesEquals(expectedPago, getPersistedPago(expectedPago));
    }
}
