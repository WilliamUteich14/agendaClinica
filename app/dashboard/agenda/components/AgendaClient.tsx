// app/components/AgendaClient.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  format, addDays, subDays, isToday, isSameDay, parseISO, 
  startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, 
  endOfMonth, isSameMonth, addMonths, subMonths, addWeeks, 
  subWeeks, isSameWeek, isSameYear
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "react-hot-toast";

// Componentes
import { AgendaHeader } from "./AgendaHeader";
import { StatsCards } from "./StatsCards";
import { SearchBar } from "./SearchBar";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { AppointmentForm } from "./AppointmentForm";

// Tipos de dados
type ViewMode = "day" | "week" | "month";

interface Client {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Appointment {
  _id: string;
  date: string;
  time: string;
  title: string;
  completed?: boolean;
  clientId: string;
  clientName: string;
  value: number;
  note?: string;
  duration?: number;
}

const AgendaClient: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, revenue: 0 });
  const [processing, setProcessing] = useState<string | null>(null);

  // Funções de busca (mantidas como antes)
  const fetchClients = useCallback(async () => { /* ... */ }, []);
  const fetchAppointmentsForPeriod = useCallback(async (startDate: string, endDate: string) => { /* ... */ }, []);
  const fetchAppointmentsForDay = useCallback(async (dateStr: string) => { /* ... */ }, []);

  // Navegação
  const navigate = (direction: number) => {
    if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, direction));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, direction));
    } else if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, direction));
    }
  };

  // Formatar cabeçalho
  const getHeaderText = () => {
    if (viewMode === "day") {
      return format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR });
    } else if (viewMode === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      
      if (isSameMonth(start, end)) {
        return `${format(start, "d")} - ${format(end, "d 'de' MMMM", { locale: ptBR })}`;
      } else if (isSameYear(start, end)) {
        return `${format(start, "d 'de' MMM")} - ${format(end, "d 'de' MMM", { locale: ptBR })}`;
      } else {
        return `${format(start, "d 'de' MMM yyyy")} - ${format(end, "d 'de' MMM yyyy", { locale: ptBR })}`;
      }
    } else {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { /* ... */ };
  const handleDelete = async (id: string) => { /* ... */ };
  const handleComplete = async (id: string) => { /* ... */ };
  const openEditModal = (appt: Appointment) => { /* ... */ };

  // Efeitos (mantidos como antes)
  useEffect(() => { /* ... */ }, [currentDate, viewMode]);
  useEffect(() => { /* ... */ }, [viewMode]);

  return (
    <div className="w-full mx-auto p-4">
      <AgendaHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onNavigate={navigate}
        onToday={() => setCurrentDate(new Date())}
        onViewChange={setViewMode}
        headerText={getHeaderText()}
      />
      
      {viewMode === "day" && (
        <StatsCards stats={stats} />
      )}
      
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewAppointment={() => {
          setEditingAppointment(null);
          setOpenModal(true);
        }}
      />
      
      {viewMode === "day" && (
        <DayView
          loading={loading}
          appointments={filteredAppointments}
          clients={clients}
          onComplete={handleComplete}
          onEdit={openEditModal}
          onDelete={handleDelete}
          processing={processing}
          searchTerm={searchTerm}
        />
      )}
      
      {viewMode === "week" && (
        <WeekView
          loading={loading}
          currentDate={currentDate}
          allAppointments={allAppointments}
          onDayClick={(day) => {
            setCurrentDate(day);
            setViewMode("day");
          }}
        />
      )}
      
      {viewMode === "month" && (
        <MonthView
          loading={loading}
          currentDate={currentDate}
          allAppointments={allAppointments}
          onDayClick={(day) => {
            if (isSameMonth(day, currentDate)) {
              setCurrentDate(day);
              setViewMode("day");
            }
          }}
          onAppointmentClick={openEditModal}
        />
      )}
      
      <AppointmentForm
        open={openModal}
        onOpenChange={setOpenModal}
        editingAppointment={editingAppointment}
        clients={clients}
        currentDate={currentDate}
        allAppointments={allAppointments}
        onSubmit={handleSubmit}
        processing={processing}
      />
    </div>
  );
};

export default AgendaClient;