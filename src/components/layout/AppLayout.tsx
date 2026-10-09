import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  ClipboardCheck, 
  ClipboardList, 
  Award, 
  Activity, 
  DollarSign, 
  Bell, 
  BookOpen, 
  Users, 
  UserRound, 
  Package, 
  CalendarDays, 
  ScrollText, 
  Settings, 
  Menu, 
  X, 
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Trophy,
  LogIn,
  RefreshCw,
  UserCheck,
  Building2,
  Clock,
  Layers,
  FilePlus2,
  Calendar,
  Database
} from 'lucide-react';
import { useBjj } from '../../context/BjjContext';
import { BeltBadge } from '../ui/BeltBadge';
import { LoginModal } from '../auth/LoginModal';

interface NavSubItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  highlight?: boolean;
}

interface NavSection {
  id: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavSubItem[];
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { students, payments, notifications, currentUser, switchUser, allUsers, academySettings } = useBjj();

  // Collapsible state for submenus
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    visao_geral: true,
    cadastros: true,
    tatame: true,
    equipe: true,
    financeiro: true,
    eventos: true,
    sistema: false
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Metrics for badges
  const studentsEligibleForPromotion = students.filter(s => s.presencasNaFaixa >= s.presencasMetaGrau).length;
  const overduePayments = payments.filter(p => p.status === 'atrasado').length;
  const pendingNotifs = notifications.filter(n => n.statusEnvio === 'agendado').length;

  // Role-based grouped navigation sections
  const getNavSections = (): NavSection[] => {
    if (currentUser.role === 'aluno') {
      return [
        {
          id: 'meu_portal',
          category: 'Meu Espaço',
          icon: UserRound,
          items: [
            {
              title: "Meu Portal (Área do Aluno)",
              url: "/area-aluno",
              icon: UserRound,
              highlight: true
            },
            {
              title: "Painel de Eventos",
              url: "/eventos",
              icon: Trophy
            }
          ]
        },
        {
          id: 'treino_conhecimento',
          category: 'Treino & Tatame',
          icon: ClipboardCheck,
          items: [
            {
              title: "Minha Presença & Aulas",
              url: "/presenca",
              icon: ClipboardCheck
            },
            {
              title: "Biblioteca de Técnicas",
              url: "/biblioteca",
              icon: BookOpen
            }
          ]
        },
        {
          id: 'loja',
          category: 'Loja da Academia',
          icon: Package,
          items: [
            {
              title: "Kimonos & Equipamentos",
              url: "/produtos",
              icon: Package
            }
          ]
        }
      ];
    }

    if (currentUser.role === 'professor') {
      return [
        {
          id: 'visao_geral',
          category: 'Visão Geral',
          icon: BarChart3,
          items: [
            {
              title: "Dashboard do Tatame",
              url: "/",
              icon: BarChart3
            }
          ]
        },
        {
          id: 'cadastros',
          category: 'Central de Cadastros',
          icon: FilePlus2,
          items: [
            {
              title: "Cadastros & Formulários",
              url: "/cadastros",
              icon: FilePlus2,
              highlight: true
            }
          ]
        },
        {
          id: 'tatame',
          category: 'Tatame & Aulas',
          icon: ClipboardCheck,
          items: [
            {
              title: "Presença do Dia",
              url: "/presenca",
              icon: ClipboardCheck
            },
            {
              title: "Planejamento de Aulas",
              url: "/planejamento",
              icon: ClipboardList
            },
            {
              title: "Biblioteca de Técnicas",
              url: "/biblioteca",
              icon: BookOpen
            },
            {
              title: "Relatório de Aulas",
              url: "/relatorio-aulas",
              icon: ScrollText
            }
          ]
        },
        {
          id: 'equipe',
          category: 'Alunos & Graduação',
          icon: Users,
          items: [
            {
              title: "Meus Alunos Vinculados",
              url: "/equipe",
              icon: Users
            },
            {
              title: "Sistema de Graduação",
              url: "/graduacao",
              icon: Award,
              badgeCount: studentsEligibleForPromotion > 0 ? studentsEligibleForPromotion : undefined
            },
            {
              title: "Desempenho & Métricas",
              url: "/metricas",
              icon: Activity
            }
          ]
        },
        {
          id: 'financeiro',
          category: 'Financeiro & Vendas',
          icon: DollarSign,
          items: [
            {
              title: "Minhas Mensalidades (PIX)",
              url: "/financeiro",
              icon: DollarSign,
              badgeCount: overduePayments > 0 ? overduePayments : undefined
            },
            {
              title: "Vendas & Estoque",
              url: "/produtos",
              icon: Package
            }
          ]
        },
        {
          id: 'eventos',
          category: 'Eventos & Relatórios',
          icon: Trophy,
          items: [
            {
              title: "Painel de Eventos",
              url: "/eventos",
              icon: Trophy
            },
            {
              title: "Relatórios dos Alunos",
              url: "/relatorios",
              icon: BarChart3
            }
          ]
        },
        {
          id: 'sistema',
          category: 'Sistema',
          icon: Settings,
          items: [
            {
              title: "Configurações da Academia",
              url: "/configuracoes",
              icon: Settings
            },
            {
              title: "Notificações",
              url: "/notificacoes",
              icon: Bell
            }
          ]
        }
      ];
    }

    // Admin: Full access with organized sections
    return [
      {
        id: 'visao_geral',
        category: 'Visão Geral',
        icon: BarChart3,
        items: [
          {
            title: "Dashboard Geral",
            url: "/",
            icon: BarChart3
          }
        ]
      },
      {
        id: 'cadastros',
        category: 'Central de Cadastros',
        icon: FilePlus2,
        items: [
          {
            title: "Todos os Cadastros",
            url: "/cadastros",
            icon: FilePlus2,
            highlight: true
          }
        ]
      },
      {
        id: 'tatame',
        category: 'Tatame & Aulas',
        icon: ClipboardCheck,
        items: [
          {
            title: "Presença do Dia",
            url: "/presenca",
            icon: ClipboardCheck
          },
          {
            title: "Planejamento de Aulas",
            url: "/planejamento",
            icon: ClipboardList
          },
          {
            title: "Biblioteca de Técnicas",
            url: "/biblioteca",
            icon: BookOpen
          },
          {
            title: "Relatório de Aulas",
            url: "/relatorio-aulas",
            icon: ScrollText
          }
        ]
      },
      {
        id: 'equipe',
        category: 'Equipe & Graduação',
        icon: Users,
        items: [
          {
            title: "Alunos & Matrículas",
            url: "/equipe",
            icon: Users
          },
          {
            title: "Professores & Mestre",
            url: "/professores",
            icon: UserRound
          },
          {
            title: "Sistema de Graduação",
            url: "/graduacao",
            icon: Award,
            badgeCount: studentsEligibleForPromotion > 0 ? studentsEligibleForPromotion : undefined,
            highlight: studentsEligibleForPromotion > 0
          },
          {
            title: "Desempenho & Métricas",
            url: "/metricas",
            icon: Activity
          }
        ]
      },
      {
        id: 'financeiro',
        category: 'Financeiro & Loja',
        icon: DollarSign,
        items: [
          {
            title: "Financeiro & Mensalidades",
            url: "/financeiro",
            icon: DollarSign,
            badgeCount: overduePayments > 0 ? overduePayments : undefined
          },
          {
            title: "Loja & Produtos",
            url: "/produtos",
            icon: Package
          }
        ]
      },
      {
        id: 'eventos',
        category: 'Eventos & Relatórios',
        icon: Trophy,
        items: [
          {
            title: "Painel de Eventos",
            url: "/eventos",
            icon: Trophy
          },
          {
            title: "Relatórios Gerais",
            url: "/relatorios",
            icon: BarChart3
          },
          {
            title: "Relatório Anual",
            url: "/relatorio-anual",
            icon: CalendarDays
          }
        ]
      },
      {
        id: 'sistema',
        category: 'Sistema & Configurações',
        icon: Settings,
        items: [
          {
            title: "Configurações da Academia",
            url: "/configuracoes",
            icon: Settings
          },
          {
            title: "Banco de Dados & Supabase",
            url: "/configuracoes?tab=supabase",
            icon: Database
          },
          {
            title: "Notificações & Lembretes",
            url: "/notificacoes",
            icon: Bell,
            badgeCount: pendingNotifs > 0 ? pendingNotifs : undefined
          }
        ]
      }
    ];
  };

  const navSections = getNavSections();

  const isActive = (url: string) => {
    if (url === '/') return location.pathname === '/' || location.pathname === '/Dashboard' || location.pathname === '/dashboard';
    if (url.includes('?')) {
      const currentFull = `${location.pathname}${location.search}`.toLowerCase();
      return currentFull === url.toLowerCase();
    }
    const cleanPath = location.pathname.toLowerCase();
    const cleanUrl = url.toLowerCase();
    return (cleanPath === cleanUrl || cleanPath === cleanUrl.replace('/', '')) && (!location.search || url !== '/configuracoes');
  };

  // Auto-expand section if currently active route is inside it
  useEffect(() => {
    navSections.forEach(section => {
      const hasActive = section.items.some(item => isActive(item.url));
      if (hasActive) {
        setOpenSections(prev => ({ ...prev, [section.id]: true }));
      }
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex w-full bg-slate-100/70 text-slate-900 font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop & Mobile Drawer */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out no-print
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link to={currentUser.role === 'aluno' ? '/area-aluno' : '/'} className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-red-600/30 font-black text-white text-lg tracking-wider shrink-0">
              BJJ
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white truncate block">
                  {academySettings.nomeAcademia || 'BJJ FLOW'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Mestre {academySettings.mestreResponsavel || 'Carlos Mikalkenas'}
              </p>
            </div>
          </Link>

          <button 
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Banner / Switcher in Sidebar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
              {currentUser.role === 'admin' ? '👑 Administrador' :
               currentUser.role === 'professor' ? '🥋 Professor' :
               '🥇 Praticante / Aluno'}
            </span>
            <p className="font-bold text-white truncate text-xs">{currentUser.nome}</p>
          </div>

          <button
            onClick={() => setLoginModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-bold text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 transition-colors"
            title="Trocar perfil de acesso (Admin / Professor / Aluno)"
          >
            <RefreshCw className="w-3 h-3" /> Trocar
          </button>
        </div>

        {/* Nav Links with Menus & Submenus */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {navSections.map((section) => {
            const isOpen = openSections[section.id] ?? true;
            const hasActiveChild = section.items.some(i => isActive(i.url));

            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header / Accordion trigger */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                    hasActiveChild ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <section.icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{section.category}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>

                {/* Submenu Items */}
                {isOpen && (
                  <div className="space-y-0.5 pl-2">
                    {section.items.map((item) => {
                      const active = isActive(item.url);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.title}
                          to={item.url}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                            active 
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                              : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}`} />
                            <span className="truncate">{item.title}</span>
                          </div>

                          {item.badgeCount !== undefined && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-xs shrink-0 ${
                              item.highlight 
                                ? 'bg-amber-400 text-amber-950 animate-bounce' 
                                : 'bg-red-500 text-white'
                            }`}>
                              {item.badgeCount}
                            </span>
                          )}

                          {item.highlight && !item.badgeCount && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-xs" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active User Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {currentUser.nome.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{currentUser.nome}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={() => setLoginModalOpen(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Trocar login / nível"
            >
              <LogIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-72 min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Breadcrumb / Academy Label */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-900 hidden sm:inline">
                {academySettings.nomeAcademia}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-500 font-medium">
                Mestre {academySettings.mestreResponsavel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Link to Cadastros Hub */}
            <Link
              to="/cadastros"
              className="hidden sm:flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <FilePlus2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Novo Cadastro</span>
            </Link>

            {/* User profile capsule in topbar */}
            <div 
              onClick={() => setLoginModalOpen(true)}
              className="cursor-pointer flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 px-3 py-1.5 rounded-xl transition-all"
              title="Clique para alternar o nível de usuário (Admin / Professor / Aluno)"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                {currentUser.role === 'admin' ? 'A' : currentUser.role === 'professor' ? 'P' : 'AL'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{currentUser.nome.split(' ')[0]}</span>
                <span className="text-[10px] text-slate-500 block uppercase leading-tight font-semibold">{currentUser.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Page Body */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Login / Role Switching Modal */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </div>
  );
};
