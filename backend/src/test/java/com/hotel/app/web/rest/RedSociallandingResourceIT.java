package com.hotel.app.web.rest;

import static com.hotel.app.domain.RedSociallandingAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.RedSociallanding;
import com.hotel.app.repository.RedSociallandingRepository;
import com.hotel.app.service.dto.RedSociallandingDTO;
import com.hotel.app.service.mapper.RedSociallandingMapper;
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
 * Integration tests for the {@link RedSociallandingResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RedSociallandingResourceIT {

    private static final String DEFAULT_NOMBRE = "AAAAAAAAAA";
    private static final String UPDATED_NOMBRE = "BBBBBBBBBB";

    private static final String DEFAULT_URL_ENLACE = "AAAAAAAAAA";
    private static final String UPDATED_URL_ENLACE = "BBBBBBBBBB";

    private static final String DEFAULT_ICONO_URL = "AAAAAAAAAA";
    private static final String UPDATED_ICONO_URL = "BBBBBBBBBB";

    private static final String DEFAULT_COLOR_HEX = "AAAAAAA";
    private static final String UPDATED_COLOR_HEX = "BBBBBBB";

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/red-socials";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private RedSociallandingRepository redSociallandingRepository;

    @Autowired
    private RedSociallandingMapper redSociallandingMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRedSociallandingMockMvc;

    private RedSociallanding redSociallanding;

    private RedSociallanding insertedRedSociallanding;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RedSociallanding createEntity() {
        return new RedSociallanding()
            .nombre(DEFAULT_NOMBRE)
            .urlEnlace(DEFAULT_URL_ENLACE)
            .iconoUrl(DEFAULT_ICONO_URL)
            .colorHex(DEFAULT_COLOR_HEX)
            .activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RedSociallanding createUpdatedEntity() {
        return new RedSociallanding()
            .nombre(UPDATED_NOMBRE)
            .urlEnlace(UPDATED_URL_ENLACE)
            .iconoUrl(UPDATED_ICONO_URL)
            .colorHex(UPDATED_COLOR_HEX)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        redSociallanding = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedRedSociallanding != null) {
            redSociallandingRepository.delete(insertedRedSociallanding);
            insertedRedSociallanding = null;
        }
    }

    @Test
    @Transactional
    void createRedSociallanding() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the RedSociallanding
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);
        var returnedRedSociallandingDTO = om.readValue(
            restRedSociallandingMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSociallandingDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RedSociallandingDTO.class
        );

        // Validate the RedSociallanding in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRedSociallanding = redSociallandingMapper.toEntity(returnedRedSociallandingDTO);
        assertRedSociallandingUpdatableFieldsEquals(returnedRedSociallanding, getPersistedRedSociallanding(returnedRedSociallanding));

        insertedRedSociallanding = returnedRedSociallanding;
    }

    @Test
    @Transactional
    void createRedSociallandingWithExistingId() throws Exception {
        // Create the RedSociallanding with an existing ID
        redSociallanding.setId(1L);
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRedSociallandingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSociallandingDTO)))
            .andExpect(status().isBadRequest());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSociallanding.setNombre(null);

        // Create the RedSociallanding, which fails.
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        restRedSociallandingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSociallandingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkUrlEnlaceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSociallanding.setUrlEnlace(null);

        // Create the RedSociallanding, which fails.
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        restRedSociallandingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSociallandingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIconoUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSociallanding.setIconoUrl(null);

        // Create the RedSociallanding, which fails.
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        restRedSociallandingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSociallandingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSociallanding.setActivo(null);

        // Create the RedSociallanding, which fails.
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        restRedSociallandingMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSociallandingDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRedSociallandings() throws Exception {
        // Initialize the database
        insertedRedSociallanding = redSociallandingRepository.saveAndFlush(redSociallanding);

        // Get all the redSociallandingList
        restRedSociallandingMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(redSociallanding.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].urlEnlace").value(hasItem(DEFAULT_URL_ENLACE)))
            .andExpect(jsonPath("$.[*].iconoUrl").value(hasItem(DEFAULT_ICONO_URL)))
            .andExpect(jsonPath("$.[*].colorHex").value(hasItem(DEFAULT_COLOR_HEX)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getRedSociallanding() throws Exception {
        // Initialize the database
        insertedRedSociallanding = redSociallandingRepository.saveAndFlush(redSociallanding);

        // Get the redSociallanding
        restRedSociallandingMockMvc
            .perform(get(ENTITY_API_URL_ID, redSociallanding.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(redSociallanding.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.urlEnlace").value(DEFAULT_URL_ENLACE))
            .andExpect(jsonPath("$.iconoUrl").value(DEFAULT_ICONO_URL))
            .andExpect(jsonPath("$.colorHex").value(DEFAULT_COLOR_HEX))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingRedSociallanding() throws Exception {
        // Get the redSociallanding
        restRedSociallandingMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRedSociallanding() throws Exception {
        // Initialize the database
        insertedRedSociallanding = redSociallandingRepository.saveAndFlush(redSociallanding);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the redSociallanding
        RedSociallanding updatedRedSociallanding = redSociallandingRepository.findById(redSociallanding.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRedSociallanding are not directly saved in db
        em.detach(updatedRedSociallanding);
        updatedRedSociallanding
            .nombre(UPDATED_NOMBRE)
            .urlEnlace(UPDATED_URL_ENLACE)
            .iconoUrl(UPDATED_ICONO_URL)
            .colorHex(UPDATED_COLOR_HEX)
            .activo(UPDATED_ACTIVO);
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(updatedRedSociallanding);

        restRedSociallandingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, redSociallandingDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(redSociallandingDTO))
            )
            .andExpect(status().isOk());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRedSociallandingToMatchAllProperties(updatedRedSociallanding);
    }

    @Test
    @Transactional
    void putNonExistingRedSociallanding() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSociallanding.setId(longCount.incrementAndGet());

        // Create the RedSociallanding
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRedSociallandingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, redSociallandingDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(redSociallandingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRedSociallanding() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSociallanding.setId(longCount.incrementAndGet());

        // Create the RedSociallanding
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSociallandingMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(redSociallandingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRedSociallanding() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSociallanding.setId(longCount.incrementAndGet());

        // Create the RedSociallanding
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSociallandingMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSociallandingDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRedSociallandingWithPatch() throws Exception {
        // Initialize the database
        insertedRedSociallanding = redSociallandingRepository.saveAndFlush(redSociallanding);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the redSociallanding using partial update
        RedSociallanding partialUpdatedRedSociallanding = new RedSociallanding();
        partialUpdatedRedSociallanding.setId(redSociallanding.getId());

        partialUpdatedRedSociallanding.nombre(UPDATED_NOMBRE).iconoUrl(UPDATED_ICONO_URL);

        restRedSociallandingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRedSociallanding.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRedSociallanding))
            )
            .andExpect(status().isOk());

        // Validate the RedSociallanding in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRedSociallandingUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedRedSociallanding, redSociallanding),
            getPersistedRedSociallanding(redSociallanding)
        );
    }

    @Test
    @Transactional
    void fullUpdateRedSociallandingWithPatch() throws Exception {
        // Initialize the database
        insertedRedSociallanding = redSociallandingRepository.saveAndFlush(redSociallanding);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the redSociallanding using partial update
        RedSociallanding partialUpdatedRedSociallanding = new RedSociallanding();
        partialUpdatedRedSociallanding.setId(redSociallanding.getId());

        partialUpdatedRedSociallanding
            .nombre(UPDATED_NOMBRE)
            .urlEnlace(UPDATED_URL_ENLACE)
            .iconoUrl(UPDATED_ICONO_URL)
            .colorHex(UPDATED_COLOR_HEX)
            .activo(UPDATED_ACTIVO);

        restRedSociallandingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRedSociallanding.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRedSociallanding))
            )
            .andExpect(status().isOk());

        // Validate the RedSociallanding in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRedSociallandingUpdatableFieldsEquals(partialUpdatedRedSociallanding, getPersistedRedSociallanding(partialUpdatedRedSociallanding));
    }

    @Test
    @Transactional
    void patchNonExistingRedSociallanding() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSociallanding.setId(longCount.incrementAndGet());

        // Create the RedSociallanding
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRedSociallandingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, redSociallandingDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(redSociallandingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRedSociallanding() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSociallanding.setId(longCount.incrementAndGet());

        // Create the RedSociallanding
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSociallandingMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(redSociallandingDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRedSociallanding() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSociallanding.setId(longCount.incrementAndGet());

        // Create the RedSociallanding
        RedSociallandingDTO redSociallandingDTO = redSociallandingMapper.toDto(redSociallanding);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSociallandingMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(redSociallandingDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the RedSociallanding in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRedSociallanding() throws Exception {
        // Initialize the database
        insertedRedSociallanding = redSociallandingRepository.saveAndFlush(redSociallanding);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the redSociallanding
        restRedSociallandingMockMvc
            .perform(delete(ENTITY_API_URL_ID, redSociallanding.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return redSociallandingRepository.count();
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

    protected RedSociallanding getPersistedRedSociallanding(RedSociallanding redSociallanding) {
        return redSociallandingRepository.findById(redSociallanding.getId()).orElseThrow();
    }

    protected void assertPersistedRedSociallandingToMatchAllProperties(RedSociallanding expectedRedSociallanding) {
        assertRedSociallandingAllPropertiesEquals(expectedRedSociallanding, getPersistedRedSociallanding(expectedRedSociallanding));
    }

    protected void assertPersistedRedSociallandingToMatchUpdatableProperties(RedSociallanding expectedRedSociallanding) {
        assertRedSociallandingAllUpdatablePropertiesEquals(expectedRedSociallanding, getPersistedRedSociallanding(expectedRedSociallanding));
    }
}
