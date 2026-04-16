// =========================================
// Utilidades puras (sin React, fáciles de testear)
// =========================================

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
};

export const formatDateShort = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' }).format(new Date(dateStr));
};

export const generarNumeroPedido = (totalActual) => {
  const año = new Date().getFullYear();
  const numero = String(totalActual + 1).padStart(4, '0');
  return `PED-${año}-${numero}`;
};

export const calcularTotal = (items, descuentoPorcentaje) => {
  const subtotal = items.reduce((acc, item) => acc + (item.precio_unitario_snapshot * item.cantidad), 0);
  return subtotal * (1 - (descuentoPorcentaje || 0) / 100);
};

export const isSameDay = (dateStr1, dateStr2) => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export const subDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

export const startOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const getDiaSemana = (dateStr) => {
  return DIAS_SEMANA[new Date(dateStr).getDay()];
};
