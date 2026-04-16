import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Modal } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';

export const StockPage = () => {
  const { state: { productos, stock }, ingresarStock, actualizarStockMinimo } = useApp();
  const [modal, setModal] = useState(null); // { prod, s }
  const [cantidad, setCantidad] = useState('');
  const [minimo, setMinimo] = useState('');
  const [tab, setTab] = useState('todos'); // 'todos' | 'critico' | 'ok'

  const getStockItem = (prodId) => stock.find(s => s.producto_id === prodId);

  const rows = productos
    .filter(p => p.activo)
    .map(p => {
      const s = getStockItem(p.id) ?? { cantidad_disponible: 0, cantidad_reservada: 0, cantidad_minima: 10 };
      const libre = s.cantidad_disponible - s.cantidad_reservada;
      return { p, s, libre, critico: libre < s.cantidad_minima };
    })
    .filter(r => {
      if (tab === 'critico') return r.critico;
      if (tab === 'ok') return !r.critico;
      return true;
    });

  const criticoCount = rows.filter(r => r.critico).length;

  const handleIngresar = () => {
    if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) return;
    ingresarStock(modal.s.producto_id, Number(cantidad));
    if (minimo && !isNaN(minimo)) actualizarStockMinimo(modal.s.producto_id, Number(minimo));
    setModal(null); setCantidad(''); setMinimo('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>Stock</h1>
          <p className="text-secondary">Inventario de productos</p>
        </div>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total productos', value: productos.filter(p => p.activo).length, color: '#3b82f6', icon: '🍝' },
          { label: 'Stock crítico', value: productos.filter(p => { const s = getStockItem(p.id); return s ? (s.cantidad_disponible - s.cantidad_reservada) < s.cantidad_minima : false; }).length, color: '#ef4444', icon: '⚠️' },
          { label: 'Unidades disponibles', value: stock.reduce((a, s) => a + (s.cantidad_disponible - s.cantidad_reservada), 0), color: '#10b981', icon: '📦' },
        ].map(m => (
          <Card key={m.label} style={{ '--accent': m.color }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.75rem', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${m.color} 15%, transparent)`, borderRadius: 10 }}>{m.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</p>
                <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: m.color }}>{m.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {[['todos', 'Todos'], ['critico', `⚠️ Crítico (${criticoCount})`], ['ok', '✅ Normal']].map(([key, label]) => (
          <button key={key} className={`filter-tab ${tab === key ? 'filter-tab--active' : ''}`} onClick={() => setTab(key)}
            style={{ filter: tab !== key && key === 'critico' && criticoCount > 0 ? 'none' : undefined }}>
            {label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px 130px 110px 80px', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span>Producto</span><span>Disponible</span><span>Reservado</span><span>Libre</span><span>Mínimo</span><span></span>
        </div>
        {rows.map(({ p, s, libre, critico }) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px 130px 110px 80px', padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center', fontSize: '0.875rem', background: critico ? 'rgba(239,68,68,0.04)' : 'transparent', transition: 'background 0.15s' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500 }}>{p.nombre}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.codigo}</p>
            </div>
            <span style={{ color: 'var(--text-primary)' }}>{s.cantidad_disponible} u</span>
            <span style={{ color: s.cantidad_reservada > 0 ? '#f59e0b' : 'var(--text-muted)' }}>{s.cantidad_reservada} u</span>
            <span style={{ fontWeight: 700, color: critico ? '#ef4444' : libre < s.cantidad_minima * 1.5 ? '#f59e0b' : '#10b981' }}>
              {critico && '⚠ '}{libre} u
            </span>
            <span className="text-secondary">{s.cantidad_minima} u</span>
            <button className="btn btn--primary btn--sm" onClick={() => { setModal({ prod: p, s }); setMinimo(String(s.cantidad_minima)); }}>
              + Ingreso
            </button>
          </div>
        ))}
      </div>

      {/* Modal ingreso */}
      {modal && (
        <Modal open onClose={() => { setModal(null); setCantidad(''); setMinimo(''); }} title={`Ingreso de Stock — ${modal.prod.nombre}`} width="420px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Stock actual libre: <strong style={{ color: 'var(--text-primary)' }}>{modal.s.cantidad_disponible - modal.s.cantidad_reservada} u</strong>
              </p>
            </div>
            <div>
              <label className="input-label">Cantidad a ingresar *</label>
              <input className="input-field" type="number" min={1} value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Ej: 50" autoFocus />
            </div>
            <div>
              <label className="input-label">Stock mínimo (actual: {modal.s.cantidad_minima})</label>
              <input className="input-field" type="number" min={0} value={minimo} onChange={e => setMinimo(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => { setModal(null); setCantidad(''); setMinimo(''); }}>Cancelar</Button>
              <Button variant="primary" onClick={handleIngresar} disabled={!cantidad || Number(cantidad) <= 0}>
                ✅ Registrar Ingreso
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
