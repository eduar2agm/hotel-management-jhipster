package com.hotel.app.web.rest;

import static com.hotel.app.domain.ServicioContratadoAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.hotel.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.ServicioContratado;
import com.hotel.app.domain.enumeration.EstadoServicioContratado;
import com.hotel.app.repository.ServicioContratadoRepository;
import com.hotel.app.service.ServicioContratadoService;
import com.hotel.app.service.dto.ServicioContratadoDTO;
import com.hotel.app.service.mapper.ServicioContratadoMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link ServicioContratadoResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ServicioContratadoResourceIT {

    private static final Instant DEFAULT_FECHA_CONTRATACION = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA_CONTRATACION = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Integer DEFAULT_CANTIDAD = 1;
    private static final Integer UPDATED_CANTIDAD = 2;

    private static final BigDecimal DEFAULT_PRECIO_UNITARIO = new BigDecimal(0);
    private static final BigDecimal UPDATED_PRECIO_UNITARIO = new BigDecimal(1);

    private static final EstadoServicioContratado DEFAULT_ESTADO = EstadoServicioContratado.PENDIENTE;
    private static final EstadoServicioContratado UPDATED_ESTADO = EstadoServicioContratado.CONFIRMADO;

    private static final String DEFAULT_OBSERVACIONES = "AAAAAAAAAA";
    private static final String UPDATED_OBSERVACIONES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/servicio-contratados";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ServicioContratadoRepository servicioContratadoRepository;

    @Mock
    private ServicioContratadoRepository servicioContratadoRepositoryMock;

    @Autowired
    private ServicioContratadoMapper servicioContratadoMapper;

    @Mock
    private ServicioContratadoService servicioContratadoServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restServicioContratadoMockMvc;

    private ServicioContratado servicioContratado;

    private ServicioContratado insertedServicioContratado;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ServicioContratado createEntity() {
        return new ServicioContratado()
            .fechaContratacion(DEFAULT_FECHA_CONTRATACION)
            .cantidad(DEFAULT_CANTIDAD)
            .precioUnitario(DEFAULT_PRECIO_UNITARIO)
            .estado(DEFAULT_ESTADO)
            .observaciones(DEFAULT_OBSERVACIONES);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ServicioContratado createUpdatedEntity() {
        return new ServicioContratado()
            .fechaContratacion(UPDATED_FECHA_CONTRATACION)
            .cantidad(UPDATED_CANTIDAD)
            .precioUnitario(UPDATED_PRECIO_UNITARIO)
            .estado(UPDATED_ESTADO)
            .observaciones(UPDATED_OBSERVACIONES);
    }

    @BeforeEach
    void initTest() {
        servicioContratado = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedServicioContratado != null) {
            servicioContratadoRepository.delete(insertedServicioContratado);
            insertedServicioContratado = null;
        }
    }

    @Test
    @Transactional
    void createServicioContratado() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ServicioContratado
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);
        var returnedServicioContratadoDTO = om.readValue(
            restServicioContratadoMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(servicioContratadoDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ServicioContratadoDTO.class
        );

        // Validate the ServicioContratado in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedServicioContratado = servicioContratadoMapper.toEntity(returnedServicioContratadoDTO);
        assertServicioContratadoUpdatableFieldsEquals(
            returnedServicioContratado,
            getPersistedServicioContratado(returnedServicioContratado)
        );

        insertedServicioContratado = returnedServicioContratado;
    }

    @Test
    @Transactional
    void createServicioContratadoWithExistingId() throws Exception {
        // Create the ServicioContratado with an existing ID
        servicioContratado.setId(1L);
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restServicioContratadoMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFechaContratacionIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        servicioContratado.setFechaContratacion(null);

        // Create the ServicioContratado, which fails.
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        restServicioContratadoMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCantidadIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        servicioContratado.setCantidad(null);

        // Create the ServicioContratado, which fails.
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        restServicioContratadoMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPrecioUnitarioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        servicioContratado.setPrecioUnitario(null);

        // Create the ServicioContratado, which fails.
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        restServicioContratadoMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEstadoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        servicioContratado.setEstado(null);

        // Create the ServicioContratado, which fails.
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        restServicioContratadoMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllServicioContratados() throws Exception {
        // Initialize the database
        insertedServicioContratado = servicioContratadoRepository.saveAndFlush(servicioContratado);

        // Get all the servicioContratadoList
        restServicioContratadoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(servicioContratado.getId().intValue())))
            .andExpect(jsonPath("$.[*].fechaContratacion").value(hasItem(DEFAULT_FECHA_CONTRATACION.toString())))
            .andExpect(jsonPath("$.[*].cantidad").value(hasItem(DEFAULT_CANTIDAD)))
            .andExpect(jsonPath("$.[*].precioUnitario").value(hasItem(sameNumber(DEFAULT_PRECIO_UNITARIO))))
            .andExpect(jsonPath("$.[*].estado").value(hasItem(DEFAULT_ESTADO.toString())))
            .andExpect(jsonPath("$.[*].observaciones").value(hasItem(DEFAULT_OBSERVACIONES)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllServicioContratadosWithEagerRelationshipsIsEnabled() throws Exception {
        when(servicioContratadoServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restServicioContratadoMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(servicioContratadoServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllServicioContratadosWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(servicioContratadoServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restServicioContratadoMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(servicioContratadoRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getServicioContratado() throws Exception {
        // Initialize the database
        insertedServicioContratado = servicioContratadoRepository.saveAndFlush(servicioContratado);

        // Get the servicioContratado
        restServicioContratadoMockMvc
            .perform(get(ENTITY_API_URL_ID, servicioContratado.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(servicioContratado.getId().intValue()))
            .andExpect(jsonPath("$.fechaContratacion").value(DEFAULT_FECHA_CONTRATACION.toString()))
            .andExpect(jsonPath("$.cantidad").value(DEFAULT_CANTIDAD))
            .andExpect(jsonPath("$.precioUnitario").value(sameNumber(DEFAULT_PRECIO_UNITARIO)))
            .andExpect(jsonPath("$.estado").value(DEFAULT_ESTADO.toString()))
            .andExpect(jsonPath("$.observaciones").value(DEFAULT_OBSERVACIONES));
    }

    @Test
    @Transactional
    void getNonExistingServicioContratado() throws Exception {
        // Get the servicioContratado
        restServicioContratadoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingServicioContratado() throws Exception {
        // Initialize the database
        insertedServicioContratado = servicioContratadoRepository.saveAndFlush(servicioContratado);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the servicioContratado
        ServicioContratado updatedServicioContratado = servicioContratadoRepository.findById(servicioContratado.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedServicioContratado are not directly saved in db
        em.detach(updatedServicioContratado);
        updatedServicioContratado
            .fechaContratacion(UPDATED_FECHA_CONTRATACION)
            .cantidad(UPDATED_CANTIDAD)
            .precioUnitario(UPDATED_PRECIO_UNITARIO)
            .estado(UPDATED_ESTADO)
            .observaciones(UPDATED_OBSERVACIONES);
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(updatedServicioContratado);

        restServicioContratadoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, servicioContratadoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isOk());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedServicioContratadoToMatchAllProperties(updatedServicioContratado);
    }

    @Test
    @Transactional
    void putNonExistingServicioContratado() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        servicioContratado.setId(longCount.incrementAndGet());

        // Create the ServicioContratado
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restServicioContratadoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, servicioContratadoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchServicioContratado() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        servicioContratado.setId(longCount.incrementAndGet());

        // Create the ServicioContratado
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServicioContratadoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamServicioContratado() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        servicioContratado.setId(longCount.incrementAndGet());

        // Create the ServicioContratado
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServicioContratadoMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateServicioContratadoWithPatch() throws Exception {
        // Initialize the database
        insertedServicioContratado = servicioContratadoRepository.saveAndFlush(servicioContratado);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the servicioContratado using partial update
        ServicioContratado partialUpdatedServicioContratado = new ServicioContratado();
        partialUpdatedServicioContratado.setId(servicioContratado.getId());

        partialUpdatedServicioContratado
            .fechaContratacion(UPDATED_FECHA_CONTRATACION)
            .precioUnitario(UPDATED_PRECIO_UNITARIO)
            .observaciones(UPDATED_OBSERVACIONES);

        restServicioContratadoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedServicioContratado.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedServicioContratado))
            )
            .andExpect(status().isOk());

        // Validate the ServicioContratado in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertServicioContratadoUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedServicioContratado, servicioContratado),
            getPersistedServicioContratado(servicioContratado)
        );
    }

    @Test
    @Transactional
    void fullUpdateServicioContratadoWithPatch() throws Exception {
        // Initialize the database
        insertedServicioContratado = servicioContratadoRepository.saveAndFlush(servicioContratado);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the servicioContratado using partial update
        ServicioContratado partialUpdatedServicioContratado = new ServicioContratado();
        partialUpdatedServicioContratado.setId(servicioContratado.getId());

        partialUpdatedServicioContratado
            .fechaContratacion(UPDATED_FECHA_CONTRATACION)
            .cantidad(UPDATED_CANTIDAD)
            .precioUnitario(UPDATED_PRECIO_UNITARIO)
            .estado(UPDATED_ESTADO)
            .observaciones(UPDATED_OBSERVACIONES);

        restServicioContratadoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedServicioContratado.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedServicioContratado))
            )
            .andExpect(status().isOk());

        // Validate the ServicioContratado in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertServicioContratadoUpdatableFieldsEquals(
            partialUpdatedServicioContratado,
            getPersistedServicioContratado(partialUpdatedServicioContratado)
        );
    }

    @Test
    @Transactional
    void patchNonExistingServicioContratado() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        servicioContratado.setId(longCount.incrementAndGet());

        // Create the ServicioContratado
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restServicioContratadoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, servicioContratadoDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchServicioContratado() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        servicioContratado.setId(longCount.incrementAndGet());

        // Create the ServicioContratado
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServicioContratadoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamServicioContratado() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        servicioContratado.setId(longCount.incrementAndGet());

        // Create the ServicioContratado
        ServicioContratadoDTO servicioContratadoDTO = servicioContratadoMapper.toDto(servicioContratado);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restServicioContratadoMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(servicioContratadoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ServicioContratado in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteServicioContratado() throws Exception {
        // Initialize the database
        insertedServicioContratado = servicioContratadoRepository.saveAndFlush(servicioContratado);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the servicioContratado
        restServicioContratadoMockMvc
            .perform(delete(ENTITY_API_URL_ID, servicioContratado.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return servicioContratadoRepository.count();
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

    protected ServicioContratado getPersistedServicioContratado(ServicioContratado servicioContratado) {
        return servicioContratadoRepository.findById(servicioContratado.getId()).orElseThrow();
    }

    protected void assertPersistedServicioContratadoToMatchAllProperties(ServicioContratado expectedServicioContratado) {
        assertServicioContratadoAllPropertiesEquals(expectedServicioContratado, getPersistedServicioContratado(expectedServicioContratado));
    }

    protected void assertPersistedServicioContratadoToMatchUpdatableProperties(ServicioContratado expectedServicioContratado) {
        assertServicioContratadoAllUpdatablePropertiesEquals(
            expectedServicioContratado,
            getPersistedServicioContratado(expectedServicioContratado)
        );
    }
}
