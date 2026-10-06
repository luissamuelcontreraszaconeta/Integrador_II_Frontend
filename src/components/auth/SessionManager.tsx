import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

export const SessionManager: React.FC = () => {
  const { isAuthenticated, sessionPolicy, keepAlive, logout } = useAuth();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [isExtending, setIsExtending] = useState(false);

  const lastActivityTimeRef = useRef<number>(Date.now());
  const lastKeepAlivePingRef = useRef<number>(Date.now());

  // Derive idle timeout and warning duration from dynamic policy
  const idleTimeoutMinutes = sessionPolicy?.idleTimeoutMinutes || 30;
  const warningBeforeMinutes = sessionPolicy?.warningBeforeMinutes || 2;

  const idleTimeoutMs = idleTimeoutMinutes * 60 * 1000;
  const warningThresholdMs = (idleTimeoutMinutes - warningBeforeMinutes) * 60 * 1000;

  // Record user activity
  const handleUserActivity = useCallback(() => {
    lastActivityTimeRef.current = Date.now();

    // If modal is not open, throttle periodic keepAlive to backend every 3 minutes
    const now = Date.now();
    if (!showWarningModal && now - lastKeepAlivePingRef.current > 3 * 60 * 1000) {
      lastKeepAlivePingRef.current = now;
      keepAlive();
    }
  }, [showWarningModal, keepAlive]);

  // Attach activity event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    let throttleTimeout: any = null;

    const throttledHandler = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleUserActivity();
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach((evt) => window.addEventListener(evt, throttledHandler, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, throttledHandler));
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isAuthenticated, handleUserActivity]);

  // Main session check interval (runs every second)
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarningModal(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedIdleMs = now - lastActivityTimeRef.current;

      // 1. Session completely expired by idle timeout
      if (elapsedIdleMs >= idleTimeoutMs) {
        setShowWarningModal(false);
        logout('Tu sesión expiró por inactividad.');
        return;
      }

      // 2. Session entered warning window
      if (elapsedIdleMs >= warningThresholdMs) {
        const remainingMs = idleTimeoutMs - elapsedIdleMs;
        const remSec = Math.max(0, Math.ceil(remainingMs / 1000));
        setSecondsRemaining(remSec);
        setShowWarningModal(true);
      } else {
        if (showWarningModal) {
          setShowWarningModal(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, idleTimeoutMs, warningThresholdMs, showWarningModal, logout]);

  // Extend session action
  const handleContinueSession = async () => {
    try {
      setIsExtending(true);
      const success = await keepAlive();
      if (success) {
        lastActivityTimeRef.current = Date.now();
        lastKeepAlivePingRef.current = Date.now();
        setShowWarningModal(false);
      } else {
        logout('Tu sesión expiró.');
      }
    } catch {
      logout('Tu sesión expiró.');
    } finally {
      setIsExtending(false);
    }
  };

  const handleManualLogout = () => {
    setShowWarningModal(false);
    logout();
  };

  if (!isAuthenticated || !showWarningModal) {
    return null;
  }

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-5 animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto text-2xl shadow-xs">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            Aviso de Inactividad
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-2">
            Tu sesión está por finalizar
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Por motivos de seguridad, tu sesión se cerrará automáticamente si no realizas ninguna acción.
          </p>
        </div>

        {/* Countdown Timer Display */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Tiempo restante
          </span>
          <div className="text-3xl font-mono font-bold text-slate-900 tracking-wider">
            {formattedTime}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Política de rol: {sessionPolicy?.role || 'USUARIO'} ({idleTimeoutMinutes} min)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleManualLogout}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-sm transition-all flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Cerrar sesión</span>
          </button>

          <button
            type="button"
            onClick={handleContinueSession}
            disabled={isExtending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isExtending ? 'animate-spin' : ''}`} />
            <span>{isExtending ? 'Extendiendo...' : 'Continuar sesión'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
