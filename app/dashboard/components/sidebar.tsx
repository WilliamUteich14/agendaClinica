"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiCalendar, FiFileText, FiUsers, FiUser, FiHome, FiSettings, FiLogOut } from "react-icons/fi";
import { GiTooth } from "react-icons/gi";

const primaryItems = [
  { label: "Home", href: "/dashboard", icon: FiHome },
  { label: "Agenda", href: "/dashboard/agenda", icon: FiCalendar },
  { label: "Prontuário", href: "/dashboard/prontuario", icon: FiFileText },
  { label: "Pacientes", href: "/dashboard/pacientes", icon: FiUsers },
  { label: "Funcionários", href: "/dashboard/funcionarios", icon: FiUser },
];

const secondaryItems = [
  { label: "Configurações", href: "/dashboard/configuracoes", icon: FiSettings },
];

export default function Sidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 w-60 transform bg-slate-900 text-slate-200 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Header inside sidebar */}
        {/* Mobile header */}
        <div className="flex items-center justify-between px-6 py-4 lg:hidden border-b border-slate-700">
         <div className="flex items-center gap-3"><GiTooth size={28} className="text-cyan-400" /><span className="text-2xl font-extrabold tracking-wide text-white">DentalCare</span></div>
          <button
            className="p-2 rounded-md hover:bg-blue-600/40"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            ✕
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center px-6 py-6 border-b border-slate-700">
          <div className="flex items-center gap-3"><GiTooth size={28} className="text-cyan-400" /><span className="text-2xl font-extrabold tracking-wide text-white">DentalCare</span></div>
        </div>

        <nav className="px-3 py-6 space-y-1">
          <ul className="space-y-2">
            {primaryItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-4 rounded-md px-4 py-2 font-medium transition-colors duration-150 relative ${pathname === item.href
                      ? "bg-slate-800 text-white before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-cyan-400"
                      : "hover:bg-slate-800 hover:text-white"
                    }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon size={20} className="text-cyan-400 group-hover:text-cyan-300" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto px-3 py-4 border-t border-slate-700">
          <ul className="space-y-1">
            {secondaryItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-4 rounded-md px-4 py-2 font-medium transition-colors duration-150 relative ${pathname === item.href
                      ? "bg-slate-800 text-white before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-cyan-400"
                      : "hover:bg-slate-800 hover:text-white"
                    }`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon size={20} className="text-cyan-400 group-hover:text-cyan-300" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

            <li>
              <button
                className="group cursor-pointer w-full flex items-center gap-4 rounded-md px-4 py-2 font-medium text-left text-slate-200 transition-colors duration-150 hover:bg-slate-800 hover:text-white"
              >
                <FiLogOut size={20} className="text-red-400 group-hover:text-red-800" />
                <span>Sair</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Topbar (mobile) */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 lg:hidden bg-white">
          <button
            className="p-2 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2"><GiTooth className="text-cyan-400" size={20} /><span className="font-semibold">DentalCare</span></div>
          <div></div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}