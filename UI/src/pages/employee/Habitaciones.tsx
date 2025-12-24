import { HabitacionesList } from '../admin/Habitaciones';

export const EmployeeHabitaciones = () => {
    return <HabitacionesList canCreate={false} canDelete={false} canEdit={false} />;
};
