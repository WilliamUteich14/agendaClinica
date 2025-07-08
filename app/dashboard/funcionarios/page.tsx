import React from "react";
import { headers } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiUser, FiEdit2, FiTrash2, FiPlus, FiUserCheck } from "react-icons/fi";
import ModalGeneric from "../components/modalGeneric";
import ModalDelete from "../components/modalDelete";
import { AddFuncionarioButton, funcionarioModalConfig } from "./components/configs";

export const dynamic = 'force-dynamic';

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
        <div className="flex items-center justify-center min-h-[60vh] p-8 text-center">
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

  // Calcular estatísticas
  const stats = {
    total: funcionarios.length,
    ativos: funcionarios.filter(f => f.active === 'true').length,
    admins: funcionarios.filter(f => f.role === 'admin').length,
  }

  if (funcionarios.length === 0) {
    return (
      <div className="w-full mx-auto p-4">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <FiUser className="text-blue-600" size={24} />
                Equipe Odontológica
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie médicos, assistentes e equipe administrativa da clínica
              </p>
            </div>
            <AddFuncionarioButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <FiUser className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Total de Funcionários</h3>
                  <p className="text-2xl font-bold text-gray-800">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-3 rounded-full">
                  <FiUserCheck className="text-green-600" size={24} />
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
                  <FiUser className="text-amber-600" size={24} />
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Administradores</h3>
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
              Nenhum funcionário cadastrado
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Você ainda não possui funcionários cadastrados em sua clínica.
            </p>
            <AddFuncionarioButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  mx-auto p-4">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FiUser className="text-blue-600" size={24} />
              Equipe Odontológica
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie médicos, assistentes e equipe administrativa da clínica
            </p>
          </div>
          <AddFuncionarioButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <FiUser className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Total de Funcionários</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <FiUserCheck className="text-green-600" size={24} />
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
                <FiUser className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Administradores</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.admins}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="hidden md:block">
          <Table className="w-full">
            <TableHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <TableRow className="hover:bg-indigo-700">
                <TableHead className="px-6 py-4 font-semibold uppercase text-white">Funcionário</TableHead>
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
                  className="border-t border-gray-100 hover:bg-blue-50 transition-colors duration-150"
                >
                  <TableCell className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FiUser className="text-blue-600" size={20} />
                      </div>
                      <span>{funcionario.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-700">{funcionario.email}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        funcionario.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {funcionario.role === 'admin' ? 'Administrador' : 'Colaborador'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        funcionario.active === 'true'
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
                    <div className="flex justify-end items-center gap-2">
                      <ModalGeneric 
                        config={funcionarioModalConfig("Editar", funcionario)} 
                        params={funcionario.id}
                      />
                      <ModalDelete
                        config={{
                          id: funcionario.id,
                          title: "Tem certeza que deseja excluir esse funcionário?",
                          description: "Esta ação não pode ser desfeita. O funcionário será removido permanentemente.",
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
        <div className="md:hidden">
          {funcionarios.map((funcionario) => (
            <div
              key={funcionario.id}
              className="flex flex-col gap-3 p-4 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FiUser className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{funcionario.name}</h3>
                    <p className="text-sm text-gray-600">{funcionario.email}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                    funcionario.role === 'admin'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {funcionario.role === 'admin' ? 'Administrador' : 'Colaborador'}
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    funcionario.active === 'true'
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
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <ModalGeneric 
                  config={funcionarioModalConfig("Editar", funcionario)} 
                  params={funcionario.id}
                />
                <ModalDelete
                  config={{
                    id: funcionario.id,
                    title: "Excluir funcionário",
                    description: "Tem certeza que deseja excluir este funcionário?",
                    apiEndpoint: `${process.env.NEXT_URL}/api/agendamento/users/${funcionario.id}`,
                    urlRevalidate: ["/dashboard/funcionarios"],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
          {funcionarios.length} {funcionarios.length === 1 ? 'funcionário' : 'funcionários'} cadastrados
        </div>
      </div>
    </div>
  );
}