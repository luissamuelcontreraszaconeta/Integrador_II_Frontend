import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Lot, ProductionInfo, QAInspection } from '../types/lot';
import { SanitaryCertificate } from '../types/certification';
import { AuditLog } from '../types/user';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

interface LotContextType {
  lots: Lot[];
  loading: boolean;
  auditLogs: AuditLog[];
  refreshData: () => Promise<void>;
  getLotById: (id: string) => Lot | undefined;
  createLot: (prodInfo: Omit<ProductionInfo, 'registrationDate'>) => Promise<Lot>;
  updateQAInspection: (lotId: string, qaData: QAInspection) => Promise<Lot>;
  addColdChainLog: (lotId: string, temp: number, location: string, obs?: string) => Promise<Lot>;
  runValidation: (lotId: string) => Promise<Lot>;
  initiateCertification: (lotId: string) => Promise<SanitaryCertificate>;
  approveCertification: (certId: string) => Promise<SanitaryCertificate>;
  authorizeDispatch: (
    lotId: string,
    dispatchData: {
      destinationCountry: string;
      destinationPort: string;
      containerNumber: string;
      sealNumber: string;
      shippingLine: string;
      estimatedDeparture: string;
    }
  ) => Promise<Lot>;
  getCertificate: (certId: string) => Promise<SanitaryCertificate | null>;
}

const LotContext = createContext<LotContextType | undefined>(undefined);

export const LotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [lots, setLots] = useState<Lot[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedLots = await apiService.getLots();
      const fetchedLogs = await apiService.getAuditLogs();
      setLots(fetchedLots);
      setAuditLogs(fetchedLogs);
    } catch (error) {
      console.error('Error cargando lotes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const getLotById = (id: string) => {
    return lots.find((l) => l.id === id || l.code === id);
  };

  const userName = currentUser?.name || 'Usuario ExporTrace';

  const createLot = async (prodInfo: Omit<ProductionInfo, 'registrationDate'>) => {
    const newLot = await apiService.createLot(prodInfo, userName);
    await refreshData();
    return newLot;
  };

  const updateQAInspection = async (lotId: string, qaData: QAInspection) => {
    const updated = await apiService.updateQAInspection(lotId, qaData, userName);
    await refreshData();
    return updated;
  };

  const addColdChainLog = async (lotId: string, temp: number, location: string, obs?: string) => {
    const updated = await apiService.addColdChainLog(lotId, temp, location, userName, obs);
    await refreshData();
    return updated;
  };

  const runValidation = async (lotId: string) => {
    const updated = await apiService.runSmartValidation(lotId, userName);
    await refreshData();
    return updated;
  };

  const initiateCertification = async (lotId: string) => {
    const cert = await apiService.initiateSanitaryCertification(lotId, userName);
    await refreshData();
    return cert;
  };

  const approveCertification = async (certId: string) => {
    const cert = await apiService.approveSanitaryCertificate(certId, userName);
    await refreshData();
    return cert;
  };

  const authorizeDispatch = async (
    lotId: string,
    dispatchData: {
      destinationCountry: string;
      destinationPort: string;
      containerNumber: string;
      sealNumber: string;
      shippingLine: string;
      estimatedDeparture: string;
    }
  ) => {
    const updated = await apiService.authorizeDispatch(lotId, dispatchData, userName);
    await refreshData();
    return updated;
  };

  const getCertificate = async (certId: string) => {
    return await apiService.getCertificateById(certId);
  };

  return (
    <LotContext.Provider
      value={{
        lots,
        loading,
        auditLogs,
        refreshData,
        getLotById,
        createLot,
        updateQAInspection,
        addColdChainLog,
        runValidation,
        initiateCertification,
        approveCertification,
        authorizeDispatch,
        getCertificate,
      }}
    >
      {children}
    </LotContext.Provider>
  );
};

export const useLots = () => {
  const context = useContext(LotContext);
  if (!context) {
    throw new Error('useLots debe ser usado dentro de un LotProvider');
  }
  return context;
};
