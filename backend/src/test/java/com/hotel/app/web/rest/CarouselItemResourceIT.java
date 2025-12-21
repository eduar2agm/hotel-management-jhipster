package com.hotel.app.web.rest;

import static com.hotel.app.domain.CarouselItemAsserts.*;
import static com.hotel.app.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.app.IntegrationTest;
import com.hotel.app.domain.CarouselItem;
import com.hotel.app.repository.CarouselItemRepository;
import com.hotel.app.service.CarouselItemService;
import com.hotel.app.service.dto.CarouselItemDTO;
import com.hotel.app.service.mapper.CarouselItemMapper;
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
 * Integration tests for the {@link CarouselItemResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CarouselItemResourceIT {

    private static final String DEFAULT_TITULO = "AAAAAAAAAA";
    private static final String UPDATED_TITULO = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPCION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPCION = "BBBBBBBBBB";

    private static final Integer DEFAULT_ORDEN = 1;
    private static final Integer UPDATED_ORDEN = 2;

    private static final Boolean DEFAULT_ACTIVO = false;
    private static final Boolean UPDATED_ACTIVO = true;

    private static final String ENTITY_API_URL = "/api/carousel-items";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CarouselItemRepository carouselItemRepository;

    @Mock
    private CarouselItemRepository carouselItemRepositoryMock;

    @Autowired
    private CarouselItemMapper carouselItemMapper;

    @Mock
    private CarouselItemService carouselItemServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCarouselItemMockMvc;

    private CarouselItem carouselItem;

    private CarouselItem insertedCarouselItem;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CarouselItem createEntity() {
        return new CarouselItem().titulo(DEFAULT_TITULO).descripcion(DEFAULT_DESCRIPCION).orden(DEFAULT_ORDEN).activo(DEFAULT_ACTIVO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CarouselItem createUpdatedEntity() {
        return new CarouselItem().titulo(UPDATED_TITULO).descripcion(UPDATED_DESCRIPCION).orden(UPDATED_ORDEN).activo(UPDATED_ACTIVO);
    }

    @BeforeEach
    void initTest() {
        carouselItem = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCarouselItem != null) {
            carouselItemRepository.delete(insertedCarouselItem);
            insertedCarouselItem = null;
        }
    }

    @Test
    @Transactional
    void createCarouselItem() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CarouselItem
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);
        var returnedCarouselItemDTO = om.readValue(
            restCarouselItemMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(carouselItemDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CarouselItemDTO.class
        );

        // Validate the CarouselItem in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCarouselItem = carouselItemMapper.toEntity(returnedCarouselItemDTO);
        assertCarouselItemUpdatableFieldsEquals(returnedCarouselItem, getPersistedCarouselItem(returnedCarouselItem));

        insertedCarouselItem = returnedCarouselItem;
    }

    @Test
    @Transactional
    void createCarouselItemWithExistingId() throws Exception {
        // Create the CarouselItem with an existing ID
        carouselItem.setId(1L);
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCarouselItemMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkOrdenIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        carouselItem.setOrden(null);

        // Create the CarouselItem, which fails.
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        restCarouselItemMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        carouselItem.setActivo(null);

        // Create the CarouselItem, which fails.
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        restCarouselItemMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCarouselItems() throws Exception {
        // Initialize the database
        insertedCarouselItem = carouselItemRepository.saveAndFlush(carouselItem);

        // Get all the carouselItemList
        restCarouselItemMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(carouselItem.getId().intValue())))
            .andExpect(jsonPath("$.[*].titulo").value(hasItem(DEFAULT_TITULO)))
            .andExpect(jsonPath("$.[*].descripcion").value(hasItem(DEFAULT_DESCRIPCION)))
            .andExpect(jsonPath("$.[*].orden").value(hasItem(DEFAULT_ORDEN)))
            .andExpect(jsonPath("$.[*].activo").value(hasItem(DEFAULT_ACTIVO)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCarouselItemsWithEagerRelationshipsIsEnabled() throws Exception {
        when(carouselItemServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCarouselItemMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(carouselItemServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCarouselItemsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(carouselItemServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCarouselItemMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(carouselItemRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getCarouselItem() throws Exception {
        // Initialize the database
        insertedCarouselItem = carouselItemRepository.saveAndFlush(carouselItem);

        // Get the carouselItem
        restCarouselItemMockMvc
            .perform(get(ENTITY_API_URL_ID, carouselItem.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(carouselItem.getId().intValue()))
            .andExpect(jsonPath("$.titulo").value(DEFAULT_TITULO))
            .andExpect(jsonPath("$.descripcion").value(DEFAULT_DESCRIPCION))
            .andExpect(jsonPath("$.orden").value(DEFAULT_ORDEN))
            .andExpect(jsonPath("$.activo").value(DEFAULT_ACTIVO));
    }

    @Test
    @Transactional
    void getNonExistingCarouselItem() throws Exception {
        // Get the carouselItem
        restCarouselItemMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCarouselItem() throws Exception {
        // Initialize the database
        insertedCarouselItem = carouselItemRepository.saveAndFlush(carouselItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the carouselItem
        CarouselItem updatedCarouselItem = carouselItemRepository.findById(carouselItem.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCarouselItem are not directly saved in db
        em.detach(updatedCarouselItem);
        updatedCarouselItem.titulo(UPDATED_TITULO).descripcion(UPDATED_DESCRIPCION).orden(UPDATED_ORDEN).activo(UPDATED_ACTIVO);
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(updatedCarouselItem);

        restCarouselItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, carouselItemDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isOk());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCarouselItemToMatchAllProperties(updatedCarouselItem);
    }

    @Test
    @Transactional
    void putNonExistingCarouselItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        carouselItem.setId(longCount.incrementAndGet());

        // Create the CarouselItem
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCarouselItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, carouselItemDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCarouselItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        carouselItem.setId(longCount.incrementAndGet());

        // Create the CarouselItem
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCarouselItemMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCarouselItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        carouselItem.setId(longCount.incrementAndGet());

        // Create the CarouselItem
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCarouselItemMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCarouselItemWithPatch() throws Exception {
        // Initialize the database
        insertedCarouselItem = carouselItemRepository.saveAndFlush(carouselItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the carouselItem using partial update
        CarouselItem partialUpdatedCarouselItem = new CarouselItem();
        partialUpdatedCarouselItem.setId(carouselItem.getId());

        partialUpdatedCarouselItem.orden(UPDATED_ORDEN);

        restCarouselItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCarouselItem.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCarouselItem))
            )
            .andExpect(status().isOk());

        // Validate the CarouselItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCarouselItemUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCarouselItem, carouselItem),
            getPersistedCarouselItem(carouselItem)
        );
    }

    @Test
    @Transactional
    void fullUpdateCarouselItemWithPatch() throws Exception {
        // Initialize the database
        insertedCarouselItem = carouselItemRepository.saveAndFlush(carouselItem);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the carouselItem using partial update
        CarouselItem partialUpdatedCarouselItem = new CarouselItem();
        partialUpdatedCarouselItem.setId(carouselItem.getId());

        partialUpdatedCarouselItem.titulo(UPDATED_TITULO).descripcion(UPDATED_DESCRIPCION).orden(UPDATED_ORDEN).activo(UPDATED_ACTIVO);

        restCarouselItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCarouselItem.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCarouselItem))
            )
            .andExpect(status().isOk());

        // Validate the CarouselItem in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCarouselItemUpdatableFieldsEquals(partialUpdatedCarouselItem, getPersistedCarouselItem(partialUpdatedCarouselItem));
    }

    @Test
    @Transactional
    void patchNonExistingCarouselItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        carouselItem.setId(longCount.incrementAndGet());

        // Create the CarouselItem
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCarouselItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, carouselItemDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCarouselItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        carouselItem.setId(longCount.incrementAndGet());

        // Create the CarouselItem
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCarouselItemMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCarouselItem() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        carouselItem.setId(longCount.incrementAndGet());

        // Create the CarouselItem
        CarouselItemDTO carouselItemDTO = carouselItemMapper.toDto(carouselItem);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCarouselItemMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(carouselItemDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CarouselItem in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCarouselItem() throws Exception {
        // Initialize the database
        insertedCarouselItem = carouselItemRepository.saveAndFlush(carouselItem);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the carouselItem
        restCarouselItemMockMvc
            .perform(delete(ENTITY_API_URL_ID, carouselItem.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return carouselItemRepository.count();
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

    protected CarouselItem getPersistedCarouselItem(CarouselItem carouselItem) {
        return carouselItemRepository.findById(carouselItem.getId()).orElseThrow();
    }

    protected void assertPersistedCarouselItemToMatchAllProperties(CarouselItem expectedCarouselItem) {
        assertCarouselItemAllPropertiesEquals(expectedCarouselItem, getPersistedCarouselItem(expectedCarouselItem));
    }

    protected void assertPersistedCarouselItemToMatchUpdatableProperties(CarouselItem expectedCarouselItem) {
        assertCarouselItemAllUpdatablePropertiesEquals(expectedCarouselItem, getPersistedCarouselItem(expectedCarouselItem));
    }
}
