// components/agenda/DayView.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiClock } from 'react-icons/fi';
import { AppointmentCard } from './AppointmentCard';
import { Skeleton } from '@/components/ui/skeleton';

interface DayViewProps {
  loading: boolean;
  appointments: any[];
  clients: any[];
  onComplete: (id: string) => void;
  onEdit: (appointment: any) => void;
  onDelete: (id: string) => void;
  processing: string | null;
  searchTerm: string;
}

export const DayView = ({
  loading,
  appointments,
  clients,
  onComplete,
  onEdit,
  onDelete,
  processing,
  searchTerm
}: DayViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamentos do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="inline-block bg-blue-50 p-4 rounded-full mb-4">
              <FiClock className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum agendamento para hoje
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm
                ? "Nenhum agendamento encontrado com o termo buscado"
                : "Você não possui agendamentos marcados para esta data."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                clients={clients}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                processing={processing}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};