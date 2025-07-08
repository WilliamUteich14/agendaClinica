// src/app/dashboard/clientes/page.tsx

import React from "react";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

import {
  FaUser, FaUserCog, FaChevronDown, FaChevronUp, FaPhone,
  FaMapMarkerAlt, FaIdCard, FaCalendarAlt, FaUserInjured
} from "react-icons/fa";

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
        <div className="flex items-center justify-center h-full p-8 text-center">
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

  if (clientes.length === 0) {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl w-full">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-teal-800 flex items-center gap-2">
                <FaUserCog className="h-8 w-8" />
                Gerenciamento de Clientes
              </h1>
              <p className="text-sm md:text-base text-teal-600 mt-1 max-w-2xl">
                Gerencie os clientes da sua clínica odontológica.
              </p>
            </div>

            <BotaoAdicionarCliente />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <FaUser className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-blue-700 mb-2">Nenhum cliente cadastrado</h2>
            <p className="text-blue-600 mb-4">
              Você ainda não possui clientes cadastrados em sua clínica.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-teal-800 flex items-center gap-2">
              <FaUserCog className="h-8 w-8" />
              Gerenciamento de Clientes
            </h1>
            <p className="text-sm md:text-base text-teal-600 mt-1 max-w-2xl">
              Gerencie os clientes da sua clínica odontológica.
            </p>
          </div>

          <BotaoAdicionarCliente />
        </div>

        {/* Grid de cards compactos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-white rounded-lg border border-teal-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <FaUser className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-teal-900 truncate">{cliente.name}</h3>
                    <p className="text-xs text-teal-500 truncate">{cliente.email}</p>
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
                      title: "Tem certeza que deseja excluir esse cliente?",
                      description: "Esta ação não pode ser desfeita. O cliente será removido permanentemente. Deseja continuar?",
                      apiEndpoint: `${process.env.NEXT_URL}/api/agendamento/clients/${cliente.id}`,
                      urlRevalidate: ["/dashboard/clientes"],
                      tags: undefined,
                    }}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${cliente.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  <span className={`h-2 w-2 rounded-full ${cliente.active ? "bg-green-500" : "bg-red-500"}`}></span>
                  {cliente.active ? "Ativo" : "Inativo"}
                </span>

                {cliente.cpf && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-2 py-1 text-xs">
                    <FaIdCard className="h-3 w-3" />
                    {cliente.cpf}
                  </span>
                )}

                {cliente.birthDate && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 rounded-full px-2 py-1 text-xs">
                    <FaCalendarAlt className="h-3 w-3" />
                    {parseDateAsLocal(cliente.birthDate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>

              {/* Detalhes expandíveis */}
              <details className="group mt-3">
                <summary className="flex items-center justify-between cursor-pointer text-sm text-teal-600 font-medium">
                  <span>Mais detalhes</span>
                  <FaChevronDown className="h-3 w-3 group-open:hidden" />
                  <FaChevronUp className="h-3 w-3 hidden group-open:block" />
                </summary>

                <div className="mt-2 pt-2 border-t border-teal-100 space-y-2 text-xs">
                  {cliente.address && (
                    <div className="flex items-start gap-2">
                      <FaMapMarkerAlt className="h-3 w-3 text-teal-500 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{cliente.address}</span>
                    </div>
                  )}

                  {cliente.emergencyContactName && (
                    <div className="flex items-center gap-2">
                      <FaUserInjured className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      <span>{cliente.emergencyContactName}</span>
                    </div>
                  )}

                  {cliente.emergencyContactPhone && (
                    <div className="flex items-center gap-2 ml-5">
                      <FaPhone className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      <span>{cliente.emergencyContactPhone}</span>
                    </div>
                  )}

                  {(cliente.allergies || cliente.medicalHistory) && (
                    <div className="mt-2">
                      <h4 className="font-medium text-teal-700 mb-1">Informações de saúde:</h4>
                      {cliente.allergies && (
                        <p className="text-rose-600"><span className="font-medium">Alergias:</span> {cliente.allergies}</p>
                      )}
                      {cliente.medicalHistory && (
                        <p className="text-blue-600"><span className="font-medium">Histórico:</span> {cliente.medicalHistory}</p>
                      )}
                    </div>
                  )}
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-teal-600">
          <p>{clientes.length} {clientes.length === 1 ? "cliente cadastrado" : "clientes cadastrados"} em sua clínica</p>
        </div>
      </div>
    </div>
  );
}
