# Sistema de Notificaciones de Mensajería

## Descripción

Este sistema proporciona notificaciones en tiempo real para el sistema de mensajería del hotel. Las notificaciones se almacenan en caché y muestran alertas visuales y sonoras cuando llegan nuevos mensajes.

## Características

### 1. **Notificaciones en Caché**
- Las notificaciones se almacenan en `localStorage` para persistencia
- Se mantienen hasta 50 notificaciones recientes
- Se sincronizan automáticamente con el estado del usuario

### 2. **Alertas Visuales**
- **Panel de Notificaciones**: Icono de campana en el navbar con badge de conteo
- **Toast Notifications**: Alertas temporales en la esquina de la pantalla
- **Notificaciones del Navegador**: Notificaciones nativas del sistema (requiere permiso)

### 3. **Alertas Sonoras**
- Sonido suave generado con Web Audio API
- Se reproduce automáticamente al recibir mensajes nuevos
- No requiere archivos de audio externos

### 4. **Indicador de Mensajes Sin Leer**
- Badge en el menú "Soporte" del navbar
- Cuenta los mensajes sin leer según el rol:
  - **Cliente**: Mensajes de ADMINISTRATIVO y SISTEMA no leídos
  - **Admin/Empleado**: Mensajes de CLIENTE no leídos

## Componentes Principales

### `NotificationService`
Servicio singleton que maneja:
- Permisos de notificaciones del navegador
- Almacenamiento en caché (localStorage)
- Reproducción de sonidos
- Gestión del estado de lectura

**Ubicación**: `UI/src/services/notification.service.ts`

### `useMessageNotifications`
Hook de React que:
- Monitorea nuevos mensajes cada 5 segundos
- Crea notificaciones cuando llegan mensajes nuevos
- Gestiona el estado local de notificaciones
- Solicita permisos de notificación

**Ubicación**: `UI/src/hooks/useMessageNotifications.ts`

### `NotificationPanel`
Componente visual que:
- Muestra un dropdown con las notificaciones recientes
- Permite marcar como leídas o borrar notificaciones
- Navega a la página de soporte al hacer clic

**Ubicación**: `UI/src/components/layout/NotificationPanel.tsx`

### `useUnreadSupport`
Hook existente que:
- Cuenta mensajes sin leer para el badge en el menú
- Se actualiza cada 15 segundos
- Se usa en el Navbar

**Ubicación**: `UI/src/hooks/useUnreadSupport.ts`

## Flujo de Funcionamiento

### Para Clientes

1. Cliente recibe un mensaje de Admin/Sistema
2. `useMessageNotifications` detecta el nuevo mensaje
3. Se crea una notificación y se almacena en caché
4. Se muestra:
   - Toast notification con botón "Ver"
   - Notificación del navegador (si está permitido)
   - Badge en el panel de notificaciones
   - Badge en el menú "Soporte"
5. Se reproduce un sonido suave
6. Al hacer clic, navega a `/client/soporte`

### Para Admin/Empleados

1. Cliente envía un mensaje
2. `useMessageNotifications` detecta el nuevo mensaje
3. Se crea una notificación con el nombre del cliente
4. Se muestra:
   - Toast notification con botón "Ver"
   - Notificación del navegador (si está permitido)
   - Badge en el panel de notificaciones
   - Badge en el menú "Soporte"
5. Se reproduce un sonido suave
6. Al hacer clic, navega a `/employee/soporte` o `/admin/soporte`

## Integración en la Aplicación

### Navbar
El componente `Navbar` ha sido actualizado para incluir:
```tsx
{isAuthenticated && <NotificationPanel />}
```

Esto muestra el panel de notificaciones solo para usuarios autenticados.

### Sistema de Polling

- **Notificaciones**: Polling cada 5 segundos (`useMessageNotifications`)
- **Contador de Sin Leer**: Polling cada 15 segundos (`useUnreadSupport`)
- **Chat Cliente**: Polling cada 5 segundos (`useClientChat`)
- **Chat Admin**: Polling cada 10 segundos (`useAdminChat`)

## Personalización

### Cambiar el Sonido
Editar `NotificationService.playNotificationSound()`:
```typescript
oscillator.frequency.value = 800; // Frecuencia del tono
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volumen
```

### Cambiar Intervalo de Polling
Editar `useMessageNotifications.ts`:
```typescript
const interval = setInterval(checkForNewMessages, 5000); // 5000ms = 5 segundos
```

### Cambiar Límite de Notificaciones en Caché
Editar `notification.service.ts`:
```typescript
const MAX_CACHED_NOTIFICATIONS = 50; // Número máximo de notificaciones
```

## Permisos del Navegador

Las notificaciones del navegador requieren permiso del usuario. El sistema:
1. Solicita permiso automáticamente al iniciar sesión
2. Si el usuario rechaza, solo muestra toast notifications
3. El permiso se puede cambiar en la configuración del navegador

## Compatibilidad

- ✅ Chrome/Edge: Soporte completo
- ✅ Firefox: Soporte completo
- ✅ Safari: Soporte completo (puede requerir permisos adicionales)
- ✅ Navegadores móviles: Toast notifications (notificaciones nativas limitadas)

## Próximas Mejoras

- [ ] Agrupar notificaciones por conversación
- [ ] Configuración de sonido On/Off
- [ ] Notificaciones push (PWA)
- [ ] Filtros de notificaciones por tipo
- [ ] Historial de notificaciones archivadas

## Troubleshooting

### Las notificaciones no suenan
- Verificar que el navegador no esté silenciado
- Verificar permisos de audio del sitio

### Las notificaciones del navegador no aparecen
- Verificar permisos en configuración del navegador
- En Chrome: `chrome://settings/content/notifications`
- En Firefox: `about:preferences#privacy`

### El contador no se actualiza
- Verificar que el polling esté activo (consola de desarrollador)
- Verificar que el usuario esté autenticado
- Verificar conexión con el backend

## Archivos Modificados

- ✅ `UI/src/services/notification.service.ts` (NUEVO)
- ✅ `UI/src/hooks/useMessageNotifications.ts` (NUEVO)
- ✅ `UI/src/components/layout/NotificationPanel.tsx` (NUEVO)
- ✅ `UI/src/components/layout/Navbar.tsx` (MODIFICADO)
- ✅ `UI/src/hooks/useUnreadSupport.ts` (EXISTENTE - Sin cambios)

---

**Desarrollado para**: Hotel Management System  
**Rama**: `feature/notificaciones-mensajeria`  
**Fecha**: Diciembre 2024
