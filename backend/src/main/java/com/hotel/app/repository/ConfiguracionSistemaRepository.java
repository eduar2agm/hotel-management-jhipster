package com.hotel.app.repository;

import com.hotel.app.domain.ConfiguracionSistema;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ConfiguracionSistema entity.
 */
@Repository
public interface ConfiguracionSistemaRepository extends JpaRepository<ConfiguracionSistema, Long> {
    default Optional<ConfiguracionSistema> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ConfiguracionSistema> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ConfiguracionSistema> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(value = "select configuracionSistema from ConfiguracionSistema configuracionSistema left join fetch configuracionSistema.imagen", countQuery = "select count(configuracionSistema) from ConfiguracionSistema configuracionSistema")
    Page<ConfiguracionSistema> findAllWithToOneRelationships(Pageable pageable);

    @Query("select configuracionSistema from ConfiguracionSistema configuracionSistema left join fetch configuracionSistema.imagen")
    List<ConfiguracionSistema> findAllWithToOneRelationships();

    @Query("select configuracionSistema from ConfiguracionSistema configuracionSistema left join fetch configuracionSistema.imagen where configuracionSistema.id =:id")
    Optional<ConfiguracionSistema> findOneWithToOneRelationships(@Param("id") Long id);

    Optional<ConfiguracionSistema> findByClave(String clave);
}
