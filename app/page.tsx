import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FormLogin from "./components/formLogin";

export default async function Home() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  const res = await fetch(`${process.env.NEXT_URL}/api/agendamento/auth/verifyToken`, {
    headers: {
      Cookie: `token=${token}`,
    },
    cache: "no-store", 
  });

  if(res.ok) {
    return redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
        <div className="px-8 pt-8 pb-6 bg-white">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 rounded-xl w-16 h-16 flex items-center justify-center">
              <div className="bg-blue-600 rounded-full w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">DentalCare</h1>
          <p className="text-sm text-gray-600 text-center mt-1">Sistema profissional de agendamento</p>
        </div>

        <div className="bg-gray-50 px-8 py-8">
            <FormLogin/>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            Problemas com acesso?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Contate o administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}