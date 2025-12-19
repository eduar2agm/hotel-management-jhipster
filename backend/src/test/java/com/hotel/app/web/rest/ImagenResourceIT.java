package com.hotel.app.web.rest;

import static com.hotel.app.domain.ImagenAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.Imagen;
import com.hotel.app.repository.ImagenRepository;
import com.hotel.app.service.ImagenService;
import com.hotel.app.service.dto.ImagenDTO;
import com.hotel.app.service.mapper.ImagenMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Base64;
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
 * Integration tests for the {@link ImagenResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ImagenResourceIT {

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final byte[] DEFAULT_FICHERO = TestUtil.createByteArray(1, "0");
    private static final byte[] UPDATED_FICHERO = TestUtil.createByteArray(1, "1");
    private static final String DEFAULT_FICHERO_CONTENT_TYPE = "image/jpg";
    private static final String UPDATED_FICHERO_CONTENT_TYPE = "image/png";

    private static final String DEFAULT_NOMBRE_ARCHIVO = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE_ARCHIVO = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final Instant DEFAULT_FECHA_CREACION = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_FECHA_CREACION = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/imagens";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ImagenRepository imagenRepository;

    @Mock
    private ImagenRepository imagenRepositoryMock;

    @Autowired
    private ImagenMapper imagenMapper;

    @Mock
    private ImagenService imagenServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restImagenMockMvc;

    private Imagen imagen;

    private Imagen insertedImagen;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Imagen createEntity() {
        return new Imagen()
            .nombre(DEFAULT_NOMBRE)
            .descripcion(DEFAULT_DESCRIPCION)
            .fichero(DEFAULT_FICHERO)
            .ficheroContentType(DEFAULT_FICHERO_CONTENT_TYPE)
            .nombreArchivo(DEFAULT_NOMBRE_ARCHIVO)
            .activo(DEFAULT_ACTIVO)
            .fechaCreacion(DEFAULT_FECHA_CREACION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Imagen createUpdatedEntity() {
        return new Imagen()
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .fichero(UPDATED_FICHERO)
            .ficheroContentType(UPDATED_FICHERO_CONTENT_TYPE)
            .nombreArchivo(UPDATED_NOMBRE_ARCHIVO)
            .activo(UPDATED_ACTIVO)
            .fechaCreacion(UPDATED_FECHA_CREACION);
    }

    @BeforeEach
    void initTest() {
        imagen = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedImagen != null) {
            imagenRepository.delete(insertedImagen);
            insertedImagen = null;
        }
    }

    @Test
    @Transactional
    void createImagen() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Imagen
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);
        var returnedImagenDTO = om.readValue(
            restImagenMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(imagenDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ImagenDTO.class
        );

        // Validate the Imagen in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedImagen = imagenMapper.toEntity(returnedImagenDTO);
        assertImagenUpdatableFieldsEquals(returnedImagen, getPersistedImagen(returnedImagen));

        insertedImagen = returnedImagen;
    }

    @Test
    @Transactional
    void createImagenWithExistingId() throws Exception {
        // Create the Imagen with an existing ID
        imagen.setId(1L);
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restImagenMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(imagenDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        imagen.setNombre(null);

        // Create the Imagen, which fails.
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        restImagenMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(imagenDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        imagen.setActivo(null);

        // Create the Imagen, which fails.
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        restImagenMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(imagenDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllImagens() throws Exception {
        // Initialize the database
        insertedImagen = imagenRepository.saveAndFlush(imagen);

        // Get all the imagenList
        restImagenMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(imagen.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].ficheroContentType").value(hasItem(DEFAULT_FICHERO_CONTENT_TYPE)))
            .andExpect(jsonPath("$.[*].fichero").value(hasItem(Base64.getEncoder().encodeToString(DEFAULT_FICHERO))))
            .andExpect(jsonPath("$.[*].nombreArchivo").value(hasItem(DEFAULT_NOMBRE_ARCHIVO)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)))
            .andExpect(jsonPath("$.[*].fechaCreacion").value(hasItem(DEFAULT_FECHA_CREACION.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllImagensWithEagerRelationshipsIsEnabled() throws Exception {
        when(imagenServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restImagenMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(imagenServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllImagensWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(imagenServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restImagenMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(imagenRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getImagen() throws Exception {
        // Initialize the database
        insertedImagen = imagenRepository.saveAndFlush(imagen);

        // Get the imagen
        restImagenMockMvc
            .perform(get(ENTITY_API_URL_ID, imagen.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(imagen.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.ficheroContentType").value(DEFAULT_FICHERO_CONTENT_TYPE))
            .andExpect(jsonPath("$.fichero").value(Base64.getEncoder().encodeToString(DEFAULT_FICHERO)))
            .andExpect(jsonPath("$.nombreArchivo").value(DEFAULT_NOMBRE_ARCHIVO))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO))
            .andExpect(jsonPath("$.fechaCreacion").value(DEFAULT_FECHA_CREACION.toString()));
    }

    @Test
    @Transactional
    void getNonExistingImagen() throws Exception {
        // Get the imagen
        restImagenMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingImagen() throws Exception {
        // Initialize the database
        insertedImagen = imagenRepository.saveAndFlush(imagen);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the imagen
        Imagen updatedImagen = imagenRepository.findById(imagen.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedImagen are not directly saved in db
        em.detach(updatedImagen);
        updatedImagen
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .fichero(UPDATED_FICHERO)
            .ficheroContentType(UPDATED_FICHERO_CONTENT_TYPE)
            .nombreArchivo(UPDATED_NOMBRE_ARCHIVO)
            .activo(UPDATED_ACTIVO)
            .fechaCreacion(UPDATED_FECHA_CREACION);
        ImagenDTO imagenDTO = imagenMapper.toDto(updatedImagen);

        restImagenMockMvc
            .perform(
                put(ENTITY_API_URL_ID, imagenDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(imagenDTO))
            )
            .andExpect(status().isOk());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedImagenToMatchAllProperties(updatedImagen);
    }

    @Test
    @Transactional
    void putNonExistingImagen() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        imagen.setId(longCount.incrementAndGet());

        // Create the Imagen
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restImagenMockMvc
            .perform(
                put(ENTITY_API_URL_ID, imagenDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(imagenDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchImagen() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        imagen.setId(longCount.incrementAndGet());

        // Create the Imagen
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restImagenMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(imagenDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamImagen() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        imagen.setId(longCount.incrementAndGet());

        // Create the Imagen
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restImagenMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(imagenDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateImagenWithPatch() throws Exception {
        // Initialize the database
        insertedImagen = imagenRepository.saveAndFlush(imagen);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the imagen using partial update
        Imagen partialUpdatedImagen = new Imagen();
        partialUpdatedImagen.setId(imagen.getId());

        partialUpdatedImagen.nombre(UPDATED_NOMBRE).fechaCreacion(UPDATED_FECHA_CREACION);

        restImagenMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedImagen.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedImagen))
            )
            .andExpect(status().isOk());

        // Validate the Imagen in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertImagenUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedImagen, imagen), getPersistedImagen(imagen));
    }

    @Test
    @Transactional
    void fullUpdateImagenWithPatch() throws Exception {
        // Initialize the database
        insertedImagen = imagenRepository.saveAndFlush(imagen);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the imagen using partial update
        Imagen partialUpdatedImagen = new Imagen();
        partialUpdatedImagen.setId(imagen.getId());

        partialUpdatedImagen
            .nombre(UPDATED_NOMBRE)
            .descripcion(UPDATED_DESCRIPCION)
            .fichero(UPDATED_FICHERO)
            .ficheroContentType(UPDATED_FICHERO_CONTENT_TYPE)
            .nombreArchivo(UPDATED_NOMBRE_ARCHIVO)
            .activo(UPDATED_ACTIVO)
            .fechaCreacion(UPDATED_FECHA_CREACION);

        restImagenMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedImagen.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedImagen))
            )
            .andExpect(status().isOk());

        // Validate the Imagen in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertImagenUpdatableFieldsEquals(partialUpdatedImagen, getPersistedImagen(partialUpdatedImagen));
    }

    @Test
    @Transactional
    void patchNonExistingImagen() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        imagen.setId(longCount.incrementAndGet());

        // Create the Imagen
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restImagenMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, imagenDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(imagenDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchImagen() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        imagen.setId(longCount.incrementAndGet());

        // Create the Imagen
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restImagenMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(imagenDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamImagen() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        imagen.setId(longCount.incrementAndGet());

        // Create the Imagen
        ImagenDTO imagenDTO = imagenMapper.toDto(imagen);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restImagenMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(imagenDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Imagen in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteImagen() throws Exception {
        // Initialize the database
        insertedImagen = imagenRepository.saveAndFlush(imagen);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the imagen
        restImagenMockMvc
            .perform(delete(ENTITY_API_URL_ID, imagen.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return imagenRepository.count();
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

    protected Imagen getPersistedImagen(Imagen imagen) {
        return imagenRepository.findById(imagen.getId()).orElseThrow();
    }

    protected void assertPersistedImagenToMatchAllProperties(Imagen expectedImagen) {
        assertImagenAllPropertiesEquals(expectedImagen, getPersistedImagen(expectedImagen));
    }

    protected void assertPersistedImagenToMatchUpdatableProperties(Imagen expectedImagen) {
        assertImagenAllUpdatablePropertiesEquals(expectedImagen, getPersistedImagen(expectedImagen));
    }
}
