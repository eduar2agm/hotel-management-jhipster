package com.hotel.app.web.rest;

import static com.hotel.app.domain.RedSocialAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.RedSocial;
import com.hotel.app.repository.RedSocialRepository;
import com.hotel.app.service.dto.RedSocialDTO;
import com.hotel.app.service.mapper.RedSocialMapper;
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
 * Integration tests for the {@link RedSocialResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RedSocialResourceIT {

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
    private RedSocialRepository redSocialRepository;

    @Autowired
    private RedSocialMapper redSocialMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRedSocialMockMvc;

    private RedSocial redSocial;

    private RedSocial insertedRedSocial;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RedSocial createEntity() {
        return new RedSocial()
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
    public static RedSocial createUpdatedEntity() {
        return new RedSocial()
            .nombre(UPDATED_NOMBRE)
            .urlEnlace(UPDATED_URL_ENLACE)
            .iconoUrl(UPDATED_ICONO_URL)
            .colorHex(UPDATED_COLOR_HEX)
            .activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        redSocial = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedRedSocial != null) {
            redSocialRepository.delete(insertedRedSocial);
            insertedRedSocial = null;
        }
    }

    @Test
    @Transactional
    void createRedSocial() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the RedSocial
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);
        var returnedRedSocialDTO = om.readValue(
            restRedSocialMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSocialDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RedSocialDTO.class
        );

        // Validate the RedSocial in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRedSocial = redSocialMapper.toEntity(returnedRedSocialDTO);
        assertRedSocialUpdatableFieldsEquals(returnedRedSocial, getPersistedRedSocial(returnedRedSocial));

        insertedRedSocial = returnedRedSocial;
    }

    @Test
    @Transactional
    void createRedSocialWithExistingId() throws Exception {
        // Create the RedSocial with an existing ID
        redSocial.setId(1L);
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRedSocialMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSocialDTO)))
            .andExpect(status().isBadRequest());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNombreIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSocial.setNombre(null);

        // Create the RedSocial, which fails.
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        restRedSocialMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSocialDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkUrlEnlaceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSocial.setUrlEnlace(null);

        // Create the RedSocial, which fails.
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        restRedSocialMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSocialDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIconoUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSocial.setIconoUrl(null);

        // Create the RedSocial, which fails.
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        restRedSocialMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSocialDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        redSocial.setActivo(null);

        // Create the RedSocial, which fails.
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        restRedSocialMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSocialDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRedSocials() throws Exception {
        // Initialize the database
        insertedRedSocial = redSocialRepository.saveAndFlush(redSocial);

        // Get all the redSocialList
        restRedSocialMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(redSocial.getId().intValue())))
            .andExpect(jsonPath("$.[*].nombre").value(hasItem(DEFAULT_NOMBRE)))
            .andExpect(jsonPath("$.[*].urlEnlace").value(hasItem(DEFAULT_URL_ENLACE)))
            .andExpect(jsonPath("$.[*].iconoUrl").value(hasItem(DEFAULT_ICONO_URL)))
            .andExpect(jsonPath("$.[*].colorHex").value(hasItem(DEFAULT_COLOR_HEX)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @Test
    @Transactional
    void getRedSocial() throws Exception {
        // Initialize the database
        insertedRedSocial = redSocialRepository.saveAndFlush(redSocial);

        // Get the redSocial
        restRedSocialMockMvc
            .perform(get(ENTITY_API_URL_ID, redSocial.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(redSocial.getId().intValue()))
            .andExpect(jsonPath("$.nombre").value(DEFAULT_NOMBRE))
            .andExpect(jsonPath("$.urlEnlace").value(DEFAULT_URL_ENLACE))
            .andExpect(jsonPath("$.iconoUrl").value(DEFAULT_ICONO_URL))
            .andExpect(jsonPath("$.colorHex").value(DEFAULT_COLOR_HEX))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingRedSocial() throws Exception {
        // Get the redSocial
        restRedSocialMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRedSocial() throws Exception {
        // Initialize the database
        insertedRedSocial = redSocialRepository.saveAndFlush(redSocial);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the redSocial
        RedSocial updatedRedSocial = redSocialRepository.findById(redSocial.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRedSocial are not directly saved in db
        em.detach(updatedRedSocial);
        updatedRedSocial
            .nombre(UPDATED_NOMBRE)
            .urlEnlace(UPDATED_URL_ENLACE)
            .iconoUrl(UPDATED_ICONO_URL)
            .colorHex(UPDATED_COLOR_HEX)
            .activo(UPDATED_ACTIVO);
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(updatedRedSocial);

        restRedSocialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, redSocialDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(redSocialDTO))
            )
            .andExpect(status().isOk());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRedSocialToMatchAllProperties(updatedRedSocial);
    }

    @Test
    @Transactional
    void putNonExistingRedSocial() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSocial.setId(longCount.incrementAndGet());

        // Create the RedSocial
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRedSocialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, redSocialDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(redSocialDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRedSocial() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSocial.setId(longCount.incrementAndGet());

        // Create the RedSocial
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSocialMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(redSocialDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRedSocial() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSocial.setId(longCount.incrementAndGet());

        // Create the RedSocial
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSocialMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(redSocialDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRedSocialWithPatch() throws Exception {
        // Initialize the database
        insertedRedSocial = redSocialRepository.saveAndFlush(redSocial);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the redSocial using partial update
        RedSocial partialUpdatedRedSocial = new RedSocial();
        partialUpdatedRedSocial.setId(redSocial.getId());

        partialUpdatedRedSocial.nombre(UPDATED_NOMBRE).iconoUrl(UPDATED_ICONO_URL);

        restRedSocialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRedSocial.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRedSocial))
            )
            .andExpect(status().isOk());

        // Validate the RedSocial in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRedSocialUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedRedSocial, redSocial),
            getPersistedRedSocial(redSocial)
        );
    }

    @Test
    @Transactional
    void fullUpdateRedSocialWithPatch() throws Exception {
        // Initialize the database
        insertedRedSocial = redSocialRepository.saveAndFlush(redSocial);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the redSocial using partial update
        RedSocial partialUpdatedRedSocial = new RedSocial();
        partialUpdatedRedSocial.setId(redSocial.getId());

        partialUpdatedRedSocial
            .nombre(UPDATED_NOMBRE)
            .urlEnlace(UPDATED_URL_ENLACE)
            .iconoUrl(UPDATED_ICONO_URL)
            .colorHex(UPDATED_COLOR_HEX)
            .activo(UPDATED_ACTIVO);

        restRedSocialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRedSocial.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRedSocial))
            )
            .andExpect(status().isOk());

        // Validate the RedSocial in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRedSocialUpdatableFieldsEquals(partialUpdatedRedSocial, getPersistedRedSocial(partialUpdatedRedSocial));
    }

    @Test
    @Transactional
    void patchNonExistingRedSocial() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSocial.setId(longCount.incrementAndGet());

        // Create the RedSocial
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRedSocialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, redSocialDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(redSocialDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRedSocial() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSocial.setId(longCount.incrementAndGet());

        // Create the RedSocial
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSocialMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(redSocialDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRedSocial() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        redSocial.setId(longCount.incrementAndGet());

        // Create the RedSocial
        RedSocialDTO redSocialDTO = redSocialMapper.toDto(redSocial);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRedSocialMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(redSocialDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the RedSocial in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRedSocial() throws Exception {
        // Initialize the database
        insertedRedSocial = redSocialRepository.saveAndFlush(redSocial);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the redSocial
        restRedSocialMockMvc
            .perform(delete(ENTITY_API_URL_ID, redSocial.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return redSocialRepository.count();
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

    protected RedSocial getPersistedRedSocial(RedSocial redSocial) {
        return redSocialRepository.findById(redSocial.getId()).orElseThrow();
    }

    protected void assertPersistedRedSocialToMatchAllProperties(RedSocial expectedRedSocial) {
        assertRedSocialAllPropertiesEquals(expectedRedSocial, getPersistedRedSocial(expectedRedSocial));
    }

    protected void assertPersistedRedSocialToMatchUpdatableProperties(RedSocial expectedRedSocial) {
        assertRedSocialAllUpdatablePropertiesEquals(expectedRedSocial, getPersistedRedSocial(expectedRedSocial));
    }
}
