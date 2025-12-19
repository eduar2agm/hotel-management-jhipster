package com.hotel.app.repository;

import com.hotel.app.domain.CarouselItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the CarouselItem entity.
 */
@Repository
public interface CarouselItemRepository extends JpaRepository<CarouselItem, Long> {
    default Optional<CarouselItem> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<CarouselItem> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<CarouselItem> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select carouselItem from CarouselItem carouselItem left join fetch carouselItem.imagen left join fetch carouselItem.configuracion",
        countQuery = "select count(carouselItem) from CarouselItem carouselItem"
    )
    Page<CarouselItem> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select carouselItem from CarouselItem carouselItem left join fetch carouselItem.imagen left join fetch carouselItem.configuracion"
    )
    List<CarouselItem> findAllWithToOneRelationships();

    @Query(
        "select carouselItem from CarouselItem carouselItem left join fetch carouselItem.imagen left join fetch carouselItem.configuracion where carouselItem.id =:id"
    )
    Optional<CarouselItem> findOneWithToOneRelationships(@Param("id") Long id);
}
