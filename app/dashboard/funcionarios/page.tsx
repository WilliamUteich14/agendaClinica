import React from "react";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FaTrash, FaUser, FaUserCog } from 'react-icons/fa';
import { AddFuncionarioButton, funcionarioModalConfig } from "./components/configs";
import ModalGeneric from "../components/modalGeneric";
import ModalDelete from "../components/modalDelete";


interface ApiUser {
  _id?: string;
  id?: string;
  name?: string;
  email: string;
  role?: string;
  active: "true" | "false";
}

interface Funcionario {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  active: "true" | "false";
}

export default async function FuncionariosPage() {
  let funcionarios: Funcionario[] = [];

  try {
    const headerList = headers();
    const cookieHeader = (await headerList).get('cookie') || '';

    const res = await fetch(`${process.env.NEXT_URL}/api/agendamento/users`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: 'force-cache',
    });

    if (!res.ok) {
      return (
        <div className="flex items-center justify-center h-full p-8 text-center">
          <div className="max-w-md">
            <h2 className="text-xl font-semibold text-red-600">Erro ao carregar os dados</h2>
            <p className="text-gray-600 mt-2">
              Não foi possível carregar a lista de funcionários no momento. Por favor, tente novamente mais tarde.
            </p>
          </div>
        </div>
      );
    }

    const apiData: ApiUser[] = await res.json();

    funcionarios = apiData.map((u) => ({
      id: (u.id || u._id || u.email) as string,
      name: u.name ?? u.email.split("@")[0],
      email: u.email,
      role: (u.role === "ADMIN" || u.role === "admin") ? "admin" : "staff",
      active: u.active ?? true,
    }));

  } catch (err) {
    console.error("Erro ao carregar funcionários:", err);
    return null
  }

  if (funcionarios.length === 0) {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl w-full">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-teal-800 flex items-center gap-2">
                <FaUserCog className="h-8 w-8" />
                Equipe Odontológica
              </h1>
              <p className="text-sm md:text-base text-teal-600 mt-1 max-w-2xl">
                Gerencie médicos, assistentes e equipe administrativa da clínica.
              </p>
            </div>

            <AddFuncionarioButton />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <FaUser className="h-16 w-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-blue-700 mb-2">Nenhum funcionário cadastrado</h2>
            <p className="text-blue-600 mb-4">
              Você ainda não possui funcionários cadastrados em sua clínica.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-teal-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto w-full">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-teal-800 flex items-center gap-2">
              <FaUserCog className="h-8 w-8" />
              Equipe Odontológica
            </h1>
            <p className="text-sm md:text-base text-teal-600 mt-1 max-w-2xl">
              Gerencie médicos, assistentes e equipe administrativa da clínica.
            </p>
          </div>

          <AddFuncionarioButton />
        </div>

        <div className="hidden md:block overflow-auto rounded-xl border border-teal-100 bg-white shadow-lg w-full">
          <Table className="w-full">
            <TableHeader className="bg-teal-500 text-white">
              <TableRow className="hover:bg-teal-500">
                <TableHead className="px-6 py-4 font-semibold uppercase text-white">Nome</TableHead>
                <TableHead className="px-6 py-4 font-semibold uppercase text-white">E-mail</TableHead>
                <TableHead className="px-6 py-4 font-semibold uppercase text-white">Cargo</TableHead>
                <TableHead className="px-6 py-4 font-semibold uppercase text-white">Status</TableHead>
                <TableHead className="px-6 py-4 text-right font-semibold uppercase text-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funcionarios.map((funcionario) => (
                <TableRow
                  key={funcionario.id}
                  className="border-t border-teal-50 hover:bg-teal-50 transition-colors duration-150"
                >
                  <TableCell className="px-6 py-4 font-medium text-teal-900">
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-100 p-2 rounded-full">
                        <FaUser className="h-5 w-5 text-teal-600" />
                      </div>
                      <span>{funcionario.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-teal-700">{funcionario.email}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${funcionario.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {funcionario.role === 'admin' ? 'Administrador' : 'Colaborador'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${funcionario.active === 'true'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {funcionario.active === 'true' ? (
                        <>
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          Ativo
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          Inativo
                        </>
                      )}
                    </span>

                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-3">
                      <ModalGeneric config={funcionarioModalConfig("Editar", funcionario)} params={funcionario.id} />
                      <ModalDelete
                        config={{
                          id: funcionario.id,
                          title: "Tem certeza que deseja excluir esse Funcionário?",
                          description: "Esta ação não pode ser desfeita. O funcionário será removida permanentemente. Deseja continuar?",
                          apiEndpoint: `${process.env.NEXT_URL}/api/agendamento/users/${funcionario.id}`,
                          urlRevalidate: ["/dashboard/funcionarios"],
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Cards para mobile */}
        <div className="md:hidden grid grid-cols-1 gap-4 w-full">
          {funcionarios.map((funcionario) => (
            <div
              key={funcionario.id}
              className="bg-white rounded-xl border border-teal-100 p-4 shadow-md hover:shadow-lg transition-shadow duration-200 w-full"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <FaUser className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-teal-900">{funcionario.name}</h3>
                    <p className="text-sm text-teal-600">{funcionario.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <ModalGeneric config={funcionarioModalConfig("Editar", funcionario)} params={funcionario.id} />
                  <button
                    className="p-1.5 hover:bg-rose-100 rounded-md transition-colors duration-200 cursor-pointer"
                    title="Excluir"
                  >
                    <FaTrash className="h-4 w-4 text-rose-500" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${funcionario.role === 'admin'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                    }`}
                >
                  {funcionario.role === 'admin' ? 'Administrador' : 'Colaborador'}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${funcionario.active == "true"
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                    }`}
                >
                  {funcionario.active ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Ativo
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-red-500"></span>
                      Inativo
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-teal-600">
          <p>{funcionarios.length} {funcionarios.length === 1 ? 'funcionário cadastrado' : 'funcionários cadastrados'} em sua clínica</p>
        </div>
      </div>
    </div>
  );
}