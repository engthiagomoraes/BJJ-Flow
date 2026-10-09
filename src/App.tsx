/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BjjProvider } from './context/BjjContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Presenca } from './pages/Presenca';
import { Planejamento } from './pages/Planejamento';
import { Graduacao } from './pages/Graduacao';
import { Metricas } from './pages/Metricas';
import { Financeiro } from './pages/Financeiro';
import { Notificacoes } from './pages/Notificacoes';
import { Biblioteca } from './pages/Biblioteca';
import { Equipe } from './pages/Equipe';
import { Professores } from './pages/Professores';
import { Produtos } from './pages/Produtos';
import { Relatorios } from './pages/Relatorios';
import { RelatorioAulas } from './pages/RelatorioAulas';
import { RelatorioAnual } from './pages/RelatorioAnual';
import { Configuracoes } from './pages/Configuracoes';
import { AreaAluno } from './pages/AreaAluno';
import { Eventos } from './pages/Eventos';
import { Cadastros } from './pages/Cadastros';

export default function App() {
  return (
    <BjjProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/Dashboard" element={<Navigate to="/" replace />} />

            <Route path="/cadastros" element={<Cadastros />} />
            <Route path="/Cadastros" element={<Navigate to="/cadastros" replace />} />

            <Route path="/area-aluno" element={<AreaAluno />} />
            <Route path="/AreaAluno" element={<Navigate to="/area-aluno" replace />} />

            <Route path="/eventos" element={<Eventos />} />
            <Route path="/Eventos" element={<Navigate to="/eventos" replace />} />

            <Route path="/presenca" element={<Presenca />} />
            <Route path="/Presenca" element={<Navigate to="/presenca" replace />} />

            <Route path="/planejamento" element={<Planejamento />} />
            <Route path="/Planejamento" element={<Navigate to="/planejamento" replace />} />

            <Route path="/graduacao" element={<Graduacao />} />
            <Route path="/Graduacao" element={<Navigate to="/graduacao" replace />} />

            <Route path="/metricas" element={<Metricas />} />
            <Route path="/Metricas" element={<Navigate to="/metricas" replace />} />

            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/Financeiro" element={<Navigate to="/financeiro" replace />} />

            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/Notificacoes" element={<Navigate to="/notificacoes" replace />} />

            <Route path="/biblioteca" element={<Biblioteca />} />
            <Route path="/Biblioteca" element={<Navigate to="/biblioteca" replace />} />

            <Route path="/equipe" element={<Equipe />} />
            <Route path="/Equipe" element={<Navigate to="/equipe" replace />} />

            <Route path="/professores" element={<Professores />} />
            <Route path="/Professores" element={<Navigate to="/professores" replace />} />

            <Route path="/produtos" element={<Produtos />} />
            <Route path="/Produtos" element={<Navigate to="/produtos" replace />} />

            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/Relatorios" element={<Navigate to="/relatorios" replace />} />

            <Route path="/relatorio-aulas" element={<RelatorioAulas />} />
            <Route path="/RelatorioAulas" element={<Navigate to="/relatorio-aulas" replace />} />

            <Route path="/relatorio-anual" element={<RelatorioAnual />} />
            <Route path="/RelatorioAnual" element={<Navigate to="/relatorio-anual" replace />} />

            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/Configuracoes" element={<Navigate to="/configuracoes" replace />} />

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </BjjProvider>
  );
}
