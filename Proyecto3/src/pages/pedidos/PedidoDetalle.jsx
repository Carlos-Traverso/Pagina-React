import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EstadoBadge, Button, Alerta } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TRANSICIONES_VALIDAS, ESTADO_LABELS } from '../../constants/estados';
import './Pedidos.css';

export const PedidoDetalle = ({ pedido, onClose }) => {
  const { state: { clientes, productos, stock }, cambiarEstadoPedido } = useApp();
  const [cambiando, setCambiando] = useState(false);

  const cliente = clientes.find(c => c.id === pedido.cliente_id);
  const transicionesValidas = TRANSICIONES_VALIDAS[pedido.estado] ?? [];

  const handleCambiarEstado = async (nuevoEstado) => {
    setCambiando(true);
    cambiarEstadoPedido(pedido.id, nuevoEstado);
    setTimeout(() => { setCambiando(false); onClose(); }, 300);
  };

  return (
    <div className="detalle-overlay" onClick={onClose}>
      <div className="detalle-panel" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="detalle-header">
          <div>
            <span className="detalle-numero">{pedido.numero}</span>
            <EstadoBadge estado={pedido.estado} />
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="detalle-body">
          {/* Info cliente */}
          <div className="detalle-section">
            <h3>Cliente</h3>
            <p className="font-medium" style={{ color: 'var(--text-primary)', margin: '0.25rem 0' }}>
              {cliente?.nombre ?? '—'}
            </p>
            <p className="text-sm text-secondary">{cliente?.email} · {cliente?.telefono}</p>
            {cliente?.descuento_porcentaje > 0 && (
              <span className="descuento-badge">Descuento: {cliente.descuento_porcentaje}%</span>
            )}
          </div>

          {/* Fechas */}
          <div className="detalle-section detalle-fechas">
            <div>
              <span className="detalle-label">Creado</span>
              <span>{formatDate(pedido.fecha_creacion)}</span>
            </div>
            <div>
              <span className="detalle-label">Entrega est.</span>
              <span>{formatDate(pedido.fecha_entrega_estimada)}</span>
            </div>
            {pedido.fecha_entrega_real && (
              <div>
                <span className="detalle-label">Entrega real</span>
                <span style={{ color: '#10b981' }}>{formatDate(pedido.fecha_entrega_real)}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="detalle-section">
            <h3>Productos</h3>
            <div className="detalle-items">
              {pedido.items.map(item => {
                const prod = productos.find(p => p.id === item.producto_id);
                return (
                  <div key={item.id} className="detalle-item">
                    <div>
                      <p className="font-medium" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                        {prod?.nombre ?? item.producto_id}
                      </p>
                      <p className="text-sm text-muted">{formatCurrency(item.precio_unitario_snapshot)} × {item.cantidad} u</p>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="detalle-totales">
              <div className="detalle-total-row">
                <span className="text-secondary">Subtotal</span>
                <span>{formatCurrency(pedido.items.reduce((a, i) => a + i.subtotal, 0))}</span>
              </div>
              {pedido.descuento_aplicado > 0 && (
                <div className="detalle-total-row">
                  <span style={{ color: '#10b981' }}>Descuento ({pedido.descuento_aplicado}%)</span>
                  <span style={{ color: '#10b981' }}>
                    - {formatCurrency(pedido.items.reduce((a, i) => a + i.subtotal, 0) - pedido.total)}
                  </span>
                </div>
              )}
              <div className="detalle-total-row detalle-total-final">
                <span>Total</span>
                <span>{formatCurrency(pedido.total)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {pedido.notas && (
            <div className="detalle-section">
              <h3>Notas</h3>
              <p className="text-secondary" style={{ fontSize: '0.875rem' }}>{pedido.notas}</p>
            </div>
          )}

          {/* Acciones de estado */}
          {transicionesValidas.length > 0 && (
            <div className="detalle-section">
              <h3>Cambiar Estado</h3>
              <div className="detalle-acciones">
                {transicionesValidas.map(e => (
                  <Button
                    key={e}
                    variant={e === 'cancelado' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => handleCambiarEstado(e)}
                    disabled={cambiando}
                  >
                    → {ESTADO_LABELS[e]}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
