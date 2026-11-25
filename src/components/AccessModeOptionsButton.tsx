import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Crown,
  Lock,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { AuthSessionUser, PortalViewMode } from '../types/portal';
import { StandardizedImage } from './StandardizedImage';

interface AccessModeOptionsButtonProps {
  sessionUser: AuthSessionUser;
  activeMode: PortalViewMode;
  canUseGestorMode: boolean;
  variant?: 'header' | 'workspace';
  onSwitchToColaborador: () => void;
  onSwitchToGestor: () => void;
  onOpenManagerOptions: () => void;
  onOpenGovernance: () => void;
  onLogout: () => void;
}

export const AccessModeOptionsButton: React.FC<AccessModeOptionsButtonProps> = ({
  sessionUser,
  activeMode,
  canUseGestorMode,
  variant = 'header',
  onSwitchToColaborador,
  onSwitchToGestor,
  onOpenManagerOptions,
  onOpenGovernance,
  onLogout,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const isGestorActive = canUseGestorMode && activeMode === 'gestor';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
          variant === 'header'
            ? isGestorActive
              ? 'px-3 py-1.5 bg-[#C5A467] text-[#11382B] hover:bg-[#D8BC83]'
              : 'px-3 py-1.5 bg-white/10 border border-[#C5A467]/50 text-white hover:bg-white/20'
            : isGestorActive
              ? 'px-3.5 py-2 bg-[#11382B] text-white hover:bg-[#11382B]/90 border border-[#C5A467]/60'
              : 'px-3.5 py-2 bg-white text-[#11382B] hover:bg-[#11382B]/5 border border-[#11382B]/25'
        }`}
      >
        <div className="w-5 h-5 shrink-0">
          <StandardizedImage
            src={sessionUser.photoUrl}
            alt={sessionUser.name}
            aspectRatio="1:1"
            rounded="full"
          />
        </div>
        <span>
          {variant === 'header'
            ? isGestorActive
              ? 'Opções · Modo Gestor'
              : 'Opções · Modo Colaborador'
            : isGestorActive
              ? 'Opções de Modo · Gestor Ativo'
              : 'Opções de Modo · Colaborador Ativo'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white border border-[#C5A467]/60 rounded-xl shadow-2xl overflow-hidden z-50 text-[#1C2421] ${
            variant === 'workspace' ? 'left-0 sm:left-auto sm:right-0' : 'right-0'
          }`}
        >
          {/* Current Authenticated Identity */}
          <div className="bg-[#11382B] text-white px-4 py-3.5 flex items-center gap-3 border-b border-[#C5A467]/35">
            <div className="w-10 h-10 shrink-0">
              <StandardizedImage
                src={sessionUser.photoUrl}
                alt={sessionUser.name}
                aspectRatio="1:1"
                rounded="full"
                goldBorder
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                {sessionUser.accessRole === 'master' ? (
                  <Crown className="w-3.5 h-3.5 text-[#D8BC83] shrink-0" />
                ) : sessionUser.accessRole === 'gestor' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D8BC83] shrink-0" />
                ) : (
                  <Users className="w-3.5 h-3.5 text-[#D8BC83] shrink-0" />
                )}
                <span className="truncate">{sessionUser.name}</span>
              </p>
              <p className="text-[11px] text-white/70 truncate">{sessionUser.roleTitle}</p>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#D8BC83] mt-0.5">
                {isGestorActive
                  ? 'Modo Gestor · Inserir, Corrigir & Excluir'
                  : 'Modo Colaborador · Visualizar & Interagir'}
              </p>
            </div>
          </div>

          <div className="p-2.5 space-y-1.5">
            <p className="px-2 pt-1 text-[10px] font-mono uppercase tracking-wider text-[#1C2421]/55">
              Trocar Modo de Acesso
            </p>

            {/* Option 1: Modo Gestor */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSwitchToGestor();
              }}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                isGestorActive
                  ? 'bg-[#11382B]/8 border border-[#11382B]/25'
                  : 'hover:bg-[#F8F7F4] border border-transparent'
              }`}
            >
              {canUseGestorMode ? (
                <ShieldCheck className="w-4 h-4 text-[#C5A467] shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-4 h-4 text-[#C5A467] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#11382B] flex items-center justify-between gap-2">
                  <span>Modo Gestor (Acesso Completo)</span>
                  {isGestorActive && <Check className="w-3.5 h-3.5 text-[#11382B]" />}
                </p>
                <p className="text-[11px] text-[#1C2421]/65 leading-snug mt-0.5">
                  {canUseGestorMode
                    ? 'Inserir, corrigir e excluir informações da plataforma.'
                    : 'Requer autenticação com login e senha de Gestor ou Master.'}
                </p>
              </div>
            </button>

            {/* Option 2: Modo Colaborador */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSwitchToColaborador();
              }}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                !isGestorActive
                  ? 'bg-[#11382B]/8 border border-[#11382B]/25'
                  : 'hover:bg-[#F8F7F4] border border-transparent'
              }`}
            >
              <Users className="w-4 h-4 text-[#11382B] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#11382B] flex items-center justify-between gap-2">
                  <span>Modo Colaborador</span>
                  {!isGestorActive && <Check className="w-3.5 h-3.5 text-[#11382B]" />}
                </p>
                <p className="text-[11px] text-[#1C2421]/65 leading-snug mt-0.5">
                  Apenas visualizar e interagir com conteúdos após login e senha.
                </p>
              </div>
            </button>

            {canUseGestorMode && (
              <>
                <div className="border-t border-[#1C2421]/10 my-1" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onOpenManagerOptions();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#11382B] hover:bg-[#F8F7F4] transition-colors text-left"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A467]" />
                  Opções do Gestor (Nome e Foto)
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onOpenGovernance();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#11382B] hover:bg-[#F8F7F4] transition-colors text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A467]" />
                  Política de Acesso &amp; Equipe
                </button>
              </>
            )}

            <div className="border-t border-[#1C2421]/10 my-1" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Conta (Voltar para Login)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
