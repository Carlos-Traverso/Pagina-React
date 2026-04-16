import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { EstadoBadge, Card, Input, EmptyState } from '../../components/ui';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ESTADO_LABELS } from '../../constants/estados';
import { PedidoDetalle } from './PedidoDetalle';
import { PedidoForm } from './PedidoForm';
import './Pedidos.css';

const TODOS_ESTADOS = ['todos', 'borrador', 'confirmado', 'en_produccion', 'listo', 'despachado', 'entregado', 'cancelado'];

export const PedidosPage = () => {
  const { state: { pedidos, clientes } } = useApp();
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const pedidosFiltrados = useMemo(() => {
    return pedidos
      .filter(p => filtroEstado === 'todos' || p.estado === filtroEstado)
      .filter(p => {
        if (!busqueda) return true;
        const cliente = clientes.find(c => c.id === p.cliente_id);
        const q = busqueda.toLowerCase();
        return p.numero.toLowerCase().includes(q) || cliente?.nombre.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  }, [pedidos, clientes, filtroEstado, busqueda]);

  return (
    <div className="pedidos-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Pedidos</h1>
          <p className="text-secondary">{pedidos.length} pedidos en total</p>
        </div>
        <button className="btn btn--primary btn--md" onClick={() => setShowForm(true)}>
          + Nuevo Pedido
        </button>
      </div>

      {/* Filtros */}
      <div className="pedidos-filtros">
        <div className="pedidos-filtros__tabs">
          {TODOS_ESTADOS.map(e => (
            <button
              key={e}
              className={`filter-tab ${filtroEstado === e ? 'filter-tab--active' : ''}`}
              onClick={() => setFiltroEstado(e)}
            >
              {e === 'todos' ? 'Todos' : ESTADO_LABELS[e]}
              <span className="filter-tab__count">
                {e === 'todos' ? pedidos.length : pedidos.filter(p => p.estado === e).length}
              </span>
            </button>
          ))}
        </div>
        <input
          className="input-field"
          placeholder="Buscar por número o cliente..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {/* Lista */}
      {pedidosFiltrados.length === 0 ? (
        <EmptyState icon="📋" title="No hay pedidos" description="No se encontraron pedidos con los filtros aplicados." />
      ) : (
        <div className="pedidos-tabla">
          <div className="pedidos-tabla__header">
            <span>Número</span>
            <span>Cliente</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Total</span>
          </div>
          {pedidosFiltrados.map(p => {
            const cliente = clientes.find(c => c.id === p.cliente_id);
            return (
              <div key={p.id} className="pedidos-tabla__row" onClick={() => setPedidoSeleccionado(p)}>
                <span className="pedido-numero">{p.numero}</span>
                <span className="font-medium">{cliente?.nombre ?? '—'}</span>
                <span className="text-secondary">{formatDate(p.fecha_creacion)}</span>
                <EstadoBadge estado={p.estado} />
                <span className="pedido-total">{formatCurrency(p.total)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Panel de detalle */}
      {pedidoSeleccionado && (
        <PedidoDetalle
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}

      {/* Modal para nuevo pedido */}
      {showForm && (
        <PedidoForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};
