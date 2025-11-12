import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarRange, BarChart3, MessageSquare } from 'lucide-react';
import { useFerry } from '../../context/FerryContext';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import NotificationCard from '../../components/NotificationCard/NotificationCard';
import './Home.css';

function Home() {
  const { notifications } = useFerry();

  return (
    <div className="home">
      <section className="py-10 md:py-14 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold text-ocean-300 tracking-tight"
        >
          Bem-vindo ao FerryBot
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hero-subtitle text-slate-600 mt-3"
        >
          Sistema inteligente de gestão de travessias com simulações em tempo real
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hero-actions mt-6 flex gap-3 justify-center flex-wrap"
        >
          <Link to="/agendamento">
            <Button variant="primary" className="hero-button">
              Agendar Viagem
            </Button>
          </Link>
          <Link to="/simulacao">
            <Button variant="secondary" className="hero-button">
              Simular Tempo de Espera
            </Button>
          </Link>
        </motion.div>
      </section>

      <section className="features">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Agendamento Inteligente',
              desc: 'Reserve sua viagem com antecedência e evite filas',
              to: '/agendamento',
              icon: <CalendarRange className="text-ocean-300" size={28} />
            },
            {
              title: 'Simulação em Tempo Real',
              desc: 'Veja quanto tempo você vai esperar antes de viajar',
              to: '/simulacao',
              icon: <BarChart3 className="text-ocean-300" size={28} />
            },
            {
              title: 'Relatos e Feedback',
              desc: 'Compartilhe sua experiência e ajude a melhorar o serviço',
              to: '/relatos',
              icon: <MessageSquare className="text-ocean-300" size={28} />
            }
          ].map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-white rounded-xl shadow-float hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                {c.icon}
                <h3 className="text-lg font-semibold text-slate-800">{c.title}</h3>
              </div>
              <p className="text-slate-600 mb-4">{c.desc}</p>
              <Link to={c.to}>
                <Button variant="secondary" className="feature-button w-full">
                  Acessar
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {notifications.length > 0 && (
        <section className="notifications-section mt-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Notificações</h2>
          <div className="notifications-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.map(notification => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;

