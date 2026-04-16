import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, EstadoBadge, Button } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ESTADO_LABELS, TRANSICIONES_VALIDAS } from '../../constants/estados';

const ESTADOS_PRODUCCION = ['confirmado', 'en_produccion', 'listo', 'despachado'];

export const ProduccionPage = () => {
  const { state: { pedidos, clientes, productos }, cambiarEstadoPedido } = useApp();

  const pedidosActivos = useMemo(() =>
    pedidos
      .filter(p => ESTADOS_PRODUCCION.includes(p.estado))
      .sort((a, b) => new Date(a.fecha_entrega_estimada) - new Date(b.fecha_entrega_estimada)),
  [pedidos]);

  const columnas = ESTADOS_PRODUCCION.map(estado => ({
    estado,
    pedidos: pedidosActivos.filter(p => p.estado === estado),
  }));

  const ESTADO_ICONS = {
    confirmado: '📋',
    en_produccion: '⚙️',
    listo: '✅',
    despachado: '🚚',
  };

  const ESTADO_COLORES_BORDER = {
    confirmado: '#3b82f6',
    en_produccion: '#f59e0b',
    listo: '#8b5cf6',
    despachado: '#06b6d4',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>Producción</h1>
          <p className="text-secondary">Vista Kanban de pedidos activos</p>
        </div>
        <div style={{ padding: '0.4rem 0.875rem', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: '#fb923c' }}>
          {pedidosActivos.length} pedidos activos
        </div>
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'start' }}>
        {columnas.map(({ estado, pedidos: peds }) => (
          <div key={estado} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Column header */}
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${ESTADO_COLORES_BORDER[estado]}40`, borderTop: `3px solid ${ESTADO_COLORES_BORDER[estado]}`, borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {ESTADO_ICONS[estado]} {ESTADO_LABELS[estado]}
              </span>
              <span style={{ background: `${ESTADO_COLORES_BORDER[estado]}25`, color: ESTADO_COLORES_BORDER[estado], borderRadius: '99px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                {peds.length}
              </span>
            </div>

            {/* Cards */}
            {peds.length === 0 && (
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Sin pedidos
              </div>
            )}
            {peds.map(p => {
              const cliente = clientes.find(c => c.id === p.cliente_id);
              const transiciones = TRANSICIONES_VALIDAS[p.estado] ?? [];
              const hoy = new Date();
              const entrega = new Date(p.fecha_entrega_estimada);
              const diasRestantes = Math.ceil((entrega - hoy) / (1000 * 60 * 60 * 24));
              const urgente = diasRestantes <= 1;

              return (
                <div key={p.id} style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${urgente ? '#ef444440' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                  display: 'flex', flexDirection: 'column', gap: '0.625rem',
                  boxShadow: urgente ? '0 0 0 1px rgba(239,68,68,0.2)' : 'none',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{p.numero}</span>
                    {urgente && <span style={{ fontSize: '0.7rem', color: '#ef4444', background: 'rgba(239,68,68,0.12)', padding: '0.1rem 0.4rem', borderRadius: '99px', border: '1px solid rgba(239,68,68,0.3)' }}>URGENTE</span>}
                  </div>

                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{cliente?.nombre ?? '—'}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {p.items.slice(0, 2).map(item => {
                      const prod = productos.find(pr => pr.id === item.producto_id);
                      return (
                        <p key={item.id} style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          · {prod?.nombre ?? item.producto_id} × {item.cantidad}
                        </p>
                      );
                    })}
                    {p.items.length > 2 && <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>+ {p.items.length - 2} más</p>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.75rem', color: urgente ? '#ef4444' : 'var(--text-muted)' }}>
                      📅 {formatDate(p.fecha_entrega_estimada)}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{formatCurrency(p.total)}</span>
                  </div>

                  {/* Botones de transición */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {transiciones.filter(t => t !== 'cancelado').map(sig => (
                      <button key={sig}
                        onClick={() => cambiarEstadoPedido(p.id, sig)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer', border: `1px solid ${ESTADO_COLORES_BORDER[sig] ?? '#10b981'}40`, borderRadius: '99px', background: `${ESTADO_COLORES_BORDER[sig] ?? '#10b981'}15`, color: ESTADO_COLORES_BORDER[sig] ?? '#10b981', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        → {ESTADO_LABELS[sig]}
                      </button>
                    ))}
                    {transiciones.includes('cancelado') && (
                      <button onClick={() => { if (confirm('¿Cancelar este pedido?')) cambiarEstadoPedido(p.id, 'cancelado'); }}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '99px', background: 'rgba(239,68,68,0.08)', color: '#f87171', transition: 'all 0.15s' }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {pedidosActivos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏭</p>
          <p style={{ fontSize: '1rem', fontWeight: 600 }}>No hay pedidos activos en producción</p>
        </div>
      )}
    </div>
  );
};
