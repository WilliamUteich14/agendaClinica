'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isToday, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useMemo } from 'react';
import { FiClock } from 'react-icons/fi';

interface MonthViewProps {
  loading: boolean;
  currentDate: Date;
  allAppointments: any[];
  onDayClick: (day: Date) => void;
  onAppointmentClick: (appointment: any) => void;
}

export const MonthView = ({
  loading,
  currentDate,
  allAppointments,
  onDayClick,
  onAppointmentClick
}: MonthViewProps) => {
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getAppointmentsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return allAppointments.filter(appt => appt.date === dateStr);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="p-8 text-center">
            <Skeleton className="h-8 w-8 mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        ) : allAppointments.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="inline-block bg-blue-50 p-4 rounded-full mb-4">
              <FiClock className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum agendamento para este mês
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Você não possui agendamentos marcados para este mês.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[800px]">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                <div key={index} className="p-3 text-center font-semibold text-gray-800">
                  {day}
                </div>
              ))}
              
              {monthDays.map((day, dayIndex) => (
                <div 
                  key={dayIndex} 
                  className={`border-t p-2 min-h-[120px] ${isSameMonth(day, currentDate) ? "" : "bg-gray-50 text-gray-400"}`}
                >
                  <div 
                    className={`text-right text-sm mb-1 ${
                      isToday(day) 
                        ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto" 
                        : ""
                    } ${
                      !isSameMonth(day, currentDate) 
                        ? "text-gray-300" 
                        : "font-medium"
                    }`}
                    onClick={() => {
                      if (isSameMonth(day, currentDate)) {
                        onDayClick(day);
                      }
                    }}
                  >
                    {format(day, "d")}
                  </div>
                  
                  {isSameMonth(day, currentDate) && getAppointmentsForDay(day).slice(0, 2).map(appt => (
                    <div 
                      key={appt._id} 
                      className="mb-1 p-1 bg-blue-50 rounded text-xs truncate cursor-pointer hover:bg-blue-100"
                      onClick={() => onAppointmentClick(appt)}
                    >
                      <div className="font-medium">{appt.time}</div>
                      <div className="truncate">{appt.clientName.split(" ")[0]}</div>
                    </div>
                  ))}
                  
                  {isSameMonth(day, currentDate) && getAppointmentsForDay(day).length > 2 && (
                    <div 
                      className="text-xs text-blue-600 font-medium mt-1 cursor-pointer"
                      onClick={() => onDayClick(day)}
                    >
                      + {getAppointmentsForDay(day).length - 2} mais
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};