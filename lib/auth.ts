export interface LoginResponse {
  error?: boolean;
  message?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch("/api/agendamento/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", 
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Credenciais inválidas");
  }

  try {
    return (await res.json()) as LoginResponse;
  } catch {
    return {};
  }
}
