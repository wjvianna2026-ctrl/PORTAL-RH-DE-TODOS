import React, { useState } from 'react';
import { ExternalLink, MessageCircle, X } from 'lucide-react';
import { DepartmentContact } from '../types/portal';

interface FloatingSupportButtonProps {
  departments: DepartmentContact[];
  collaboratorName: string;
}

export const FloatingSupportButton: React.FC<FloatingSupportButtonProps> = ({
  departments,
  collaboratorName,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-3.5 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-[calc(100vw-1.75rem)] sm:w-80 bg-[#F8F7F4] border border-[#C5A467] rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#11382B] text-white">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#D8BC83]">
                Atendimento Direto
              </p>
              <p className="font-serif text-base font-semibold">Fale com os Setores</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-white/75 hover:text-white hover:bg-white/10"
              aria-label="Fechar atendimento rápido"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {departments.map((dep) => {
              const message = encodeURIComponent(
                `Olá, ${dep.responsibleName}! Sou ${collaboratorName} e estou entrando em contato pelo Portal RH Cavalcante & Rolim (${dep.shortName}).`
              );
              const waUrl = `https://wa.me/${dep.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
              return (
                <a
                  key={dep.id}
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white border border-[#1C2421]/10 hover:border-[#C5A467] rounded-lg p-3 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#11382B] group-hover:text-[#11382B]">
                      {dep.name}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#C5A467] shrink-0" />
                  </div>
                  <p className="text-[11px] text-[#1C2421]/75 mt-0.5">
                    {dep.responsibleName} · {dep.responsibleRole}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#11382B] text-white border border-[#C5A467] shadow-xl hover:bg-[#11382B]/95 transition-transform active:scale-95"
        aria-label="Central de Atendimento aos Setores"
      >
        <MessageCircle className="w-4 h-4 text-[#D8BC83]" />
        <span className="text-xs font-semibold tracking-wide whitespace-nowrap">
          Fale com os Setores
        </span>
      </button>
    </div>
  );
};
