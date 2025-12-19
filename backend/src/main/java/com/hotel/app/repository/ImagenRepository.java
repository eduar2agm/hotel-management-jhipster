package com.hotel.app.repository;

import com.hotel.app.domain.Imagen;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Imagen entity.
 */
@Repository
public interface ImagenRepository extends JpaRepository<Imagen, Long> {
    default Optional<Imagen> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Imagen> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Imagen> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select imagen from Imagen imagen left join fetch imagen.habitacion left join fetch imagen.servicio",
        countQuery = "select count(imagen) from Imagen imagen"
    )
    Page<Imagen> findAllWithToOneRelationships(Pageable pageable);

    @Query("select imagen from Imagen imagen left join fetch imagen.habitacion left join fetch imagen.servicio")
    List<Imagen> findAllWithToOneRelationships();

    @Query("select imagen from Imagen imagen left join fetch imagen.habitacion left join fetch imagen.servicio where imagen.id =:id")
    Optional<Imagen> findOneWithToOneRelationships(@Param("id") Long id);
}
