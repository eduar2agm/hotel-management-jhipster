---
description: Mejoras en disponibilidad de servicios
---

# Plan de Implementación: Mejoras en Disponibilidad y Contratación de Servicios

## Objetivo
Mejorar la experiencia del cliente al contratar servicios mostrando:
- Información detallada del servicio (días disponibles, horarios)
- Sistema de selección de días/horas con verificación de cupos
- Integración con reservas del cliente para sugerir disponibilidad

## Fases de Implementación

### Fase 1: Backend - Endpoint de Disponibilidad con Cupos

#### 1.1 Crear DTO para disponibilidad con cupos
**Archivo**: `backend/src/main/java/com/hotel/app/service/dto/ServicioDisponibilidadConCuposDTO.java`

Este DTO extenderá ServicioDisponibilidadDTO e incluirá:
- `cupoDisponible`: cupos restantes para ese día/hora
- `reservasActivas`: cantidad de reservas activas en ese slot

#### 1.2 Crear Repository Query
**Archivo**: `backend/src/main/java/com/hotel/app/repository/ServicioContratadoRepository.java`

Agregar método para contar servicios contratados por día/hora:
```java
Long countByServicioIdAndFechaServicioBetweenAndEstadoNot(
    Long servicioId, 
    Instant start, 
    Instant end, 
    EstadoServicioContratado estado
);
```

#### 1.3 Crear Servicio de Disponibilidad
**Archivo**: `backend/src/main/java/com/hotel/app/service/impl/ServicioDisponibilidadServiceImpl.java`

Agregar método:
```java
List<ServicioDisponibilidadConCuposDTO> findDisponibilidadConCupos(
    Long servicioId, 
    LocalDate fechaInicio, 
    LocalDate fechaFin
);
```

#### 1.4 Crear Endpoint REST
**Archivo**: `backend/src/main/java/com/hotel/app/web/rest/ServicioDisponibilidadResource.java`

Agregar endpoint:
```
GET /api/servicio-disponibilidads/servicio/{id}/cupos?fechaInicio=&fechaFin=
```

### Fase 2: Backend - Validación de Disponibilidad

#### 2.1 Validar cupos al contratar servicio
**Archivo**: `backend/src/main/java/com/hotel/app/service/impl/ServicioContratadoServiceImpl.java`

En el método `save()`:
1. Verificar que la fecha/hora del servicio esté dentro del horario configurado
2. Verificar que haya cupos disponibles
3. Lanzar excepción si no hay disponibilidad

### Fase 3: Frontend - Componente de Información del Servicio

#### 3.1 Crear componente ServiceInfoCard
**Archivo**: `UI/src/components/services/ServiceInfoCard.tsx`

Componente que muestra:
- Imagen del servicio
- Descripción completa
- Lista de días disponibles con iconos
- Horarios de atención
- Precio
- Botón "Contratar"

#### 3.2 Crear componente ServiceAvailabilityBadges
**Archivo**: `UI/src/components/services/ServiceAvailabilityBadges.tsx`

Muestra badges con los días de la semana disponibles.

### Fase 4: Frontend - Selector Inteligente de Horarios

#### 4.1 Crear componente ServiceScheduleSelector
**Archivo**: `UI/src/components/services/ServiceScheduleSelector.tsx`

Características:
- Recibe: servicio, reserva del cliente, disponibilidades
- Calcula: días válidos según la reserva del cliente
- Muestra: calendario interactivo con días habilitados/deshabilitados
- Permite: selección de día y hora
- Verifica: cupos disponibles en tiempo real

#### 4.2 Crear hook useServiceAvailability
**Archivo**: `UI/src/hooks/useServiceAvailability.ts`

Hook personalizado que:
- Carga disponibilidades del servicio
- Calcula cupos disponibles
- Filtra por fechas de la reserva del cliente
- Retorna slots disponibles

### Fase 5: Frontend - Integración en Servicios.tsx

#### 5.1 Agregar modal de información
Modificar `UI/src/pages/client/Servicios.tsx`:
- Agregar estado para "ver más información"
- Mostrar dialog con ServiceInfoCard
- Incluir ServiceAvailabilityBadges

#### 5.2 Mejorar modal de contratación
Reemplazar inputs simples de fecha/hora con:
- ServiceScheduleSelector
- Lógica de validación basada en reserva
- Mensajes informativos sobre disponibilidad

### Fase 6: Frontend - Mejoras UX

#### 6.1 Agregar indicadores visuales
- Badge "Disponible hoy" si el servicio está disponible
- Badge "Cupos limitados" si quedan menos de 3 cupos
- Badge "Agotado" si no hay cupos

#### 6.2 Agregar tooltips informativos
- Explicar por qué ciertos días están deshabilitados
- Mostrar cupos restantes al hover

## Orden de Implementación Sugerido

1. **Backend - Fase 1**: Endpoint de disponibilidad con cupos
2. **Backend - Fase 2**: Validación de disponibilidad
3. **Frontend - Fase 3**: Componentes de información
4. **Frontend - Fase 4**: Selector de horarios
5. **Frontend - Fase 5**: Integración
6. **Frontend - Fase 6**: Mejoras UX

## Estructura Final

```
Backend:
- ServicioDisponibilidadConCuposDTO (nuevo)
- ServicioContratadoRepository (modificado)
- ServicioDisponibilidadServiceImpl (modificado)
- ServicioDisponibilidadResource (modificado)
- ServicioContratadoServiceImpl (modificado con validación)

Frontend:
- ServiceInfoCard.tsx (nuevo)
- ServiceAvailabilityBadges.tsx (nuevo)
- ServiceScheduleSelector.tsx (nuevo)
- useServiceAvailability.ts (nuevo)
- Servicios.tsx (modificado)
```

## Notas Técnicas

- El cálculo de cupos debe considerar servicios en estado PENDIENTE y CONFIRMADO
- Los servicios CANCELADO no deben contarse
- La validación debe ser tanto en frontend (UX) como backend (seguridad)
- Considerar time zones al comparar fechas/horas
- Cachear disponibilidades para mejorar performance
