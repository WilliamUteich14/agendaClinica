'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiCheck, FiClock, FiDollarSign } from 'react-icons/fi';

interface StatsCardsProps {
  stats: {
    total: number;
    completed: number;
    revenue: number;
  };
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
          <FiClock className="text-blue-500" size={20} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          <FiCheck className="text-green-500" size={20} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.completed} <span className="text-sm font-normal">({stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%)</span>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Receita Prevista</CardTitle>
          <FiDollarSign className="text-amber-500" size={20} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">R$ {stats.revenue.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
};