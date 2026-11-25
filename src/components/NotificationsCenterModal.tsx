import React from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  Compass,
  Gamepad2,
  Gift,
  Megaphone,
  X,
} from 'lucide-react';
import { PendingOpportunity } from '../utils/pendingOpportunities';

interface NotificationsCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PendingOpportunity[];
  totalAvailablePoints: number;
  onSelectOpportunity: (item: PendingOpportunity) => void;
}

export const NotificationsCenterModal: React.FC<NotificationsCenterModalProps> = ({
  isOpen,
  onClose,
  items,
  totalAvailablePoints,
  onSelectOpportunity,
}) => {
  if (!isOpen) return null;

  const getIcon = (kind: PendingOpportunity['kind']) => {
    switch (kind) {
      case 'comunicado':
        return <Megaphone className="w-4 h-4 text-[#C5A467]" />;
      case 'manual':
        return <BookOpen className="w-4 h-4 text-[#C5A467]" />;
      case 'onboarding':
        return <Compass className="w-4 h-4 text-[#C5A467]" />;
      case 'desafio':
        return <Gamepad2 className="w-4 h-4 text-[#C5A467]" />;
      case 'aniversario':
        return <Gift className="w-4 h-4 text-[#C5A467]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-[#11382B]/65 backdrop-blur-xs p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-title"
    >
      <div className="w-full max-w-md max-h-[86vh] bg-[#F8F7F4] border border-[#C5A467]/60 rounded-xl shadow-2xl flex flex-col overflow-hidden mt-8 sm:mt-12">
        <div className="flex items-center justify-between gap-2 px-4 sm:px-5 py-3.5 sm:py-4 bg-[#11382B] text-white border-b border-[#C5A467]/35 shrink-0">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-[#D8BC83]" />
            <div>
              <h3 id="notif-title" className="font-serif text-lg font-semibold leading-none">
                Notificações &amp; Pontos Pendentes
              </h3>
              <p className="text-[11px] text-[#D8BC83] font-mono tabular-nums mt-1">
                {items.length} pendências · até +{totalAvailablePoints} Signature Coins
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10"
            aria-label="Fechar notificações"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <Award className="w-8 h-8 mx-auto text-[#C5A467]" />
              <p className="font-serif text-xl font-semibold text-[#11382B]">
                Tudo em dia por aqui!
              </p>
              <p className="text-xs text-[#1C2421]/70">
                Você já leu todos os conteúdos e completou os desafios disponíveis até o momento.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectOpportunity(item);
                  onClose();
                }}
                className="w-full text-left bg-white border border-[#1C2421]/10 hover:border-[#C5A467] rounded-lg p-3.5 transition-colors flex items-start gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#11382B] flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.kind)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-semibold text-[#C5A467]">
                      +{item.points} Signature Coins
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#11382B]/40 group-hover:text-[#11382B] transition-colors shrink-0" />
                  </div>
                  <p className="text-sm font-semibold text-[#11382B] leading-snug mt-0.5 line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#1C2421]/65 mt-0.5 truncate">{item.subtitle}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
