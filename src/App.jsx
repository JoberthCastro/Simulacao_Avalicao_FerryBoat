import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FerryProvider } from './context/FerryContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Simulacao from './pages/Simulacao/Simulacao';
import SimulacaoPublic from './pages/SimulacaoPublic/SimulacaoPublic';
import Agendamento from './pages/Agendamento/Agendamento';
import Relatos from './pages/Relatos/Relatos';
import MeusAgendamentos from './pages/MeusAgendamentos/MeusAgendamentos';
import AdminDashboard from './pages/Admin/AdminDashboard/AdminDashboard';
import AdminManutencao from './pages/Admin/AdminManutencao/AdminManutencao';
import AdminSimulacao from './pages/Admin/AdminSimulacao/AdminSimulacao';
import AdminRelatos from './pages/Admin/AdminRelatos/AdminRelatos';
import AdminRoute from './components/RouteGuards/AdminRoute';
import AdminLogin from './pages/Admin/AdminLogin/AdminLogin';

function App() {
  return (
    <FerryProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulacao" element={<SimulacaoPublic />} />
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/agendamentos" element={<MeusAgendamentos />} />
            <Route path="/relatos" element={<Relatos />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/manutencao" element={<AdminRoute><AdminManutencao /></AdminRoute>} />
            <Route path="/admin/simulacao" element={<AdminRoute><AdminSimulacao /></AdminRoute>} />
            <Route path="/admin/what-if" element={<AdminRoute><Simulacao /></AdminRoute>} />
            <Route path="/admin/relatos" element={<AdminRoute><AdminRelatos /></AdminRoute>} />
          </Routes>
        </Layout>
      </Router>
    </FerryProvider>
  );
}

export default App;

