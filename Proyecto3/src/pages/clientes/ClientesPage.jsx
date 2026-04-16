import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, Button, Modal, EmptyState } from '../../components/ui';
import { TIPO_CLIENTE_LABELS } from '../../constants/estados';
import { formatCurrency } from '../../utils/formatters';
import './Clientes.css';

const TIPO_COLORES = {
  mayorista: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  minorista: { bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  restaurante: { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
};

const ClienteForm = ({ cliente, onSave, onClose }) => {
  const [form, setForm] = useState(cliente ?? {
    nombre: '', tipo: 'minorista', email: '', telefono: '',
    descuento_porcentaje: 0, activo: true,
    direccion: { calle: '', numero: '', ciudad: '', provincia: '', codigo_postal: '' },
  });
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const setDir = (field, val) => setForm(f => ({ ...f, direccion: { ...f.direccion, [field]: val } }));

  return (
    <Modal open onClose={onClose} title={cliente ? 'Editar Cliente' : 'Nuevo Cliente'} width="600px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Nombre *</label>
            <input className="input-field" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Nombre o razón social" />
          </div>
          <div>
            <label className="input-label">Tipo</label>
            <select className="input-field" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              {Object.entries(TIPO_CLIENTE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Descuento (%)</label>
            <input className="input-field" type="number" min={0} max={50} value={form.descuento_porcentaje} onChange={e => set('descuento_porcentaje', Number(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label className="input-label">Teléfono</label>
            <input className="input-field" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Dirección</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input className="input-field" placeholder="Calle" value={form.direccion.calle} onChange={e => setDir('calle', e.target.value)} />
            <input className="input-field" placeholder="Nro" value={form.direccion.numero} onChange={e => setDir('numero', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '0.5rem' }}>
            <input className="input-field" placeholder="Ciudad" value={form.direccion.ciudad} onChange={e => setDir('ciudad', e.target.value)} />
            <input className="input-field" placeholder="Provincia" value={form.direccion.provincia} onChange={e => setDir('provincia', e.target.value)} />
            <input className="input-field" placeholder="CP" value={form.direccion.codigo_postal} onChange={e => setDir('codigo_postal', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => { onSave(form); onClose(); }} disabled={!form.nombre}>
            {cliente ? '💾 Guardar Cambios' : '✅ Crear Cliente'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const ClientesPage = () => {
  const { state: { clientes, pedidos }, crearCliente, actualizarCliente } = useApp();
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [modalForm, setModalForm] = useState(null); // null | 'nuevo' | cliente

  const clientesFiltrados = useMemo(() =>
    clientes
      .filter(c => c.activo)
      .filter(c => filtroTipo === 'todos' || c.tipo === filtroTipo)
      .filter(c => !busqueda || c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.email.toLowerCase().includes(busqueda.toLowerCase())),
  [clientes, filtroTipo, busqueda]);

  const getPedidosCliente = (id) => pedidos.filter(p => p.cliente_id === id && p.estado !== 'cancelado').length;
  const getTotalCliente = (id) => pedidos.filter(p => p.cliente_id === id && !['cancelado','borrador'].includes(p.estado)).reduce((s, p) => s + p.total, 0);

  const handleSave = (form) => {
    if (modalForm === 'nuevo') crearCliente(form);
    else actualizarCliente(modalForm.id, form);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>Clientes</h1>
          <p className="text-secondary">{clientes.filter(c => c.activo).length} clientes activos</p>
        </div>
        <Button variant="primary" onClick={() => setModalForm('nuevo')}>+ Nuevo Cliente</Button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['todos', 'mayorista', 'minorista', 'restaurante'].map(t => (
          <button key={t} className={`filter-tab ${filtroTipo === t ? 'filter-tab--active' : ''}`} onClick={() => setFiltroTipo(t)}>
            {t === 'todos' ? 'Todos' : TIPO_CLIENTE_LABELS[t]}
          </button>
        ))}
        <input className="input-field" style={{ maxWidth: 280, marginLeft: 'auto' }} placeholder="Buscar cliente..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
      </div>

      {clientesFiltrados.length === 0 ? (
        <EmptyState icon="👥" title="No hay clientes" description="No se encontraron clientes." />
      ) : (
        <div className="clientes-grid">
          {clientesFiltrados.map(c => {
            const tc = TIPO_COLORES[c.tipo];
            const totalPedidos = getPedidosCliente(c.id);
            const totalCompras = getTotalCliente(c.id);
            return (
              <Card key={c.id} className="cliente-card">
                <div className="cliente-card__header">
                  <div className="cliente-avatar">
                    {c.nombre.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</h3>
                    <span className="cliente-tipo-badge" style={{ background: tc.bg, color: tc.color }}>
                      {TIPO_CLIENTE_LABELS[c.tipo]}
                    </span>
                  </div>
                  <button className="btn btn--ghost btn--sm" onClick={() => setModalForm(c)} style={{ flexShrink: 0 }}>✏️</button>
                </div>

                <div className="cliente-card__info">
                  <p className="text-sm text-secondary truncate">📧 {c.email}</p>
                  <p className="text-sm text-secondary">📞 {c.telefono}</p>
                  <p className="text-sm text-secondary truncate">📍 {c.direccion.ciudad}, {c.direccion.provincia}</p>
                </div>

                <div className="cliente-card__stats">
                  <div>
                    <span className="cliente-stat-label">Pedidos</span>
                    <span className="cliente-stat-value">{totalPedidos}</span>
                  </div>
                  <div>
                    <span className="cliente-stat-label">Total compras</span>
                    <span className="cliente-stat-value">{formatCurrency(totalCompras)}</span>
                  </div>
                  {c.descuento_porcentaje > 0 && (
                    <div>
                      <span className="cliente-stat-label">Descuento</span>
                      <span className="cliente-stat-value" style={{ color: '#10b981' }}>{c.descuento_porcentaje}%</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {modalForm && (
        <ClienteForm
          cliente={modalForm === 'nuevo' ? null : modalForm}
          onSave={handleSave}
          onClose={() => setModalForm(null)}
        />
      )}
    </div>
  );
};
