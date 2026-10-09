import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Trash2, 
  Heart,
  ShieldAlert,
  Upload,
  UserRound,
  FileSpreadsheet
} from 'lucide-react';
import { useBjj } from '../context/BjjContext';
import { BeltBadge } from '../components/ui/BeltBadge';
import { Student, BeltColor, PlanType, PaymentStatus } from '../types';
import { BatchUploadModal } from '../components/import/BatchUploadModal';
import { StudentPdfReportModal } from '../components/report/StudentPdfReportModal';
import { StudentProfileModal } from '../components/student/StudentProfileModal';
import { FileText, Activity } from 'lucide-react';

export const Equipe: React.FC = () => {
  const { students, instructors, addStudent, deleteStudent, currentUser, academySettings } = useBjj();

  const isProfessor = currentUser.role === 'professor';
  const myInstructorRecord = instructors.find(i => i.id === currentUser.professorId || i.nome.toLowerCase() === currentUser.nome.toLowerCase());

  const [search, setSearch] = useState('');
  const [filterFaixa, setFilterFaixa] = useState('all');
  const [filterPlano, setFilterPlano] = useState('all');
  const [filterProfessor, setFilterProfessor] = useState(isProfessor ? (myInstructorRecord?.id || currentUser.professorId || 'all') : 'all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [reportStudent, setReportStudent] = useState<Student | null>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  // Form state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('2000-01-01');
  const [faixa, setFaixa] = useState<BeltColor>('branca');
  const [graus, setGraus] = useState<number>(0);
  const [plano, setPlano] = useState<PlanType>('regular');
  const [valorMensalidade, setValorMensalidade] = useState<number>(180);
  const [diaVencimento, setDiaVencimento] = useState<number>(10);
  const [tamanhoKimono, setTamanhoKimono] = useState('A2');
  const [pesoKg, setPesoKg] = useState<number>(75);
  const [turmaPreferida, setTurmaPreferida] = useState('Jiu-Jitsu Noturno (Todos os Níveis)');
  const [professorId, setProfessorId] = useState(isProfessor ? (myInstructorRecord?.id || currentUser.professorId || instructors[0]?.id) : (instructors[0]?.id || ''));
  const [obsMedicas, setObsMedicas] = useState('');

  const filteredStudents = students.filter(s => {
    // If logged in as professor, only show students linked to own name/id
    if (isProfessor) {
      const isMine = s.professorId === currentUser.professorId || 
                     s.professorId === myInstructorRecord?.id || 
                     (s.professorNome && s.professorNome.toLowerCase() === currentUser.nome.toLowerCase());
      if (!isMine) return false;
    }

    const matchesSearch = s.nome.toLowerCase().includes(search.toLowerCase()) || 
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.professorNome && s.professorNome.toLowerCase().includes(search.toLowerCase()));
    const matchesFaixa = filterFaixa === 'all' || s.faixa === filterFaixa;
    const matchesPlano = filterPlano === 'all' || s.plano === filterPlano;
    const matchesProfessor = isProfessor ? true : (filterProfessor === 'all' || s.professorId === filterProfessor);
    return matchesSearch && matchesFaixa && matchesPlano && matchesProfessor;
  });

  const handlePlanoChange = (p: PlanType) => {
    setPlano(p);
    if (p === 'regular') setValorMensalidade(180);
    else if (p === 'infantil') setValorMensalidade(130);
    else if (p === 'bolsista') setValorMensalidade(70);
    else if (p === 'projeto_social') setValorMensalidade(0);
  };

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const targetProf = instructors.find(i => i.id === professorId) || instructors[0];

    addStudent({
      nome,
      email,
      telefone,
      dataNascimento,
      dataInicio: todayStr,
      faixa,
      graus,
      dataUltimaGraduacao: todayStr,
      presencasMetaGrau: 40,
      plano,
      valorMensalidade,
      diaVencimento,
      statusPagamento: (plano === 'projeto_social' ? 'isento' : 'pendente') as PaymentStatus,
      tamanhoKimono,
      pesoKg,
      turmaPreferida,
      professorId: targetProf?.id,
      professorNome: targetProf?.nome,
      observacoesMedicas: obsMedicas
    });

    setShowAddModal(false);
    setNome('');
    setEmail('');
    setTelefone('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            {isProfessor ? 'Área Docente • Alunos Vinculados' : 'Quadro Geral de Atletas'}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isProfessor ? `Alunos do Professor ${currentUser.nome}` : 'Equipe de Alunos & Praticantes'}
          </h1>
          <p className="text-sm text-slate-500">
            {isProfessor 
              ? `Você possui ${filteredStudents.length} alunos sob sua responsabilidade. As mensalidades destes alunos são pagas diretamente a você via PIX.`
              : 'Ficha cadastral completa, vínculo com professor responsável e importação em lote por planilha.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            Upload Lista de Alunos (CSV)
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Aluno
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Professor Filter */}
          {!isProfessor ? (
            <select
              value={filterProfessor}
              onChange={(e) => setFilterProfessor(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-700"
            >
              <option value="all">Todos os Professores</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>
                  Prof. {i.nome}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <UserRound className="w-3.5 h-3.5" />
              Seus Alunos ({filteredStudents.length})
            </div>
          )}

          {/* Belt Filter */}
          <select
            value={filterFaixa}
            onChange={(e) => setFilterFaixa(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-700"
          >
            <option value="all">Todas as Faixas</option>
            <option value="branca">Branca</option>
            <option value="cinza">Cinza (Kids)</option>
            <option value="amarela">Amarela (Kids)</option>
            <option value="laranja">Laranja (Kids)</option>
            <option value="verde">Verde (Kids/Juv)</option>
            <option value="azul">Azul</option>
            <option value="roxa">Roxa</option>
            <option value="marrom">Marrom</option>
            <option value="preta">Preta</option>
          </select>

          {/* Plan Filter */}
          <select
            value={filterPlano}
            onChange={(e) => setFilterPlano(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-700"
          >
            <option value="all">Todos os Planos</option>
            <option value="regular">Regulares</option>
            <option value="infantil">Infantil</option>
            <option value="bolsista">Bolsista</option>
            <option value="projeto_social">Projeto Social</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Total listado: <strong className="text-slate-900">{filteredStudents.length} alunos</strong>
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div 
            key={student.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {student.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{student.nome}</h3>
                    <div className="mt-1">
                      <BeltBadge faixa={student.faixa} graus={student.graus} size="sm" />
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  student.plano === 'regular' ? 'bg-blue-50 text-blue-700' :
                  student.plano === 'infantil' ? 'bg-amber-50 text-amber-800' :
                  student.plano === 'bolsista' ? 'bg-purple-50 text-purple-800' :
                  'bg-emerald-50 text-emerald-800'
                }`}>
                  {student.plano.replace('_', ' ')}
                </span>
              </div>

              {/* Responsible Professor Badge */}
              <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <UserRound className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-slate-600 text-[11px]">Professor Responsável:</span>
                </div>
                <span className="font-bold text-blue-900 text-[11px]">
                  {student.professorNome || academySettings.mestreResponsavel || 'Mestre Responsável'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>{student.totalPresencasHistorico} presenças totais no tatame</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 flex justify-between">
                <span>Kimono: <strong>{student.tamanhoKimono}</strong> ({student.pesoKg}kg)</span>
                <span>Mensalidade: <strong>R$ {student.valorMensalidade}</strong></span>
              </div>

              {student.observacoesMedicas && (
                <div className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-[10px] text-rose-800 flex items-start gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{student.observacoesMedicas}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Início: {new Date(student.dataInicio).toLocaleDateString('pt-BR')}
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setProfileStudent(student)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs"
                  title="Abrir ficha completa e avaliações pedagógicas do aluno"
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ficha & Avaliação</span>
                </button>

                <button
                  onClick={() => setReportStudent(student)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-xl transition-all shadow-2xs"
                  title="Gerar e enviar relatório pedagógico em PDF para o aluno"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => deleteStudent(student.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors hover:bg-rose-50"
                  title="Remover Aluno"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Profile & Evaluation Modal */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileStudent(null)}
          onOpenPdfReport={(st) => {
            setProfileStudent(null);
            setReportStudent(st);
          }}
        />
      )}

      {/* Student PDF Report Modal */}
      {reportStudent && (
        <StudentPdfReportModal
          student={reportStudent}
          onClose={() => setReportStudent(null)}
        />
      )}

      {/* Modal Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 text-xs my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Cadastrar Novo Aluno</h3>
                <p className="text-xs text-slate-500">Matrícula no tatame com graduação e professor responsável</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Pedro Henrique Souza"
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Professor Responsável (Recebe a Mensalidade)
                </label>
                <select
                  value={professorId}
                  onChange={(e) => setProfessorId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-semibold text-blue-900 bg-blue-50/40"
                >
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>
                      Prof. {i.nome} ({i.faixa} {i.graus}º grau) - PIX: {i.chavePix}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full border border-slate-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aluno@email.com"
                    className="w-full border border-slate-300 rounded-lg p-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Faixa Atual</label>
                  <select
                    value={faixa}
                    onChange={(e) => setFaixa(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 capitalize font-semibold"
                  >
                    <option value="branca">Branca</option>
                    <option value="cinza">Cinza (Kids)</option>
                    <option value="amarela">Amarela (Kids)</option>
                    <option value="laranja">Laranja (Kids)</option>
                    <option value="verde">Verde (Kids/Juv)</option>
                    <option value="azul">Azul</option>
                    <option value="roxa">Roxa</option>
                    <option value="marrom">Marrom</option>
                    <option value="preta">Preta</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Graus (0 a 4)</label>
                  <select
                    value={graus}
                    onChange={(e) => setGraus(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value={0}>0 Grau</option>
                    <option value={1}>1º Grau</option>
                    <option value={2}>2º Grau</option>
                    <option value={3}>3º Grau</option>
                    <option value={4}>4º Grau</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria de Plano</label>
                  <select
                    value={plano}
                    onChange={(e) => handlePlanoChange(e.target.value as PlanType)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
                  >
                    <option value="regular">Regular</option>
                    <option value="infantil">Infantil</option>
                    <option value="bolsista">Bolsista</option>
                    <option value="projeto_social">Projeto Social</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mensalidade (R$)</label>
                  <input
                    type="number"
                    value={valorMensalidade}
                    onChange={(e) => setValorMensalidade(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={diaVencimento}
                    onChange={(e) => setDiaVencimento(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tamanho Kimono</label>
                  <input
                    type="text"
                    value={tamanhoKimono}
                    onChange={(e) => setTamanhoKimono(e.target.value)}
                    placeholder="A1, A2, M2"
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={pesoKg}
                    onChange={(e) => setPesoKg(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nascimento</label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observações Médicas ou Articulares</label>
                <input
                  type="text"
                  placeholder="Ex: Cirurgia de menisco em 2022 ou nenhuma restrição"
                  value={obsMedicas}
                  onChange={(e) => setObsMedicas(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Confirmar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Upload Modal */}
      {showUploadModal && (
        <BatchUploadModal
          type="students"
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};
