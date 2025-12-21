package com.hotel.app.web.rest;

import com.hotel.app.repository.CarouselItemRepository;
import com.hotel.app.service.CarouselItemService;
import com.hotel.app.service.dto.CarouselItemDTO;
import com.hotel.app.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.hotel.app.domain.CarouselItem}.
 */
@RestController
@RequestMapping("/api/carousel-items")
public class CarouselItemResource {

    private static final Logger LOG = LoggerFactory.getLogger(CarouselItemResource.class);

    private static final String ENTITY_NAME = "hotelAppCarouselItem";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CarouselItemService carouselItemService;

    private final CarouselItemRepository carouselItemRepository;

    public CarouselItemResource(CarouselItemService carouselItemService, CarouselItemRepository carouselItemRepository) {
        this.carouselItemService = carouselItemService;
        this.carouselItemRepository = carouselItemRepository;
    }

    /**
     * {@code POST  /carousel-items} : Create a new carouselItem.
     *
     * @param carouselItemDTO the carouselItemDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new carouselItemDTO, or with status {@code 400 (Bad Request)} if the carouselItem has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CarouselItemDTO> createCarouselItem(@Valid @RequestBody CarouselItemDTO carouselItemDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save CarouselItem : {}", carouselItemDTO);
        if (carouselItemDTO.getId() != null) {
            throw new BadRequestAlertException("A new carouselItem cannot already have an ID", ENTITY_NAME, "idexists");
        }
        carouselItemDTO = carouselItemService.save(carouselItemDTO);
        return ResponseEntity.created(new URI("/api/carousel-items/" + carouselItemDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, carouselItemDTO.getId().toString()))
            .body(carouselItemDTO);
    }

    /**
     * {@code PUT  /carousel-items/:id} : Updates an existing carouselItem.
     *
     * @param id the id of the carouselItemDTO to save.
     * @param carouselItemDTO the carouselItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated carouselItemDTO,
     * or with status {@code 400 (Bad Request)} if the carouselItemDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the carouselItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CarouselItemDTO> updateCarouselItem(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CarouselItemDTO carouselItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CarouselItem : {}, {}", id, carouselItemDTO);
        if (carouselItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, carouselItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!carouselItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        carouselItemDTO = carouselItemService.update(carouselItemDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, carouselItemDTO.getId().toString()))
            .body(carouselItemDTO);
    }

    /**
     * {@code PATCH  /carousel-items/:id} : Partial updates given fields of an existing carouselItem, field will ignore if it is null
     *
     * @param id the id of the carouselItemDTO to save.
     * @param carouselItemDTO the carouselItemDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated carouselItemDTO,
     * or with status {@code 400 (Bad Request)} if the carouselItemDTO is not valid,
     * or with status {@code 404 (Not Found)} if the carouselItemDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the carouselItemDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CarouselItemDTO> partialUpdateCarouselItem(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CarouselItemDTO carouselItemDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CarouselItem partially : {}, {}", id, carouselItemDTO);
        if (carouselItemDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, carouselItemDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!carouselItemRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CarouselItemDTO> result = carouselItemService.partialUpdate(carouselItemDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, carouselItemDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /carousel-items} : get all the carouselItems.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of carouselItems in body.
     */
    @GetMapping("")
    public ResponseEntity<List<CarouselItemDTO>> getAllCarouselItems(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of CarouselItems");
        Page<CarouselItemDTO> page;
        if (eagerload) {
            page = carouselItemService.findAllWithEagerRelationships(pageable);
        } else {
            page = carouselItemService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /carousel-items/:id} : get the "id" carouselItem.
     *
     * @param id the id of the carouselItemDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the carouselItemDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CarouselItemDTO> getCarouselItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CarouselItem : {}", id);
        Optional<CarouselItemDTO> carouselItemDTO = carouselItemService.findOne(id);
        return ResponseUtil.wrapOrNotFound(carouselItemDTO);
    }

    /**
     * {@code DELETE  /carousel-items/:id} : delete the "id" carouselItem.
     *
     * @param id the id of the carouselItemDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCarouselItem(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CarouselItem : {}", id);
        carouselItemService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
