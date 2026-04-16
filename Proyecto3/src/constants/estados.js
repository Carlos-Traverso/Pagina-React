// =========================================
// Constantes del negocio
// =========================================

export const TRANSICIONES_VALIDAS = {
  borrador:      ['confirmado', 'cancelado'],
  confirmado:    ['en_produccion', 'cancelado'],
  en_produccion: ['listo', 'cancelado'],
  listo:         ['despachado'],
  despachado:    ['entregado'],
  entregado:     [],
  cancelado:     [],
};

export const ESTADO_LABELS = {
  borrador:      'Borrador',
  confirmado:    'Confirmado',
  en_produccion: 'En Producción',
  listo:         'Listo',
  despachado:    'Despachado',
  entregado:     'Entregado',
  cancelado:     'Cancelado',
};

export const ESTADO_COLORES = {
  borrador:      '#6b7280',
  confirmado:    '#3b82f6',
  en_produccion: '#f59e0b',
  listo:         '#8b5cf6',
  despachado:    '#06b6d4',
  entregado:     '#10b981',
  cancelado:     '#ef4444',
};

export const ESTADO_BG = {
  borrador:      'rgba(107,114,128,0.15)',
  confirmado:    'rgba(59,130,246,0.15)',
  en_produccion: 'rgba(245,158,11,0.15)',
  listo:         'rgba(139,92,246,0.15)',
  despachado:    'rgba(6,182,212,0.15)',
  entregado:     'rgba(16,185,129,0.15)',
  cancelado:     'rgba(239,68,68,0.15)',
};

export const TIPO_CLIENTE_LABELS = {
  mayorista:   'Mayorista',
  minorista:   'Minorista',
  restaurante: 'Restaurante',
};

export const CATEGORIA_LABELS = {
  seca:    'Pasta Seca',
  fresca:  'Pasta Fresca',
  rellena: 'Pasta Rellena',
};

export const validarTransicion = (estadoActual, nuevoEstado) => {
  return TRANSICIONES_VALIDAS[estadoActual]?.includes(nuevoEstado) ?? false;
};
