"use client";

import { useState } from "react";
import { User, ChevronDown, LogOut } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { UserProfile } from "@/types/app.types";

interface TopBarProps {
  title?: string;
  user?: UserProfile | null;
}

export function TopBar({ title, user }: TopBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>

        <div className="flex items-center gap-4">
          {user?.currency && (
            <span className="px-2 py-1 text-xs font-medium bg-slate-100 rounded">
              {user.currency}
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                {user?.full_name || "Usuario"}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
