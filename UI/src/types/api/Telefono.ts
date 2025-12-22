export interface TelefonoDTO {
    id?: number;
    numeroTel: string;
    activo: boolean;
}

export type NewTelefonoDTO = Omit<TelefonoDTO, 'id'> & { id?: null };
