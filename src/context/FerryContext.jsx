import { createContext, useContext, useState, useCallback } from 'react';

const FerryContext = createContext();

export function FerryProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [reports, setReports] = useState([]);
  const [ferries, setFerries] = useState([
    { id: 1, name: 'Ferry 1', trips: 450, status: 'OK' },
    { id: 2, name: 'Ferry 2', trips: 620, status: 'Atenção' },
    { id: 3, name: 'Ferry 3', trips: 380, status: 'OK' },
    { id: 4, name: 'Ferry 4', trips: 890, status: 'Risco de falha' }
  ]);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'delay',
      message: 'Embarcação atrasada em 15 minutos',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'maintenance',
      message: 'Manutenção programada para amanhã às 10h',
      timestamp: new Date()
    }
  ]);

  const addBooking = useCallback((booking) => {
    const newBooking = {
      id: Date.now(),
      ...booking,
      createdAt: new Date().toISOString()
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  }, []);

  const addReport = useCallback((report) => {
    const newReport = {
      id: Date.now(),
      ...report,
      status: 'pendente',
      createdAt: new Date().toISOString()
    };
    setReports(prev => [...prev, newReport]);
    return newReport;
  }, []);

  const updateReportStatus = useCallback((reportId, status) => {
    setReports(prev =>
      prev.map(report =>
        report.id === reportId ? { ...report, status } : report
      )
    );
  }, []);

  const updateFerryStatus = useCallback((ferryId, updates) => {
    setFerries(prev =>
      prev.map(ferry =>
        ferry.id === ferryId ? { ...ferry, ...updates } : ferry
      )
    );
  }, []);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const getAvailability = useCallback((date, time) => {
    // Mock: retorna disponibilidade baseada em horário
    const hour = new Date(`${date}T${time}`).getHours();
    const isPeak = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
    
    const totalCapacity = 4 * 50; // 4 ferries * 50 veículos
    const booked = bookings.filter(b => 
      b.date === date && 
      Math.abs(new Date(`2000-01-01T${b.time}`).getHours() - hour) < 2
    ).length;
    
    const available = totalCapacity - booked;
    const percentage = (available / totalCapacity) * 100;
    
    return {
      available,
      total: totalCapacity,
      percentage,
      isPeak,
      status: percentage > 50 ? 'disponível' : percentage > 20 ? 'limitado' : 'lotado'
    };
  }, [bookings]);

  const value = {
    bookings,
    reports,
    ferries,
    notifications,
    addBooking,
    addReport,
    updateReportStatus,
    updateFerryStatus,
    addNotification,
    removeNotification,
    getAvailability
  };

  return (
    <FerryContext.Provider value={value}>
      {children}
    </FerryContext.Provider>
  );
}

export function useFerry() {
  const context = useContext(FerryContext);
  if (!context) {
    throw new Error('useFerry must be used within FerryProvider');
  }
  return context;
}

