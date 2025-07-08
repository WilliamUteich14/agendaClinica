// app/components/AgendaClient.tsx
"use client";

import React, { useState, useEffect, FormEvent, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { format, addDays, subDays, isToday, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FiChevronLeft, FiChevronRight, FiPlus, FiCheck, FiEdit, FiTrash, FiUser, FiClock, FiDollarSign, FiInfo, FiCalendar, FiLoader } from "react-icons/fi";
import { toast } from "react-hot-toast";

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
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  title: string;
  completed?: boolean;
  clientId: string;
  clientName: string;
  value: number;
  note?: string;
  duration?: number; // duração em minutos
}

const AgendaClient: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, completed: 0, revenue: 0 });
  const [processing, setProcessing] = useState<string | null>(null);

  // Buscar clientes
  const fetchClients = useCallback(async () => {
    try {
      const res = await fetch("/api/agendamento/clients");
      if (res.ok) {
        const data: Client[] = await res.json();
        setClients(data);
      }
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    }
  }, []);

  // Buscar agendamentos
  const fetchAppointments = useCallback(async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agendamento/agenda?date=${dateStr}`);
      if (res.ok) {
        const data: Appointment[] = await res.json();
        setAppointments(data);
        
        // Calcular estatísticas
        const completed = data.filter(a => a.completed).length;
        const revenue = data.reduce((sum, appt) => sum + appt.value, 0);
        setStats({
          total: data.length,
          completed,
          revenue
        });
      }
    } catch (error) {
      toast.error("Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  // Navegar entre datas
  const navigateDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  // Filtrar agendamentos por termo de busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredAppointments(appointments);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = appointments.filter(appt => 
      appt.clientName.toLowerCase().includes(term) || 
      appt.title.toLowerCase().includes(term) ||
      (appt.note && appt.note.toLowerCase().includes(term)) ||
      appt.time.includes(term)
    );
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm]);

  // Buscar dados iniciais
  useEffect(() => {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    fetchAppointments(dateStr);
    fetchClients();
  }, [currentDate, fetchAppointments, fetchClients]);

  // Criar/Editar agendamento
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(editingAppointment ? "edit" : "create");
    
    const form = e.currentTarget;
    const fd = new FormData(form);
    
    // Usar a data do formulário, não a data atual
    const date = fd.get("date") as string;
    const time = fd.get("time") as string;
    const title = fd.get("title") as string;
    const clientId = fd.get("clientId") as string;
    const value = parseFloat(fd.get("value") as string);
    const note = fd.get("note") as string | null;
    const duration = parseInt(fd.get("duration") as string) || 60;
    
    const client = clients.find(c => c._id === clientId);
    if (!client) {
      toast.error("Cliente não encontrado");
      setProcessing(null);
      return;
    }
    
    const url = editingAppointment 
      ? `/api/agendamento/agenda/${editingAppointment._id}`
      : "/api/agendamento/agenda";
    
    const method = editingAppointment ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date, 
          time, 
          title, 
          clientId, 
          clientName: client.name, 
          value, 
          note,
          duration
        }),
      });
      
      if (res.ok) {
        // Atualizar a lista de agendamentos para a data do agendamento criado/editado
        const newDate = date ? date : format(currentDate, "yyyy-MM-dd");
        fetchAppointments(newDate);
        setOpenModal(false);
        setEditingAppointment(null);
        toast.success(editingAppointment ? "Agendamento atualizado!" : "Agendamento criado!");
      } else {
        const errorText = await res.text();
        toast.error(errorText || "Erro ao salvar agendamento");
      }
    } catch (error) {
      toast.error("Erro de conexão");
    } finally {
      setProcessing(null);
    }
  };

  // Excluir agendamento
  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;
    setProcessing(`delete-${id}`);
    
    try {
      const res = await fetch(`/api/agendamento/agenda/${id}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        fetchAppointments(dateStr);
        toast.success("Agendamento excluído!");
      } else {
        toast.error("Erro ao excluir agendamento");
      }
    } catch (error) {
      toast.error("Erro de conexão");
    } finally {
      setProcessing(null);
    }
  };

  // Marcar como concluído
  const handleComplete = async (id: string) => {
    setProcessing(`complete-${id}`);
    
    try {
      const res = await fetch(`/api/agendamento/agenda/${id}/complete`, { 
        method: "PATCH" 
      });
      
      if (res.ok) {
        const dateStr = format(currentDate, "yyyy-MM-dd");
        fetchAppointments(dateStr);
        toast.success("Agendamento concluído!");
      } else {
        toast.error("Erro ao concluir agendamento");
      }
    } catch (error) {
      toast.error("Erro de conexão");
    } finally {
      setProcessing(null);
    }
  };

  // Abrir modal de edição
  const openEditModal = (appt: Appointment) => {
    setEditingAppointment(appt);
    setOpenModal(true);
  };

  // Gerar slots de horário disponíveis para uma data específica
  const generateTimeSlots = useMemo(() => {
    const slots = [];
    // Filtrar agendamentos apenas para a data específica
    const dateForSlots = editingAppointment?.date || format(currentDate, "yyyy-MM-dd");
    const bookedTimes = appointments.filter(a => a.date === dateForSlots).map(a => a.time);
    
    // Gerar horários das 07:00 às 22:00, a cada 15 minutos
    for (let h = 7; h <= 22; h++) {
      for (let m = 0; m < 60; m += 15) {
        const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        // Verificar se o horário está ocupado
        const available = !bookedTimes.includes(time);
        slots.push({ time, available });
      }
    }
    
    return slots;
  }, [appointments, currentDate, editingAppointment]);

  const formattedDate = formatDate(currentDate);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header e Estatísticas */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Agenda de Atendimentos</h1>
            <div className="flex items-center gap-3 mt-2">
              <button 
                onClick={() => navigateDate(-1)}
                className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <FiChevronLeft size={18} />
              </button>
              
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {formattedDate}
                </p>
                <p className="text-sm text-gray-500">
                  {format(currentDate, "dd/MM/yyyy")}
                </p>
              </div>
              
              <button 
                onClick={() => navigateDate(1)}
                className="p-2 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <FiChevronRight size={18} />
              </button>
              
              <button
                onClick={() => setCurrentDate(new Date())}
                className={`px-3 py-1 text-sm rounded-md ${
                  isToday(currentDate) 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Hoje
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewMode === "day" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiClock size={16} /> Dia
            </button>
            
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewMode === "week" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiClock size={16} /> Semana
            </button>
            
            <button
              onClick={() => setViewMode("month")}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                viewMode === "month" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              <FiClock size={16} /> Mês
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiClock className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total de Agendamentos</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheck className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Concluídos</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.completed} <span className="text-sm font-normal">({stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%)</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <FiDollarSign className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Receita Prevista</h3>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {stats.revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barra de pesquisa e ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar por paciente, procedimento ou horário..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <button
          onClick={() => {
            setEditingAppointment(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <FiPlus size={18} />
          Novo Agendamento
        </button>
      </div>
      
      {/* Lista de agendamentos */}
      {viewMode === "day" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Carregando agendamentos...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
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
                  : "Você não possui agendamentos marcados para esta data. Clique no botão acima para criar um novo."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredAppointments.map((appt) => (
                <motion.div
                  key={appt._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${appt.completed ? "bg-green-100" : "bg-blue-100"}`}>
                        <FiClock className={appt.completed ? "text-green-600" : "text-blue-600"} size={20} />
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-baseline gap-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {appt.clientName}
                          </h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {appt.time}
                          </span>
                        </div>
                        
                        <p className="text-gray-700 mt-1">
                          {appt.title}
                        </p>
                        
                        {appt.note && (
                          <div className="flex items-start gap-2 mt-2">
                            <FiInfo className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
                            <p className="text-gray-600 text-sm italic">{appt.note}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FiUser size={14} />
                            <span>{clients.find(c => c._id === appt.clientId)?.phone || "Sem telefone"}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm font-medium text-amber-700">
                            <FiDollarSign size={14} />
                            <span>R$ {Number(appt.value).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex sm:flex-col gap-2 sm:w-32 justify-end">
                    <button
                      onClick={() => handleComplete(appt._id)}
                      disabled={appt.completed || processing === `complete-${appt._id}`}
                      className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md ${
                        appt.completed 
                          ? "bg-green-100 text-green-800" 
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {processing === `complete-${appt._id}` ? (
                        <FiLoader className="animate-spin" size={14} />
                      ) : (
                        <FiCheck size={14} />
                      )}
                      {appt.completed ? "Concluído" : "Concluir"}
                    </button>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(appt)}
                        disabled={processing === `edit-${appt._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {processing === `edit-${appt._id}` ? (
                          <FiLoader className="animate-spin" size={14} />
                        ) : (
                          <FiEdit size={14} />
                        )}
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleDelete(appt._id)}
                        disabled={processing === `delete-${appt._id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-red-100 hover:bg-red-200 text-red-700"
                      >
                        {processing === `delete-${appt._id}` ? (
                          <FiLoader className="animate-spin" size={14} />
                        ) : (
                          <FiTrash size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Visualizações futuras */}
      {viewMode === "week" && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-8 text-center">
          <div className="inline-block bg-indigo-100 p-4 rounded-full mb-4">
            <FiClock className="text-indigo-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Visualização Semanal
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Estamos trabalhando para trazer uma visualização semanal completa da sua agenda. Em breve você poderá ver todos os seus compromissos da semana em uma única visualização.
          </p>
        </div>
      )}
      
      {viewMode === "month" && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-8 text-center">
          <div className="inline-block bg-amber-100 p-4 rounded-full mb-4">
            <FiClock className="text-amber-600" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Visualização Mensal
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Estamos desenvolvendo uma visualização mensal completa para você planejar seus compromissos com antecedência. Esta funcionalidade estará disponível em breve!
          </p>
        </div>
      )}
      
      {/* Modal de Agendamento */}
      {openModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setOpenModal(false);
            setEditingAppointment(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
              <h2 className="text-xl font-bold">
                {editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}
              </h2>
              <p className="text-blue-100">
                {formatDate(editingAppointment ? new Date(editingAppointment.date) : currentDate)}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    required
                    defaultValue={editingAppointment?.date || format(currentDate, "yyyy-MM-dd")}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FiCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Horário</label>
                <div className="relative">
                  <select 
                    name="time" 
                    required 
                    defaultValue={editingAppointment?.time || ""}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>Selecione um horário</option>
                    {generateTimeSlots.map((slot) => (
                      <option 
                        key={slot.time} 
                        value={slot.time}
                        className={slot.available ? "" : "text-gray-400"}
                        disabled={!slot.available && !editingAppointment}
                      >
                        {slot.time} {!slot.available && !editingAppointment && "(Ocupado)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Paciente</label>
                <select
                  name="clientId"
                  required
                  defaultValue={editingAppointment?.clientId || ""}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="" disabled>Selecione um paciente</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Procedimento</label>
                <input 
                  name="title" 
                  required 
                  defaultValue={editingAppointment?.title || ""}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Valor (R$)</label>
                  <input 
                    name="value" 
                    type="number" 
                    step="0.01" 
                    required 
                    defaultValue={editingAppointment?.value || ""}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Duração (minutos)</label>
                  <select 
                    name="duration"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={editingAppointment?.duration || 60}
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="90">90 minutos</option>
                    <option value="120">120 minutos</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Observação</label>
                <textarea 
                  name="note" 
                  defaultValue={editingAppointment?.note || ""}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => {
                    setOpenModal(false);
                    setEditingAppointment(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={processing === "create" || processing === "edit"}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2"
                >
                  {processing === "create" || processing === "edit" ? (
                    <FiLoader className="animate-spin" />
                  ) : null}
                  {editingAppointment ? "Atualizar" : "Agendar"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AgendaClient;