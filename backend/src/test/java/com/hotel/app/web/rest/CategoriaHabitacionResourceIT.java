package com.hotel.app.web.rest;

import static com.hotel.app.domain.CategoriaHabitacionAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static com.hotel.app.web.rest.TestUtil.sameNumber;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.CategoriaHabitacion;
import com.hotel.app.domain.enumeration.CategoriaHabitacionNombre;
import com.hotel.app.repository.CategoriaHabitacionRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
 * Integration tests for the {@link CategoriaHabitacionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CategoriaHabitacionResourceIT {

    private static final CategoriaHabitacionNombre DEFAULT_NOMBRE = CategoriaHabitacionNombre.SENCILLA;
    private static final CategoriaHabitacionNombre UPDATED_NOMBRE = CategoriaHabitacionNombre.DOBLE;

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_PRECIO_BASE = new BigDecimal(1);
    private static final BigDecimal UPDATED_PRECIO_BASE = new BigDecimal(2);

    private static final String ENTITY_API_URL = "/api/categoria-habitacions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CategoriaHabitacionRepository categoriaHabitacionRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCategoriaHabitacionMockMvc;

    private CategoriaHabitacion categoriaHabitacion;

    private CategoriaHabitacion insertedCategoriaHabitacion;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CategoriaHabitacion createEntity() {
        return new CategoriaHabitacion().nombre(DEFAULT_NOMBRE).descripcion(DEFAULT_DESCRIPCION).precioBase(DEFAULT_PRECIO_BASE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CategoriaHabitacion createUpdatedEntity() {
        return new CategoriaHabitacion().nombre(UPDATED_NOMBRE).descripcion(UPDATED_DESCRIPCION).precioBase(UPDATED_PRECIO_BASE);
    }

    @BeforeEach
    void initTest() {
        categoriaHabitacion = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCategoriaHabitacion != null) {
            categoriaHabitacionRepository.delete(insertedCategoriaHabitacion);
            insertedCategoriaHabitacion = null;
        }
    }

    @Test
    @Transactional
    void createCategoriaHabitacion() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CategoriaHabitacion
        var returnedCategoriaHabitacion = om.readValue(
            restCategoriaHabitacionMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(categoriaHabitacion))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CategoriaHabitacion.class
        );

        // Validate the CategoriaHabitacion in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertCategoriaHabitacionUpdatableFieldsEquals(
            returnedCategoriaHabitacion,
            getPersistedCategoriaHabitacion(returnedCategoriaHabitacion)
        );

        insertedCategoriaHabitacion = returnedCategoriaHabitacion;
    }

    @Test
    @Transactional
    void createCategoriaHabitacionWithExistingId() throws Exception {
        // Create the CategoriaHabitacion with an existing ID
        categoriaHabitacion.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCategoriaHabitacionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        categoriaHabitacion.setNombre(null);

        // Create the CategoriaHabitacion, which fails.

        restCategoriaHabitacionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPrecioBaseIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        categoriaHabitacion.setPrecioBase(null);

        // Create the CategoriaHabitacion, which fails.

        restCategoriaHabitacionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCategoriaHabitacions() throws Exception {
        // Initialize the database
        insertedCategoriaHabitacion = categoriaHabitacionRepository.saveAndFlush(categoriaHabitacion);

        // Get all the categoriaHabitacionList
        restCategoriaHabitacionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(categoriaHabitacion.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE.toString())))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].precioBase").value(hasItem(sameNumber(DEFAULT_PRECIO_BASE))));
    }

    @Test
    @Transactional
    void getCategoriaHabitacion() throws Exception {
        // Initialize the database
        insertedCategoriaHabitacion = categoriaHabitacionRepository.saveAndFlush(categoriaHabitacion);

        // Get the categoriaHabitacion
        restCategoriaHabitacionMockMvc
            .perform(get(ENTITY_API_URL_ID, categoriaHabitacion.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(categoriaHabitacion.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE.toString()))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.precioBase").value(sameNumber(DEFAULT_PRECIO_BASE)));
    }

    @Test
    @Transactional
    void getNonExistingCategoriaHabitacion() throws Exception {
        // Get the categoriaHabitacion
        restCategoriaHabitacionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCategoriaHabitacion() throws Exception {
        // Initialize the database
        insertedCategoriaHabitacion = categoriaHabitacionRepository.saveAndFlush(categoriaHabitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the categoriaHabitacion
        CategoriaHabitacion updatedCategoriaHabitacion = categoriaHabitacionRepository.findById(categoriaHabitacion.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCategoriaHabitacion are not directly saved in db
        em.detach(updatedCategoriaHabitacion);
        updatedCategoriaHabitacion.nombre(UPDATED_NOMBRE).descripcion(UPDATED_DESCRIPCION).precioBase(UPDATED_PRECIO_BASE);

        restCategoriaHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCategoriaHabitacion.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedCategoriaHabitacion))
            )
            .andExpect(status().isOk());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCategoriaHabitacionToMatchAllProperties(updatedCategoriaHabitacion);
    }

    @Test
    @Transactional
    void putNonExistingCategoriaHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoriaHabitacion.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoriaHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, categoriaHabitacion.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCategoriaHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoriaHabitacion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCategoriaHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoriaHabitacion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaHabitacionMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCategoriaHabitacionWithPatch() throws Exception {
        // Initialize the database
        insertedCategoriaHabitacion = categoriaHabitacionRepository.saveAndFlush(categoriaHabitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the categoriaHabitacion using partial update
        CategoriaHabitacion partialUpdatedCategoriaHabitacion = new CategoriaHabitacion();
        partialUpdatedCategoriaHabitacion.setId(categoriaHabitacion.getId());

        partialUpdatedCategoriaHabitacion.descripcion(UPDATED_DESCRIPCION).precioBase(UPDATED_PRECIO_BASE);

        restCategoriaHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoriaHabitacion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCategoriaHabitacion))
            )
            .andExpect(status().isOk());

        // Validate the CategoriaHabitacion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCategoriaHabitacionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCategoriaHabitacion, categoriaHabitacion),
            getPersistedCategoriaHabitacion(categoriaHabitacion)
        );
    }

    @Test
    @Transactional
    void fullUpdateCategoriaHabitacionWithPatch() throws Exception {
        // Initialize the database
        insertedCategoriaHabitacion = categoriaHabitacionRepository.saveAndFlush(categoriaHabitacion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the categoriaHabitacion using partial update
        CategoriaHabitacion partialUpdatedCategoriaHabitacion = new CategoriaHabitacion();
        partialUpdatedCategoriaHabitacion.setId(categoriaHabitacion.getId());

        partialUpdatedCategoriaHabitacion.nombre(UPDATED_NOMBRE).descripcion(UPDATED_DESCRIPCION).precioBase(UPDATED_PRECIO_BASE);

        restCategoriaHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoriaHabitacion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCategoriaHabitacion))
            )
            .andExpect(status().isOk());

        // Validate the CategoriaHabitacion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCategoriaHabitacionUpdatableFieldsEquals(
            partialUpdatedCategoriaHabitacion,
            getPersistedCategoriaHabitacion(partialUpdatedCategoriaHabitacion)
        );
    }

    @Test
    @Transactional
    void patchNonExistingCategoriaHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoriaHabitacion.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoriaHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, categoriaHabitacion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCategoriaHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoriaHabitacion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCategoriaHabitacion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        categoriaHabitacion.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoriaHabitacionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(categoriaHabitacion))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CategoriaHabitacion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCategoriaHabitacion() throws Exception {
        // Initialize the database
        insertedCategoriaHabitacion = categoriaHabitacionRepository.saveAndFlush(categoriaHabitacion);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the categoriaHabitacion
        restCategoriaHabitacionMockMvc
            .perform(delete(ENTITY_API_URL_ID, categoriaHabitacion.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return categoriaHabitacionRepository.count();
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

    protected CategoriaHabitacion getPersistedCategoriaHabitacion(CategoriaHabitacion categoriaHabitacion) {
        return categoriaHabitacionRepository.findById(categoriaHabitacion.getId()).orElseThrow();
    }

    protected void assertPersistedCategoriaHabitacionToMatchAllProperties(CategoriaHabitacion expectedCategoriaHabitacion) {
        assertCategoriaHabitacionAllPropertiesEquals(
            expectedCategoriaHabitacion,
            getPersistedCategoriaHabitacion(expectedCategoriaHabitacion)
        );
    }

    protected void assertPersistedCategoriaHabitacionToMatchUpdatableProperties(CategoriaHabitacion expectedCategoriaHabitacion) {
        assertCategoriaHabitacionAllUpdatablePropertiesEquals(
            expectedCategoriaHabitacion,
            getPersistedCategoriaHabitacion(expectedCategoriaHabitacion)
        );
    }
}
