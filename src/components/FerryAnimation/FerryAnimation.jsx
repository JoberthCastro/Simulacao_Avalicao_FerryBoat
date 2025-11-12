import { useEffect, useMemo, useRef, useState } from 'react';
import { compareReservationVsNoReservation, robustFerryMetrics } from '../../utils/simulation';
import './FerryAnimation.css';

function FerryAnimation({
  height = 160,
  speedSeconds = 12,
  lambda = 120, // veículos/hora
  mu = 25,      // veículos/hora por servidor
  servers = 4,  // número de servidores (ferries)
  simMinutesPerSecond = 8, // aceleração do tempo da simulação
  active = false,
  reservationRate = 0.3,
  peakHours = false,
  capacityPerFerry = 50,
  cycleMinutes = 120,
  scheduledMode = false,
  scheduleGapMinutes = 120,
  variant = 'public', // 'public' | 'admin'
}) {
  const [src, setSrc] = useState('/ferrybot.png');
  const [showSvg, setShowSvg] = useState(false);
  const styleVars = { '--ferry-speed': `${speedSeconds}s` };
  const [queueCount, setQueueCount] = useState(0);
  const [serverStates, setServerStates] = useState(() =>
    Array.from({ length: Math.max(1, servers) }, () => ({ busy: false, remaining: 0, pulse: false }))
  );
  const tickRef = useRef(null);
  const lastServersRef = useRef(servers);

  // Util helpers
  const sampleExponentialMinutes = useMemo(() => {
    const ratePerMinute = mu / 60; // serviços por minuto
    return () => {
      const u = Math.random();
      const minutes = -Math.log(1 - u) / Math.max(ratePerMinute, 1e-6);
      return Math.max(0.1, minutes);
    };
  }, [mu]);

  const samplePoisson = (mean) => {
    // Knuth's algorithm for small integers
    const L = Math.exp(-mean);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return Math.max(0, k - 1);
  };

  // Resize servers array if prop changes
  useEffect(() => {
    if (servers !== lastServersRef.current) {
      lastServersRef.current = servers;
      setServerStates((prev) => {
        const next = Array.from({ length: Math.max(1, servers) }, (_, i) => prev[i] || { busy: false, remaining: 0, pulse: false });
        return next;
      });
    }
  }, [servers]);

  // Main simulation loop (discrete time) - only when active
  useEffect(() => {
    if (!active || lambda <= 0 || mu <= 0) {
      tickRef.current && clearInterval(tickRef.current);
      // reset visuals when not active
      setQueueCount(0);
      setServerStates((prev) => prev.map(() => ({ busy: false, remaining: 0, pulse: false })));
      return;
    }
    const tickMs = 500;
    const dtMinutes = (simMinutesPerSecond * tickMs) / 1000;

    tickRef.current && clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      // arrivals
      const arrivalsPerMinute = lambda / 60;
      const expectedArrivals = arrivalsPerMinute * dtMinutes;
      const arrivals = samplePoisson(expectedArrivals);

      setQueueCount((q) => q + arrivals);

      setServerStates((states) => {
        // deep copy
        const next = states.map((s) => ({ ...s, pulse: false }));

        // advance service times and release finished
        for (const s of next) {
          if (s.busy) {
            s.remaining -= dtMinutes;
            if (s.remaining <= 0) {
              s.busy = false;
              s.remaining = 0;
              s.pulse = true; // trigger small pulse to indicate departure
            }
          }
        }

        // start service on idle servers
        setQueueCount((q) => {
          let availableQueue = q;
          for (const s of next) {
            if (!s.busy && availableQueue > 0) {
              s.busy = true;
              s.remaining = sampleExponentialMinutes();
              availableQueue -= 1;
            }
          }
          return availableQueue;
        });

        return next;
      });
    }, tickMs);

    return () => {
      tickRef.current && clearInterval(tickRef.current);
    };
  }, [active, lambda, mu, servers, simMinutesPerSecond, sampleExponentialMinutes]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      tickRef.current && clearInterval(tickRef.current);
    };
  }, []);

  // Insights
  const comparison = useMemo(() => {
    if (variant === 'public') {
      return compareReservationVsNoReservation({
        lambda,
        mu,
        servers,
        reservationRate,
        peakHours,
        capacityPerFerry,
        cycleMinutes,
        scheduledMode,
        scheduleGapMinutes,
      });
    }
    return null;
  }, [variant, lambda, mu, servers, reservationRate, peakHours, capacityPerFerry, cycleMinutes, scheduledMode, scheduleGapMinutes]);

  const adminMetrics = useMemo(() => {
    if (variant !== 'admin') return null;
    return robustFerryMetrics(lambda, mu, servers, { capacityPerFerry, cycleMinutes });
  }, [variant, lambda, mu, servers, capacityPerFerry, cycleMinutes]);

  const toInsight = (m) => {
    const utilizationPct = Math.max(0, Math.min(100, (m.utilization || 0) * 100));
    let status = 'Tranquilo';
    if (utilizationPct >= 85) status = 'Crítico';
    else if (utilizationPct >= 60) status = 'Movimento';
    let tip = 'Boa janela para viajar.';
    if (status === 'Movimento') tip = 'Chegue com antecedência.';
    if (status === 'Crítico') tip = 'Considere reservar.';
    return {
      waitMinutes: (m.waitTime || 0),
      utilizationPct,
      queueLength: (m.queueLength || 0),
      status,
      tip,
    };
  };
  const insightsNo = useMemo(() => (comparison ? toInsight(comparison.withoutReservation || {}) : null), [comparison]);
  const insightsYes = useMemo(() => (comparison ? toInsight(comparison.withReservation || {}) : null), [comparison]);
  const insightsAdmin = useMemo(() => (adminMetrics ? toInsight(adminMetrics) : null), [adminMetrics]);

  return (
    <div className={`ferry-animation ${active ? 'active' : ''}`} style={{ height, ...styleVars }}>
      <div className="sky" />
      <div className="sea">
        <div className="wave wave-1" />
        <div className="wave wave-2" />
      </div>

      <div className="dock" aria-hidden="true">
        <div className="dock-pier" />
      </div>

      {!showSvg && (
        <img
          className="ferry-boat"
          src={src}
          alt="Ferry chegando ao terminal"
          onError={() => {
            if (src !== '/ferrybot.jpg') {
              setSrc('/ferrybot.jpg');
            } else {
              setShowSvg(true);
            }
          }}
          draggable="false"
        />
      )}

      {showSvg && (
        <svg
          className="ferry-boat-svg"
          viewBox="0 0 300 140"
          aria-label="Ferry chegando ao terminal"
          role="img"
        >
          <g>
            <rect x="40" y="68" width="190" height="36" rx="6" fill="#ffffff" stroke="#1f2937" strokeWidth="3" />
            <rect x="60" y="48" width="90" height="22" rx="4" fill="#cfe8ff" stroke="#1f2937" strokeWidth="3" />
            <rect x="155" y="56" width="26" height="14" rx="2" fill="#cfe8ff" stroke="#1f2937" strokeWidth="3" />
            <rect x="186" y="56" width="20" height="14" rx="2" fill="#cfe8ff" stroke="#1f2937" strokeWidth="3" />
            <polygon points="30,92 240,92 220,120 10,120" fill="#2563eb" />
            <circle cx="85" cy="98" r="6" fill="#1f2937" />
            <circle cx="115" cy="98" r="6" fill="#1f2937" />
            <circle cx="145" cy="98" r="6" fill="#1f2937" />
            <circle cx="175" cy="98" r="6" fill="#1f2937" />
          </g>
        </svg>
      )}

      <div className="mmc-overlay">
        <div className="queue-visual" aria-label="Fila de veículos">
          {Array.from({ length: Math.min(queueCount, 24) }, (_, i) => (
            <div key={i} className="car" />
          ))}
          {queueCount > 24 && <div className="more-cars">+{queueCount - 24}</div>}
        </div>
        <div className="servers-visual" aria-label="Servidores (ferries)">
          {serverStates.map((s, idx) => (
            <div key={idx} className={`server-slot ${s.busy ? 'busy' : ''} ${s.pulse ? 'pulse' : ''}`}>
              <div className="server-label">F{idx + 1}</div>
              <div className="server-status">{s.busy ? 'Em serviço' : 'Livre'}</div>
            </div>
          ))}
        </div>
      </div>

      {variant === 'public' && insightsNo && insightsYes && (
        <div className="insight-panel dual" role="status" aria-live="polite">
          <div className="insight-col">
            <div className="insight-title">Sem Agendamento</div>
            <div className={`status-badge ${insightsNo.status === 'Crítico' ? 'critical' : insightsNo.status === 'Movimento' ? 'warn' : 'ok'}`}>
              {insightsNo.status}
            </div>
            <div className="insight-items">
              <div className="insight-item">
                <span>Espera</span>
                <strong>{insightsNo.waitMinutes.toFixed(1)} min</strong>
              </div>
              <div className="insight-item">
                <span>Ocupação</span>
                <strong>{insightsNo.utilizationPct.toFixed(0)}%</strong>
              </div>
              <div className="insight-tip">{insightsNo.tip}</div>
            </div>
          </div>
          <div className="divider" />
          <div className="insight-col">
            <div className="insight-title">Com Agendamento</div>
            <div className={`status-badge ${insightsYes.status === 'Crítico' ? 'critical' : insightsYes.status === 'Movimento' ? 'warn' : 'ok'}`}>
              {insightsYes.status}
            </div>
            <div className="insight-items">
              <div className="insight-item">
                <span>Espera</span>
                <strong>{insightsYes.waitMinutes.toFixed(1)} min</strong>
              </div>
              <div className="insight-item">
                <span>Ocupação</span>
                <strong>{insightsYes.utilizationPct.toFixed(0)}%</strong>
              </div>
              <div className="insight-tip">{insightsYes.tip}</div>
            </div>
          </div>
        </div>
      )}

      {variant === 'admin' && insightsAdmin && (
        <div className="insight-panel single" role="status" aria-live="polite">
          <div className="insight-col">
            <div className="insight-title">Operação</div>
            <div className={`status-badge ${insightsAdmin.status === 'Crítico' ? 'critical' : insightsAdmin.status === 'Movimento' ? 'warn' : 'ok'}`}>
              {insightsAdmin.status}
            </div>
            <div className="insight-items">
              <div className="insight-item">
                <span>Espera</span>
                <strong>{insightsAdmin.waitMinutes.toFixed(1)} min</strong>
              </div>
              <div className="insight-item">
                <span>Ocupação</span>
                <strong>{insightsAdmin.utilizationPct.toFixed(0)}%</strong>
              </div>
              <div className="insight-tip">{insightsAdmin.tip}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FerryAnimation;


