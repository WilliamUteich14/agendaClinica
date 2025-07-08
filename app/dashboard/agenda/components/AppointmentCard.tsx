'use client';

import { Button } from '@/components/ui/button';
import { FiCheck, FiEdit, FiTrash, FiUser, FiDollarSign, FiInfo, FiClock, FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface AppointmentCardProps {
  appointment: any;
  clients: any[];
  onComplete: (id: string) => void;
  onEdit: (appointment: any) => void;
  onDelete: (id: string) => void;
  processing: string | null;
}

export const AppointmentCard = ({
  appointment,
  clients,
  onComplete,
  onEdit,
  onDelete,
  processing
}: AppointmentCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row gap-4 p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${appointment.completed ? "bg-green-100" : "bg-blue-100"}`}>
            <FiClock className={appointment.completed ? "text-green-600" : "text-blue-600"} size={20} />
          </div>
          
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {appointment.clientName}
              </h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {appointment.time} - {(() => {
                  const start = new Date(`${appointment.date}T${appointment.time}:00`);
                  const end = new Date(start.getTime() + (appointment.duration || 60) * 60000);
                  return end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                })()}
              </span>
            </div>
            
            <p className="text-gray-700 mt-1">
              {appointment.title}
            </p>
            
            {appointment.note && (
              <div className="flex items-start gap-2 mt-2">
                <FiInfo className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                <p className="text-gray-600 text-sm italic">{appointment.note}</p>
              </div>
            )}
            
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <FiUser size={14} />
                <span>{clients.find(c => c._id === appointment.clientId)?.phone || "Sem telefone"}</span>
              </div>
              
              <div className="flex items-center gap-1 text-sm font-medium text-amber-700">
                <FiDollarSign size={14} />
                <span>R$ {Number(appointment.value).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex sm:flex-col gap-2 sm:w-32 justify-end">
        <Button
          onClick={() => onComplete(appointment._id)}
          disabled={appointment.completed || processing === `complete-${appointment._id}`}
          variant={appointment.completed ? 'secondary' : 'default'}
          className="flex items-center gap-1"
        >
          {processing === `complete-${appointment._id}` ? (
            <FiLoader className="animate-spin" size={14} />
          ) : (
            <FiCheck size={14} />
          )}
          {appointment.completed ? "Concluído" : "Concluir"}
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(appointment)}
            disabled={processing === `edit-${appointment._id}`}
            variant="default"
            className="flex items-center gap-1"
          >
            {processing === `edit-${appointment._id}` ? (
              <FiLoader className="animate-spin" size={14} />
            ) : (
              <FiEdit size={14} />
            )}
            Editar
          </Button>
          
          <Button
            onClick={() => onDelete(appointment._id)}
            disabled={processing === `delete-${appointment._id}`}
            variant="destructive"
            className="flex items-center gap-1"
          >
            {processing === `delete-${appointment._id}` ? (
              <FiLoader className="animate-spin" size={14} />
            ) : (
              <FiTrash size={14} />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};