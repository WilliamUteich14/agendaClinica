import ModalGeneric from "../../components/modalGeneric";
import { FieldConfig } from "@/utils/types/modalGeneric";

interface FuncionarioInitialValues {
  id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "staff";
  password?: string;
  active?: "true" | "false";
}

export const funcionarioModalConfig = (
  action: "Adicionar" | "Editar",
  initialValues?: FuncionarioInitialValues,
) => {
  const initialValuesFormatted: { [key: string]: string } | undefined = initialValues
    ? {
      name: initialValues.name ?? "",
      email: initialValues.email ?? "",
      password: initialValues.password ?? "",
      role: initialValues.role ?? "staff",
      active: initialValues.active?.toString() ?? "true", 
    }
  : undefined;

  return {
    title: `${action} Funcionário`,
    description:
      action === "Adicionar"
        ? "Preencha os campos abaixo para adicionar um novo funcionário."
        : "Altere os dados do funcionário conforme necessário.",
    action,
    fields: [
      {
        name: "name",
        label: "Nome",
        type: "text",
        placeholder: "Digite o nome do funcionário",
      },
      {
        name: "email",
        label: "E-mail",
        type: "email",
        placeholder: "email@exemplo.com",
      },
      {
        name: "password",
        label: "Senha",
        type: "password",
        placeholder: "Senha12345",
      },
      {
        name: "role",
        label: "Cargo",
        type: "select",
        placeholder: "Selecione o cargo",
        options: [
          { value: "admin", label: "Administrador" },
          { value: "staff", label: "Colaborador" },
        ],
      },
      {
        name: "active",
        label: "Ativo/Inativo",
        type: "select",
        placeholder: "Selecione o Status",
        options: [
          { value: "true", label: "Ativo" },
          { value: "false", label: "Inativo" },
        ],
      },
    ] as FieldConfig[],
    apiEndpoint: action === "Editar" && initialValues?.id
      ? `${process.env.NEXT_URL}/api/agendamento/users/${initialValues.id}`
      : `${process.env.NEXT_URL}/api/agendamento/users`,
    urlRevalidate: ["/dashboard/funcionarios"],
    //tags: ["reloadUsers"],
    method: action === "Adicionar" ? "POST" : "PUT",
    initialValues: initialValuesFormatted,
  };
};

export const AddFuncionarioButton = () => {
  const config = funcionarioModalConfig("Adicionar");
  return <ModalGeneric config={config} />;
};
