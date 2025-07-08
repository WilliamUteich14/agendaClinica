'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FiCheck, FiEdit, FiLoader, FiPlus, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAppointment: any;
  clients: any[];
  currentDate: Date;
  allAppointments: any[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  processing: string | null;
}

export const AppointmentForm = ({
  open,
  onOpenChange,
  editingAppointment,
  clients,
  currentDate,
  allAppointments,
  onSubmit,
  processing
}: AppointmentFormProps) => {

  const generateTimeSlots = () => {
    const slots = [];
    const dateForSlots = editingAppointment?.date || format(currentDate, "yyyy-MM-dd");
    const bookedAppointments = allAppointments.filter(a => a.date === dateForSlots);
    
    for (let h = 7; h <= 22; h++) {
      for (let m = 0; m < 60; m += 15) {
        const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        const slotStart = new Date(`${dateForSlots}T${time}:00`);
        
        let available = true;
        
        for (const appt of bookedAppointments) {
          if (editingAppointment && appt._id === editingAppointment._id) continue;
          
          const apptStart = new Date(`${appt.date}T${appt.time}:00`);
          const apptEnd = new Date(apptStart.getTime() + (appt.duration || 60) * 60000);
          
          if (slotStart >= apptStart && slotStart < apptEnd) {
            available = false;
            break;
          }
        }
        
        slots.push({ time, available });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={editingAppointment?.date || format(currentDate, "yyyy-MM-dd")}
              min={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Select name="time" required defaultValue={editingAppointment?.time || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um horário" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem 
                    key={slot.time} 
                    value={slot.time}
                    disabled={!slot.available && !editingAppointment}
                  >
                    {slot.time} {!slot.available && !editingAppointment && "(Ocupado)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientId">Paciente</Label>
            <Select name="clientId" required defaultValue={editingAppointment?.clientId || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client._id} value={client._id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Procedimento</Label>
            <Input 
              id="title"
              name="title" 
              required 
              defaultValue={editingAppointment?.title || ""}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input 
                id="value"
                name="value" 
                type="number" 
                step="0.01" 
                required 
                defaultValue={editingAppointment?.value || ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select 
                name="duration"
                defaultValue={editingAppointment?.duration?.toString() || "60"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a duração" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Observação</Label>
            <Textarea 
              id="note"
              name="note" 
              defaultValue={editingAppointment?.note || ""}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={processing === "create" || processing === "edit"}
            >
              {processing === "create" || processing === "edit" ? (
                <FiLoader className="animate-spin mr-2" />
              ) : null}
              {editingAppointment ? "Atualizar" : "Agendar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};