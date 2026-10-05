export interface PublicTraceabilityData {
  valid: boolean;
  codigo: string;
  producto: string;
  especie: string;
  fechaProduccion: string;
  volumen: number;
  unidad: string;
  plantaProcesamiento: string;
  proveedor: string;
  embarcacion: string;
  puertoOrigen: string;
  estadoCalidad: string;
  estadoCadenaFrio: string;
  documentacionCompleta: boolean;
  estadoCertificacion: string;
  numeroCertificadoSanitario?: string;
  estadoGeneral: string;
  ultimaActualizacion: string;
  qrToken: string;
}
