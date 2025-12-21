export const TipoIdentificacion = {
    DNI: 'DNI',
    PASAPORTE: 'PASAPORTE',
    RUC: 'RUC',
    CEDULA: 'CEDULA',
    PASAPORTE_EXT: 'PASAPORTE_EXT',
    CEDULA_RESIDENCIA: 'CEDULA_RESIDENCIA',
    INSS: 'INSS'
} as const;
export type TipoIdentificacion = typeof TipoIdentificacion[keyof typeof TipoIdentificacion];

export const EstadoReserva = {
    PENDIENTE: 'PENDIENTE',
    CONFIRMADA: 'CONFIRMADA',
    CANCELADA: 'CANCELADA',
    FINALIZADA: 'FINALIZADA'
} as const;
export type EstadoReserva = typeof EstadoReserva[keyof typeof EstadoReserva];

export const EstadoCheckInCheckOut = {
    PENDIENTE: 'PENDIENTE',
    REALIZADO: 'REALIZADO',
    RETRASADO: 'RETRASADO'
} as const;
export type EstadoCheckInCheckOut = typeof EstadoCheckInCheckOut[keyof typeof EstadoCheckInCheckOut];

export const MetodoPago = {
    TARJETA: 'TARJETA',
    EFECTIVO: 'EFECTIVO'
} as const;
export type MetodoPago = typeof MetodoPago[keyof typeof MetodoPago];

export const EstadoPago = {
    PENDIENTE: 'PENDIENTE',
    COMPLETADO: 'COMPLETADO',
    RECHAZADO: 'RECHAZADO',
    REEMBOLSADO: 'REEMBOLSADO'
} as const;
export type EstadoPago = typeof EstadoPago[keyof typeof EstadoPago];

export const CategoriaHabitacionNombre = {
    SENCILLA: 'SENCILLA',
    DOBLE: 'DOBLE',
    SUITE: 'SUITE'
} as const;
export type CategoriaHabitacionNombre = typeof CategoriaHabitacionNombre[keyof typeof CategoriaHabitacionNombre];

export const EstadoHabitacionNombre = {
    DISPONIBLE: 'DISPONIBLE',
    OCUPADA: 'OCUPADA',
    MANTENIMIENTO: 'MANTENIMIENTO',
    LIMPIEZA: 'LIMPIEZA'
} as const;
export type EstadoHabitacionNombre = typeof EstadoHabitacionNombre[keyof typeof EstadoHabitacionNombre];

export const Remitente = {
    CLIENTE: 'CLIENTE',
    ADMINISTRATIVO: 'ADMINISTRATIVO',
    SISTEMA: 'SISTEMA'
} as const;
export type Remitente = typeof Remitente[keyof typeof Remitente];

export const DiaSemana = {
    LUNES: 'LUNES',
    MARTES: 'MARTES',
    MIERCOLES: 'MIERCOLES',
    JUEVES: 'JUEVES',
    VIERNES: 'VIERNES',
    SABADO: 'SABADO',
    DOMINGO: 'DOMINGO'
} as const;
export type DiaSemana = typeof DiaSemana[keyof typeof DiaSemana];
