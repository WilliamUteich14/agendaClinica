// src/app/dashboard/clientes/components/configs.tsx

import { FieldConfig } from "@/utils/types/modalGeneric";
import ModalGeneric from "../../components/modalGeneric";

interface ClienteValoresIniciais {
  id?: string;
  name?: string;
  email?: string;
  address?: string;
  cpf?: string;
  birthDate?: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  active?: string | boolean;
}

export const configModalCliente = (
  action: "Adicionar" | "Editar",
  initialValues?: ClienteValoresIniciais
) => {
  const initialValuesFormatted: { [key: string]: string } | undefined = initialValues
    ? {
        name: initialValues.name ?? "",
        email: initialValues.email ?? "",
        address: initialValues.address ?? "",
        cpf: initialValues.cpf ?? "",
        birthDate: initialValues.birthDate ?? "",
        medicalHistory: initialValues.medicalHistory ?? "",
        allergies: initialValues.allergies ?? "",
        active:
          typeof initialValues.active === "boolean"
            ? initialValues.active.toString()
            : initialValues.active ?? "true",
      }
    : undefined;

  return {
    title: `${action} Cliente`,
    description:
      action === "Adicionar"
        ? "Preencha os campos abaixo para adicionar um novo cliente."
        : "Altere os dados do cliente conforme necessário.",
    action,
    fields: [
      {
        name: "name",
        label: "Nome",
        type: "text",
        placeholder: "Nome completo do cliente",
        required: true,
      },
      {
        name: "email",
        label: "E-mail",
        type: "email",
        placeholder: "exemplo@dominio.com",
        required: true,
      },
      {
        name: "cpf",
        label: "CPF",
        type: "text",
        placeholder: "000.000.000-00",
        mask: "999.999.999-99",
      },
      {
        name: "birthDate",
        label: "Nascimento",
        type: "date",
        placeholder: "dd/mm/aaaa",
      },
      {
        name: "address",
        label: "Endereço",
        type: "text",
        placeholder: "Endereço completo",
      },
      {
        name: "allergies",
        label: "Alergias",
        type: "textarea",
        placeholder: "Liste as alergias do cliente",
      },
      {
        name: "medicalHistory",
        label: "Histórico",
        type: "textarea",
        placeholder: "Informe o histórico médico do cliente",
      },
      {
        name: "active",
        label: "Status",
        type: "select",
        placeholder: "Selecione o status",
        options: [
          { value: "true", label: "Ativo" },
          { value: "false", label: "Inativo" },
        ],
      },
    ] as FieldConfig[],
    apiEndpoint:
      action === "Editar" && initialValues?.id
        ? `${process.env.NEXT_URL}/api/agendamento/clients/${initialValues.id}`
        : `${process.env.NEXT_URL}/api/agendamento/clients`,
    urlRevalidate: ["/dashboard/clientes"],
    method: action === "Adicionar" ? "POST" : "PUT",
    initialValues: initialValuesFormatted,
  };
};

export const BotaoAdicionarCliente = () => {
  const config = configModalCliente("Adicionar");
  return <ModalGeneric config={config} />;
};
