# Sistema de Gestión Hotelera - HotelApp

## 1. Descripción General y Objetivo

Este proyecto es una aplicación web integral para la gestión de un hotel, desarrollada como respuesta al **Desafío Técnico: Sistema de Gestión Hotelera**. Fue construido por un equipo de desarrollo siguiendo estrictas especificaciones de arquitectura y diseño.
El sistema es robusto, seguro y escalable, utilizando **JHipster** para la infraestructura de backend y **React** para la interfaz de usuario.

El núcleo de la solución es una arquitectura basada en roles (RBAC) gestionada por **Keycloak**, donde la experiencia de usuario se adapta dinámicamente según si el usuario es un Administrador, un Empleado o un Cliente.

## 2. Stack Tecnológico

El proyecto cumple estrictamente con el stack tecnológico solicitado:

*   **Core/Backend**: Java + Spring Boot (Generado vía JHipster).
*   **Frontend**: React + Vite + Tailwind CSS.
*   **Seguridad**: Keycloak (OAuth2 / OIDC) para Gestión de Identidad y Acceso (IAM).
*   **Base de Datos**: PostgreSQL.
*   **Control de Versiones**: Git.
*   **Modelado**: JDL (JHipster Domain Language) - Archivo `hotel-entity.jdl` incluido en la raíz del backend.

## 3. Arquitectura y Diseño del Dominio

El modelo de dominio ha sido diseñado utilizando JDL para garantizar consistencia y generar el código base automáticamente.

### Entidades Principales
*   **Reserva**: Núcleo del negocio, vincula clientes con habitaciones.
*   **Habitacion**: Gestiona inventario, categorías y estados (Disponible, Ocupada, Mantenimiento).
*   **Cliente**: Información de huéspedes, vinculada a Keycloak para autenticación.
*   **Servicio**: Servicios adicionales (Spa, Tours, etc.) que pueden ser contratados y pagados.
*   **Factura/Pago**: Gestión financiera de las reservas.

### 3.1 Relaciones y Justificación de Diseño
El modelo se diseñó priorizando la integridad de los datos y la trazabilidad de las operaciones.

*   **Cliente 1:N Reserva**: Un cliente puede tener múltiples reservas históricas, pero cada reserva pertenece a un único cliente titular. Esto facilita el historial y programas de lealtad.
*   **Reserva 1:N ReservaDetalle**: Una reserva puede incluir múltiples habitaciones (ej. un grupo familiar). La entidad `ReservaDetalle` actúa como tabla pivote con atributos extra, permitiendo gestionar notas específicas por habitación dentro de un mismo "folio" de reserva.
*   **Habitacion N:1 Categoria/Estado**: Normalización de atributos repetitivos. Permite cambios globales de precios o reglas por categoría sin editar cada habitación individualmente.
*   **Reserva 1:N Pago**: Se permite pagos parciales o divididos (ej. anticipo y saldo final), proporcionando flexibilidad financiera.
*   **ServicioContratado**: Relación polimórfica conceptual que vincula `Servicio`, `Reserva`, `Cliente` y `Pago`. Permite auditar qué cliente pidió qué servicio, bajo qué reserva y si ya fue pagado, crucial para el balance final de la cuenta (Check-out).

### Roles y Seguridad (RBAC)
La seguridad está delegada a Keycloak. Se han configurado los siguientes roles:

| Role | Descripción y Responsabilidad | Funcionalidades (Scope) |
| :--- | :--- | :--- |
| **ROLE_ADMIN** | Administración Total | **Back-office**: Configuración del sistema, métricas globales, gestión de usuarios, auditoría y CRUD completo de entidades. |
| **ROLE_EMPLOYEE** | Operación Diaria (Staff) | **Front-desk**: Check-in/Check-out, asignación de habitaciones, contratación de servicios y atención de solicitudes. |
| **ROLE_CLIENT** | Autogestión (Usuario Final) | **Portal del Cliente**: Registro (Self-signup), visualización de reservas, historial de pagos y contratación de servicios. |

## 4. Guía de Ejecución (Paso a Paso)

### Prerrequisitos
*   Java 17+
*   Node.js 18+
*   Docker Desktop (corriendo)

### Paso 1: Ejecutar el Backend (Spring Boot + Servicios)
No es necesario levantar manualmente los contenedores de Docker (Base de datos y Keycloak) por separado. El proyecto está configurado para iniciar todo automáticamente.

Desde la carpeta `backend`, simplemente ejecuta:

```bash
./mvnw spring-boot:run
```

Este comando levantará la aplicación Backend y se encargará de iniciar los servicios necesarios (PostgreSQL, Keycloak) si no están corriendo.

El backend iniciará en `http://localhost:8081` (perfil 'dev').

> **Nota**: Al iniciar, también se levanta un contenedor de **Stripe CLI** que redirige automáticamente los eventos de pago a tu entorno local (`http://localhost:8081/api/stripe/webhook`), facilitando las pruebas de pagos sin herramientas externas.

### Paso 2: Ejecutar el Frontend (React)
En una nueva terminal, entra a la carpeta `UI` (o `frontend` dependiendo de tu estructura, aquí indicamos `UI` basado en lo anterior):

```bash
cd ../UI
npm install
npm run dev
```
El frontend iniciará en `http://localhost:5173`.

### Configuración de Stripe (Opcional si no se usa pagos)
Para que las funcionalidades de pago con Stripe funcionen correctamente en el backend, es necesario crear un archivo `.env` en la ruta `backend/.env`. Este archivo no se incluye en el repositorio por motivos de seguridad.

El contenido debe ser el siguiente (reemplazando con tus propias claves de prueba de Stripe):

```env
# Clave secreta para operaciones del servidor (Stripe Dashboard -> Developers -> API keys)
STRIPE_SECRET_KEY=sk_test_...

# Clave API general (Usualmente igual a la Secret Key en entornos de desarrollo)
STRIPE_API_KEY=sk_test_...

# Clave pública para el frontend (Stripe Dashboard -> Developers -> API keys)
STRIPE_PUBLIC_KEY=pk_test_...

# Secreto de firma para validar eventos (Stripe Dashboard -> Developers -> Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

Sin este archivo, la aplicación iniciará, pero las funciones relacionadas con pagos podrían fallar o lanzar errores en tiempo de ejecución.

## 5. Metodología y Trabajo en Equipo
El proyecto fue ejecutado simulando un entorno profesional de desarrollo, enfocándose en la colaboración técnica y la calidad del código.

*   **Diseño Guiado por Dominio (JDL)**: Se priorizó el modelado de datos utilizando JDL (JHipster Domain Language). Esto permitió validar relaciones (1:N, N:M) y reglas de negocio antes de la implementación.
*   **Control de Versiones (Git)**: Se utilizó un flujo de trabajo basado en ramas (Feature Branch Workflow) para integrar las contribuciones del equipo, manteniendo un historial de commits limpio y constante.
*   **Arquitectura Limpia**: Separación estricta entre el Frontend (Cliente) y Backend (API REST), comunicándose de manera segura vía tokens JWT/OIDC.

## 6. Credenciales de Prueba

El sistema viene precargado con usuarios para probar cada uno de los roles exigidos.
**Realm**: `jhipster` (Importado automáticamente).

| Rol | Usuario | Contraseña | Comentarios |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin` | Acceso total al Back-office. |
| **EMPLOYEE** | `employee` | `user` | Acceso a funciones de empleado (Front-desk). |
| **CLIENT** | `client` | `user` | Acceso al Portal del Cliente. |

Tambien existen usuarios clientes adicionales de prueba como `juan.perez` (password: `user`).

## 7. Datos de Prueba (Seed Data)
El proyecto utiliza **Liquibase** para la gestión evolutiva del esquema de base de datos.
La carga inicial de datos NO depende de archivos CSV externos o fakedata, sino que está definida explícitamente dentro de los scripts de migración (changelogs) de Liquibase.

El archivo principal que contiene estos datos es `config/liquibase/changelog/20251223000000_insert_initial_data.xml`.

Estos scripts aseguran que cada entorno despliegue con un conjunto consistente de:
*   **Inventario**: Habitaciones (con imágenes referenciadas), Categorías (Sencilla, Doble, Suite) y Estados.
*   **Operaciones**: Reservas de ejemplo y Servicios disponibles (Masajes, Tours, etc).
*   **Configuración**: Variables del sistema, secciones del Home Page y datos de contacto.
*   **Usuarios**: Perfiles de clientes vinculados a los usuarios de prueba.

## 8. Configuración de Keycloak
La configuración se realiza automáticamente vía Docker. El archivo de exportación del realm se encuentra en:
`backend/src/main/docker/realm-config/jhipster-realm.json`

Si necesitas acceder a la consola de administración de Keycloak:
*   URL: `http://localhost:9080/`
*   Usuario Admin de Keycloak: `admin`
*   Password Admin de Keycloak: `admin`

## 9. Capturas de Pantalla

### Vista Principal (Landing Page)
![alt text](capturas/image-1.png)

### Panel de Administración (Back-office)
![alt text](capturas/image-2.png)
![alt text](capturas/image-3.png)
![alt text](capturas/image-4.png)

### Vista del Empleado (Gestión de Reservas)
![alt text](capturas/image-5.png)
![alt text](capturas/image-6.png)

### Portal del Cliente (Mis Reservas)
![alt text](capturas/image-7.png)
---
**Entregables incluidos**:
*   [x] Código Fuente
*   [x] Archivo JDL (`backend/hotel-entity.jdl`)
*   [x] Configuración Keycloak (`jhipster-realm.json`)
*   [x] Documentación README

## 10. Equipo de Desarrollo
Egresados de Ingeniería en Sistemas de Información - **UNAN-León**

*   **Eduardo Alejandro González Moreno**
*   **Edgardo Melquizedec Ramos Flores**
*   **Yosseling Massiel Ney Mayorga**
*   **Byron David Sandoval González**
