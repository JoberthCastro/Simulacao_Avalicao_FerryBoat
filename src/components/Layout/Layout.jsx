import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [logoSrc, setLogoSrc] = useState('/ferrybot.png');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="header backdrop-blur bg-white/70 border-b border-ocean-50">
        <div className="container flex items-center">
          <Link to="/" className="logo" aria-label="FerryBot - Início">
            <img
              src={logoSrc}
              alt="FerryBot logo"
              className="logo-img"
              onError={(e) => {
                if (logoSrc !== '/ferrybot.jpg') {
                  setLogoSrc('/ferrybot.jpg');
                } else {
                  e.currentTarget.style.display = 'none';
                }
              }}
            />
          </Link>
          <button
            className="menu-btn"
            aria-label="Abrir navegação"
            onClick={() => setMenuOpen(o => !o)}
          >
            ☰
          </button>
          <nav className={`nav ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)}>
            {!isAdmin ? (
              <>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                  Início
                </Link>
                <Link to="/simulacao" className={location.pathname === '/simulacao' ? 'active' : ''}>
                  Simulação
                </Link>
                <Link to="/agendamento" className={location.pathname === '/agendamento' ? 'active' : ''}>
                  Agendamento
                </Link>
                <Link to="/agendamentos" className={location.pathname === '/agendamentos' ? 'active' : ''}>
                  Meus Agendamentos
                </Link>
                <Link to="/relatos" className={location.pathname === '/relatos' ? 'active' : ''}>
                  Relatos
                </Link>
                <Link to="/admin/dashboard" className="admin-link">
                  Admin
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                  Dashboard
                </Link>
                <Link to="/admin/simulacao" className={location.pathname === '/admin/simulacao' ? 'active' : ''}>
                  Simulação
                </Link>
                <Link to="/admin/what-if" className={location.pathname === '/admin/what-if' ? 'active' : ''}>
                  Simulação Inteligente
                </Link>
                <Link to="/admin/manutencao" className={location.pathname === '/admin/manutencao' ? 'active' : ''}>
                  Manutenção
                </Link>
                <Link to="/admin/relatos" className={location.pathname === '/admin/relatos' ? 'active' : ''}>
                  Relatos
                </Link>
                <Link to="/" className="public-link">
                  Público
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} FerryBot - Sistema de Gestão de Ferry</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;

