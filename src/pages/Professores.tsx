import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserRound, 
  Award, 
  Phone, 
  Mail, 
  Plus, 
  ShieldCheck, 
  Calendar,
  BookOpen,
  DollarSign,
  Users,
  Copy,
  Check,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { useBjj } from '../context/BjjContext';
import { BeltBadge } from '../components/ui/BeltBadge';
import { BeltColor } from '../types';
import { BatchUploadModal } from '../components/import/BatchUploadModal';

export const Professores: React.FC = () => {
  const { instructors, students, payments } = useBjj();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copiedPixId, setCopiedPixId] = useState<string | null>(null);

  const handleCopyPix = (pix: string, id: string) => {
    navigator.clipboard.writeText(pix);
    setCopiedPixId(id);
    setTimeout(() => setCopiedPixId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <UserRound className="w-4 h-4" />
            Corpo Docente & Gestão de Tatame
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Professores, Mestres & Alunos Vinculados
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhe os alunos sob tutela de cada professor e o repasse direto das mensalidades via PIX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            Importar CSV
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Professor
          </button>
        </div>
      </div>

      {/* Grid of Instructors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.map(prof => {
          const profStudents = students.filter(s => s.professorId === prof.id);
          const profPayments = payments.filter(p => p.professorId === prof.id);
          const totalArrecadado = profPayments
            .filter(p => p.status === 'em_dia')
            .reduce((acc, p) => acc + p.valor, 0);
          const totalPendente = profPayments
            .filter(p => p.status === 'pendente' || p.status === 'atrasado')
            .reduce((acc, p) => acc + p.valor, 0);

          return (
            <div 
              key={prof.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border-2 border-red-600 shrink-0 flex items-center justify-center font-bold text-white shadow-md">
                    {prof.foto ? (
                      <img src={prof.foto} alt={prof.nome} className="w-full h-full object-cover" />
                    ) : (
                      prof.nome.charAt(0)
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">{prof.nome}</h3>
                    <div className="mt-1">
                      <BeltBadge faixa={prof.faixa} graus={prof.graus} size="sm" />
                    </div>
                    <span className="text-[11px] text-blue-600 font-mono font-semibold block mt-1">
                      {prof.registroCBJJ}
                    </span>
                  </div>
                </div>

                {/* PIX Key Box */}
                {prof.chavePix && (
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block">
                      Chave PIX para Mensalidades dos Alunos:
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-950 truncate">
                        {prof.chavePix}
                      </span>
                      <button
                        onClick={() => handleCopyPix(prof.chavePix || '', prof.id)}
                        className="bg-white hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-1 rounded border border-emerald-300 flex items-center gap-1 transition-colors shrink-0"
                      >
                        {copiedPixId === prof.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar PIX
                          </>
                        )}
                      </button>
                    </div>
                    {prof.banco && (
                      <span className="text-[10px] text-slate-500 block">{prof.banco}</span>
                    )}
                  </div>
                )}

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Mensalidades Recebidas</span>
                    <span className="text-base font-black text-emerald-600">
                      R$ {totalArrecadado.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">A Receber</span>
                    <span className="text-base font-black text-amber-600">
                      R$ {totalPendente.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Linked Students List */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Alunos Vinculados ({profStudents.length}):
                    </span>
                    <Link to="/equipe" className="text-blue-600 hover:underline text-[11px]">
                      Ver todos
                    </Link>
                  </div>

                  {profStudents.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">Nenhum aluno vinculado no momento.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {profStudents.map(st => (
                        <span 
                          key={st.id}
                          className="text-[11px] bg-slate-100 text-slate-800 px-2 py-1 rounded-md font-medium flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          {st.nome.split(' ')[0]} ({st.faixa})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                  {prof.bio}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prof.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prof.email}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Habilitado para Graduar
                </span>
                <Link
                  to="/financeiro"
                  className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px]"
                >
                  Financeiro →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Instructor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Novo Professor</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Para cadastrar professores adicionais, cadastre o registro CBJJ e a chave PIX para que os alunos possam efetuar o pagamento das mensalidades diretamente ao responsável.
            </p>

            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showUploadModal && (
        <BatchUploadModal
          type="professors"
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};
