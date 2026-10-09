import React, { useState } from 'react';
import { ShieldCheck, UserRound, Award, Users, Key, LogIn, CheckCircle2, X } from 'lucide-react';
import { useBjj } from '../../context/BjjContext';
import { BeltBadge } from '../ui/BeltBadge';
import { DEMO_USERS } from '../../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, currentUser, switchUser, loginWithEmail } = useBjj();
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginWithEmail(emailInput);
    if (success) {
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg('E-mail não encontrado entre os usuários cadastrados.');
    }
  };

  const handleSelectDemoUser = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-950 text-white p-6 relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg font-black text-white text-xl">
              BJJ
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Login de Acesso • BJJ Flow</h2>
              <p className="text-xs text-slate-400">
                Selecione o nível de permissão ou acesse com seu e-mail
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* 3 Levels Description */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Selecione o Perfil de Demonstração (3 Níveis):
            </span>

            {/* Level 1: Administrador */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                1. Nível Administrador (Acesso Total)
              </span>

              {allUsers.filter(u => u.role === 'admin').map(user => (
                <button
                  key={user.id}
                  onClick={() => handleSelectDemoUser(user.id)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                    currentUser.id === user.id 
                      ? 'bg-red-50/70 border-red-300 ring-2 ring-red-400/20 shadow-xs' 
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center border-2 border-red-600">
                      ADM
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{user.nome}</p>
                      <p className="text-[11px] text-slate-500">Mestre Responsável • Acesso total à academia e finanças</p>
                    </div>
                  </div>

                  {currentUser.id === user.id && (
                    <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Ativo
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Level 2: Professores */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <UserRound className="w-3.5 h-3.5 text-blue-600" />
                2. Nível Professores (Seus Alunos, Suas Mensalidades & Eventos)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allUsers.filter(u => u.role === 'professor').map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectDemoUser(user.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      currentUser.id === user.id 
                        ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400/20 shadow-xs' 
                        : 'hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{user.nome}</p>
                      <p className="text-[10px] text-slate-500">Instrutor Oficial</p>
                    </div>

                    {currentUser.id === user.id ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <span className="text-[11px] text-blue-600 font-bold">Entrar →</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Level 3: Alunos */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                3. Nível Alunos (Portal do Praticante, Desempenho, Mensalidade & Inscrição em Eventos)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {allUsers.filter(u => u.role === 'aluno').map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectDemoUser(user.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      currentUser.id === user.id 
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs' 
                        : 'hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-bold text-xs text-slate-900 truncate">{user.nome}</p>
                      <p className="text-[10px] text-slate-500 capitalize">Faixa {user.faixa}</p>
                    </div>

                    {currentUser.id === user.id ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold shrink-0">Entrar →</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Email Login Box */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Ou entrar com e-mail cadastrado:
            </span>

            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="Ex: admin@bjjflow.com.br ou gabriel.pires@gmail.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" /> Entrar
              </button>
            </form>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
