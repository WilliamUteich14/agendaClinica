// components/agenda/SearchBar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiPlus, FiUser } from 'react-icons/fi';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNewAppointment: () => void;
}

export const SearchBar = ({
  searchTerm,
  onSearchChange,
  onNewAppointment
}: SearchBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar por paciente, procedimento ou horário..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Button onClick={onNewAppointment} className="flex items-center gap-2">
        <FiPlus size={18} />
        Novo Agendamento
      </Button>
    </div>
  );
};