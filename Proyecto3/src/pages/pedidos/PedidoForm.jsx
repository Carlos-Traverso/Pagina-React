import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal, Button, Alerta } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { calcularTotal } from '../../utils/formatters';

export const PedidoForm = ({ onClose }) => {
  const { state: { clientes, productos, stock }, crearPedido } = useApp();
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState([]);
  const [notas, setNotas] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [busquedaProd, setBusquedaProd] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cliente = clientes.find(c => c.id === clienteId);

  const stockMap = useMemo(() => Object.fromEntries(
    stock.map(s => [s.producto_id, s.cantidad_disponible - s.cantidad_reservada])
  ), [stock]);

  const prodsFiltrados = useMemo(() =>
    productos.filter(p => p.activo && p.nombre.toLowerCase().includes(busquedaProd.toLowerCase())),
  [productos, busquedaProd]);

  const agregarProducto = (prod) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.producto_id === prod.id);
      if (idx >= 0) {
        return prev.map((i, n) => n === idx ? { ...i, cantidad: i.cantidad + 1, subtotal: i.precio_unitario_snapshot * (i.cantidad + 1) } : i);
      }
      return [...prev, { id: crypto.randomUUID(), producto_id: prod.id, cantidad: 1, precio_unitario_snapshot: prod.precio_unitario, subtotal: prod.precio_unitario }];
    });
    setBusquedaProd('');
  };

  const cambiarCantidad = (itemId, cantidad) => {
    const n = parseInt(cantidad);
    if (isNaN(n) || n < 1) return;
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, cantidad: n, subtotal: i.precio_unitario_snapshot * n } : i));
  };

  const eliminarItem = (itemId) => setItems(prev => prev.filter(i => i.id !== itemId));

  const total = useMemo(() => calcularTotal(items, cliente?.descuento_porcentaje ?? 0), [items, cliente]);

  const tieneItemsSinStock = items.some(i => (stockMap[i.producto_id] ?? 0) < i.cantidad);

  const handleGuardar = (estadoFinal) => {
    if (!clienteId) return setError('Seleccioná un cliente.');
    if (items.length === 0) return setError('Agregá al menos un producto.');
    setError('');
    setGuardando(true);
    crearPedido({
      cliente_id: clienteId,
      items,
      estado: estadoFinal,
      notas,
      fecha_entrega_estimada: new Date(fechaEntrega).toISOString(),
    });
    setTimeout(() => { setGuardando(false); onClose(); }, 200);
  };

  return (
    <Modal open onClose={onClose} title="Nuevo Pedido" width="680px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Cliente */}
        <div>
          <label className="input-label">Cliente *</label>
          <select className="input-field" value={clienteId} onChange={e => setClienteId(e.target.value)}>
            <option value="">— Seleccioná un cliente —</option>
            {clientes.filter(c => c.activo).map(c => (
              <option key={c.id} value={c.id}>{c.nombre} ({c.tipo}{c.descuento_porcentaje > 0 ? ` · ${c.descuento_porcentaje}% desc.` : ''})</option>
            ))}
          </select>
        </div>

        {/* Fecha de entrega */}
        <div>
          <label className="input-label">Fecha de entrega estimada</label>
          <input type="date" className="input-field" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} />
        </div>

        {/* Buscador de productos */}
        <div>
          <label className="input-label">Agregar Producto</label>
          <input
            className="input-field"
            placeholder="Buscar producto..."
            value={busquedaProd}
            onChange={e => setBusquedaProd(e.target.value)}
          />
          {busquedaProd && (
            <div style={{ marginTop: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
              {prodsFiltrados.map(p => {
                const disponible = stockMap[p.id] ?? 0;
                return (
                  <div key={p.id} onClick={() => agregarProducto(p)} style={{ padding: '0.625rem 0.875rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>{p.nombre}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatCurrency(p.precio_unitario)}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: disponible < 10 ? '#ef4444' : '#10b981', alignSelf: 'center' }}>
                      {disponible} u
                    </span>
                  </div>
                );
              })}
              {prodsFiltrados.length === 0 && <p style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin resultados</p>}
            </div>
          )}
        </div>

        {/* Tabla de items */}
        {items.length > 0 && (
          <div>
            <label className="input-label">Productos seleccionados</label>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              {items.map((item, idx) => {
                const prod = productos.find(p => p.id === item.producto_id);
                const sinStock = (stockMap[item.producto_id] ?? 0) < item.cantidad;
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: idx < items.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500 }}>{prod?.nombre}</p>
                      {sinStock && <p style={{ margin: 0, fontSize: '0.72rem', color: '#ef4444' }}>⚠ Stock insuficiente</p>}
                    </div>
                    <input
                      type="number" min="1"
                      value={item.cantidad}
                      onChange={e => cambiarCantidad(item.id, e.target.value)}
                      style={{ width: 70, padding: '0.35rem 0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontFamily: 'inherit', textAlign: 'center', fontSize: '0.875rem' }}
                    />
                    <span style={{ width: 90, textAlign: 'right', fontWeight: 600, fontSize: '0.875rem' }}>{formatCurrency(item.subtotal)}</span>
                    <button onClick={() => eliminarItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0.25rem' }}>✕</button>
                  </div>
                );
              })}
            </div>

            {/* Resumen */}
            <div style={{ marginTop: '0.75rem', padding: '0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {cliente?.descuento_porcentaje > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  <span className="text-secondary">Descuento ({cliente.descuento_porcentaje}%)</span>
                  <span style={{ color: '#10b981' }}>
                    - {formatCurrency(items.reduce((a, i) => a + i.subtotal, 0) - total)}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--brand-primary)' }}>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="input-label">Notas (opcional)</label>
          <textarea className="input-field" rows={2} placeholder="Instrucciones de entrega, horarios, etc." value={notas} onChange={e => setNotas(e.target.value)} />
        </div>

        {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.875rem' }}>{error}</div>}

        {tieneItemsSinStock && (
          <div style={{ padding: '0.75rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', color: '#fcd34d', fontSize: '0.875rem' }}>
            ⚠️ Algunos productos no tienen stock suficiente. Podés guardar como borrador.
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          {tieneItemsSinStock ? (
            <Button variant="primary" onClick={() => handleGuardar('borrador')} disabled={guardando}>
              💾 Guardar Borrador
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => handleGuardar('borrador')} disabled={guardando}>
                💾 Borrador
              </Button>
              <Button variant="primary" onClick={() => handleGuardar('confirmado')} disabled={guardando}>
                ✅ Confirmar Pedido
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
