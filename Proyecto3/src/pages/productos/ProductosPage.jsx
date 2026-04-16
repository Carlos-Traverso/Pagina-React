import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Modal, EmptyState } from '../../components/ui';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORIA_LABELS } from '../../constants/estados';

const CAT_COLORES = {
  seca:    { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  fresca:  { bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
  rellena: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
};

const ProductoFormModal = ({ producto, onSave, onClose }) => {
  const [form, setForm] = useState(producto ?? {
    nombre: '', codigo: '', descripcion: '', categoria: 'seca',
    peso_gramos: 500, precio_unitario: 0, costo_produccion: 0, activo: true,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open onClose={onClose} title={producto ? 'Editar Producto' : 'Nuevo Producto'} width="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Nombre *</label>
            <input className="input-field" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Spaghetti 500g" />
          </div>
          <div>
            <label className="input-label">Código SKU</label>
            <input className="input-field" value={form.codigo} onChange={e => set('codigo', e.target.value)} placeholder="SPA-500" />
          </div>
          <div>
            <label className="input-label">Categoría</label>
            <select className="input-field" value={form.categoria} onChange={e => set('categoria', e.target.value)}>
              {Object.entries(CATEGORIA_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Peso (gramos)</label>
            <input className="input-field" type="number" min={0} value={form.peso_gramos} onChange={e => set('peso_gramos', Number(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Precio de venta ($)</label>
            <input className="input-field" type="number" min={0} value={form.precio_unitario} onChange={e => set('precio_unitario', Number(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Costo de producción ($)</label>
            <input className="input-field" type="number" min={0} value={form.costo_produccion} onChange={e => set('costo_produccion', Number(e.target.value))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Descripción</label>
            <textarea className="input-field" rows={2} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => { onSave(form); onClose(); }} disabled={!form.nombre}>
            {producto ? '💾 Guardar' : '✅ Crear Producto'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const ProductosPage = () => {
  const { state: { productos, stock }, crearProducto, actualizarProducto } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [modal, setModal] = useState(null);

  const prodsFiltrados = useMemo(() =>
    productos
      .filter(p => p.activo)
      .filter(p => filtroCategoria === 'todos' || p.categoria === filtroCategoria)
      .filter(p => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())),
  [productos, filtroCategoria, busqueda]);

  const getStock = (id) => {
    const s = stock.find(s => s.producto_id === id);
    return s ? s.cantidad_disponible - s.cantidad_reservada : 0;
  };

  const margen = (p) => p.costo_produccion > 0
    ? (((p.precio_unitario - p.costo_produccion) / p.precio_unitario) * 100).toFixed(0)
    : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>Productos</h1>
          <p className="text-secondary">{productos.filter(p => p.activo).length} productos activos</p>
        </div>
        <Button variant="primary" onClick={() => setModal('nuevo')}>+ Nuevo Producto</Button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['todos', 'seca', 'fresca', 'rellena'].map(t => (
          <button key={t} className={`filter-tab ${filtroCategoria === t ? 'filter-tab--active' : ''}`} onClick={() => setFiltroCategoria(t)}>
            {t === 'todos' ? 'Todas' : CATEGORIA_LABELS[t]}
          </button>
        ))}
        <input className="input-field" style={{ maxWidth: 280, marginLeft: 'auto' }} placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {prodsFiltrados.length === 0 ? (
        <EmptyState icon="🍝" title="No hay productos" description="Crea el primer producto del catálogo." />
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px 100px 80px 60px', padding: '0.75rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Producto</span><span>Categoría</span><span>Precio</span><span>Costo</span><span>Margen</span><span>Stock</span><span></span>
          </div>
          {prodsFiltrados.map(p => {
            const disponible = getStock(p.id);
            const cat = CAT_COLORES[p.categoria];
            const mg = margen(p);
            return (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 110px 110px 100px 80px 60px', padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-color)', alignItems: 'center', fontSize: '0.875rem', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500 }}>{p.nombre}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.codigo} · {p.peso_gramos}g</p>
                </div>
                <span style={{ background: cat.bg, color: cat.color, padding: '0.15rem 0.6rem', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600 }}>
                  {CATEGORIA_LABELS[p.categoria]}
                </span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(p.precio_unitario)}</span>
                <span className="text-secondary">{formatCurrency(p.costo_produccion)}</span>
                <span style={{ color: mg !== '—' && Number(mg) > 40 ? '#10b981' : mg !== '—' && Number(mg) > 20 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                  {mg}%
                </span>
                <span style={{ color: disponible < 10 ? '#ef4444' : disponible < 20 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                  {disponible} u
                </span>
                <button className="btn btn--ghost btn--sm" onClick={() => setModal(p)}>✏️</button>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <ProductoFormModal
          producto={modal === 'nuevo' ? null : modal}
          onSave={data => { if (modal === 'nuevo') crearProducto(data); else actualizarProducto(modal.id, data); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};
