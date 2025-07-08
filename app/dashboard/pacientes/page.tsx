// src/app/dashboard/clientes/page.tsx

import React from "react";
import { headers } from "next/headers";
import { 
  FiUser, FiChevronDown, FiChevronUp, FiPhone, 
  FiMapPin, FiCreditCard, FiCalendar, FiHeart, FiFileText, FiPlus 
} from "react-icons/fi";

export const dynamic = 'force-dynamic';

import { BotaoAdicionarCliente, configModalCliente } from "./components/configs";
import ModalGeneric from "../components/modalGeneric";
import ButtonDelete from "../components/modalDelete";

interface ApiCliente {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  address?: string;
  cpf?: string;
  birthDate?: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  active: boolean;
}

interface Cliente extends ApiCliente {
  id: string;
}

export default async function PaginaClientes() {
  let clientes: Cliente[] = [];

  try {
    const listaHeaders = headers();
    const cookieHeader = (await listaHeaders).get("cookie") || "";

    const resposta = await fetch(`${process.env.NEXT_URL}/api/agendamento/clients`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    });

    if (!resposta.ok) {
      return (
        <div className="flex items-center justify-center min-h-[60vh] p-8 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold text-red-600">Erro ao carregar os dados</h2>
            <p className="text-gray-600 mt-2">
              Não foi possível carregar a lista de clientes no momento. Por favor, tente novamente mais tarde.
            </p>
          </div>
        </div>
      );
    }

    const dadosApi: ApiCliente[] = await resposta.json();

    clientes = dadosApi.map((c) => ({
      id: (c.id || c._id || c.email) as string,
      name: c.name,
      email: c.email,
      address: c.address,
      cpf: c.cpf,
      birthDate: c.birthDate,
      medicalHistory: c.medicalHistory,
      allergies: c.allergies,
      emergencyContactName: c.emergencyContactName,
      emergencyContactPhone: c.emergencyContactPhone,
      active: c.active ?? true,
    }));
  } catch (erro) {
    console.error("Erro ao carregar clientes:", erro);
    return null;
  }

  function parseDateAsLocal(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  // Calcular estatísticas
  const stats = {
    total: clientes.length,
    ativos: clientes.filter(c => c.active).length,
    comHistorico: clientes.filter(c => c.medicalHistory).length,
  }

  if (clientes.length === 0) {
    return (
      <div className="w-full  mx-auto p-4">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FiUser className="text-blue-600" size={24} />
                Gerenciamento de Pacientes
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie os pacientes da sua clínica odontológica
              </p>
            </div>
            <BotaoAdicionarCliente />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiUser className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total de Pacientes</h3>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <FiUser className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Ativos</h3>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-3 rounded-full">
                  <FiFileText className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Com Histórico</h3>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="text-center py-12 px-4">
            <div className="inline-block bg-blue-50 p-4 rounded-full mb-4">
              <FiUser className="text-blue-500" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Nenhum paciente cadastrado
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Você ainda não possui pacientes cadastrados em sua clínica.
            </p>
            <BotaoAdicionarCliente />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FiUser className="text-blue-600" size={24} />
              Gerenciamento de Pacientes
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie os pacientes da sua clínica odontológica
            </p>
          </div>
          <BotaoAdicionarCliente />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUser className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total de Pacientes</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FiUser className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Ativos</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.ativos} <span className="text-sm font-normal">({stats.total ? Math.round((stats.ativos / stats.total) * 100) : 0}%)</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <FiFileText className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Com Histórico</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.comHistorico}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de cards de pacientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FiUser className="text-blue-600" size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{cliente.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{cliente.email}</p>
                </div>
              </div>

              <div className="flex gap-1">
                <ModalGeneric
                  config={configModalCliente("Editar", cliente)}
                  params={cliente.id}
                />
                <ButtonDelete
                  config={{
                    id: cliente.id,
                    title: "Tem certeza que deseja excluir esse paciente?",
                    description: "Esta ação não pode ser desfeita. O paciente será removido permanentemente.",
                    apiEndpoint: `${process.env.NEXT_URL}/api/agendamento/clients/${cliente.id}`,
                    urlRevalidate: ["/dashboard/clientes"],
                    tags: undefined,
                  }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                cliente.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                <span className={`h-2 w-2 rounded-full ${cliente.active ? "bg-green-500" : "bg-red-500"}`}></span>
                {cliente.active ? "Ativo" : "Inativo"}
              </span>

              {cliente.cpf && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs">
                  <FiCreditCard className="h-3 w-3" />
                  {cliente.cpf}
                </span>
              )}

              {cliente.birthDate && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 rounded-full px-2 py-1 text-xs">
                  <FiCalendar className="h-3 w-3" />
                  {parseDateAsLocal(cliente.birthDate).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>

            {/* Detalhes expandíveis */}
            <details className="group mt-3">
              <summary className="flex items-center justify-between cursor-pointer text-sm text-blue-600 font-medium">
                <span>Mais detalhes</span>
                <FiChevronDown className="h-4 w-4 group-open:hidden" />
                <FiChevronUp className="h-4 w-4 hidden group-open:block" />
              </summary>

              <div className="mt-2 pt-2 border-t border-gray-100 space-y-2 text-sm">
                {cliente.address && (
                  <div className="flex items-start gap-2 text-gray-700">
                    <FiMapPin className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{cliente.address}</span>
                  </div>
                )}

                {cliente.emergencyContactName && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <FiUser className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>{cliente.emergencyContactName}</span>
                  </div>
                )}

                {cliente.emergencyContactPhone && (
                  <div className="flex items-center gap-2 text-gray-700 ml-5">
                    <FiPhone className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span>{cliente.emergencyContactPhone}</span>
                  </div>
                )}

                {(cliente.allergies || cliente.medicalHistory) && (
                  <div className="mt-2">
                    <h4 className="font-medium text-gray-800 mb-1">Informações de saúde:</h4>
                    {cliente.allergies && (
                      <p className="text-rose-600 text-sm flex items-start gap-2">
                        <FiHeart className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><span className="font-medium">Alergias:</span> {cliente.allergies}</span>
                      </p>
                    )}
                    {cliente.medicalHistory && (
                      <p className="text-blue-600 text-sm flex items-start gap-2">
                        <FiFileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span><span className="font-medium">Histórico:</span> {cliente.medicalHistory}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </details>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        {clientes.length} {clientes.length === 1 ? 'paciente' : 'pacientes'} cadastrados
      </div>
    </div>
  );
}