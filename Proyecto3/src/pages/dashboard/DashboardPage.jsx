import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard, Card, EstadoBadge } from '../../components/ui';
import { formatCurrency, formatDate, subDays, isSameDay, startOfMonth } from '../../utils/formatters';
import { ESTADO_LABELS, ESTADO_COLORES } from '../../constants/estados';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import './Dashboard.css';

const ESTADOS_ACTIVOS = ['confirmado', 'en_produccion', 'listo', 'despachado'];

export const DashboardPage = () => {
  const { state: { pedidos, stock, productos, clientes } } = useApp();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const hoy = new Date();
    const inicioMes = startOfMonth(hoy);

    const pedidosActivos = pedidos.filter(p => ESTADOS_ACTIVOS.includes(p.estado));
    const ventasMes = pedidos
      .filter(p => new Date(p.fecha_creacion) >= inicioMes && p.estado !== 'cancelado')
      .reduce((s, p) => s + p.total, 0);

    const stockCritico = stock.filter(s => (s.cantidad_disponible - s.cantidad_reservada) < s.cantidad_minima);

    // Pedidos por estado para el gráfico de torta
    const estadoCounts = {};
    pedidos.forEach(p => { estadoCounts[p.estado] = (estadoCounts[p.estado] || 0) + 1; });
    const pieData = Object.entries(estadoCounts).map(([estado, count]) => ({
      name: ESTADO_LABELS[estado], value: count, color: ESTADO_COLORES[estado],
    }));

    // Ventas últimos 7 días
    const barData = Array.from({ length: 7 }, (_, i) => {
      const dia = subDays(hoy, 6 - i);
      const total = pedidos
        .filter(p => isSameDay(p.fecha_creacion, dia.toISOString()) && p.estado !== 'cancelado')
        .reduce((s, p) => s + p.total, 0);
      const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
      return { dia: dias[dia.getDay()], total };
    });

    // Pedidos recientes
    const recientes = [...pedidos]
      .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion))
      .slice(0, 5);

    return { pedidosActivos, ventasMes, stockCritico, pieData, barData, recientes };
  }, [pedidos, stock]);

  const clientesActivos = clientes.filter(c => c.activo).length;

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-secondary">Resumen operativo de la fábrica</p>
        </div>
        <button className="btn btn--primary btn--md" onClick={() => navigate('/pedidos/nuevo')}>
          + Nuevo Pedido
        </button>
      </div>

      {/* Stats */}
      <div className="dashboard__stats">
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>}
          label="Pedidos Activos" value={metrics.pedidosActivos.length} sublabel="en proceso" color="#3b82f6" />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          label="Ventas del Mes" value={formatCurrency(metrics.ventasMes)} sublabel="este mes" color="#10b981" />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="Clientes Activos" value={clientesActivos} sublabel="registrados" color="#8b5cf6" />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Stock Crítico" value={metrics.stockCritico.length} sublabel="bajo mínimo" color="#dc2626" />
      </div>

      {/* Charts Row */}
      <div className="dashboard__charts">
        {/* Ventas 7 días */}
        <Card className="dashboard__chart-card">
          <h3 className="chart-title">Ventas — Últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.barData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="dia" tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#484f58', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '' : `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', fontSize: 12 }}
                formatter={(v) => [formatCurrency(v), 'Ventas']}
              />
              <Bar dataKey="total" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pedidos por estado */}
        <Card className="dashboard__chart-card">
          <h3 className="chart-title">Pedidos por Estado</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={metrics.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                {metrics.pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 6, color: '#e6edf3', fontSize: 12 }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#8b949e' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="dashboard__bottom">
        {/* Pedidos recientes */}
        <Card className="dashboard__recent">
          <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
            <h3>Pedidos Recientes</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => navigate('/pedidos')}>Ver todos →</button>
          </div>
          <div className="recent-list">
            {metrics.recientes.map(p => {
              const cliente = clientes.find(c => c.id === p.cliente_id);
              return (
                <div key={p.id} className="recent-item" onClick={() => navigate(`/pedidos/${p.id}`)}>
                  <div className="recent-item__info">
                    <span className="recent-item__num">{p.numero}</span>
                    <span className="recent-item__cliente">{cliente?.nombre ?? '—'}</span>
                  </div>
                  <div className="recent-item__right">
                    <EstadoBadge estado={p.estado} />
                    <span className="recent-item__total">{formatCurrency(p.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stock crítico */}
        <Card className="dashboard__stock-alert">
          <h3 style={{ marginBottom: '1rem' }}>Stock Crítico</h3>
          {metrics.stockCritico.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.8125rem' }}>Todos los productos en niveles normales.</p>
          ) : (
            <div className="stock-alert-list">
              {metrics.stockCritico.map(s => {
                const prod = productos.find(p => p.id === s.producto_id);
                const libre = s.cantidad_disponible - s.cantidad_reservada;
                return (
                  <div key={s.id} className="stock-alert-item">
                    <div>
                      <p className="font-medium" style={{ fontSize: '0.875rem' }}>{prod?.nombre ?? '—'}</p>
                      <p className="text-muted" style={{ fontSize: '0.75rem' }}>Mínimo: {s.cantidad_minima} u</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#f87171', fontWeight: 600 }}>{libre} u</span>
                      <p className="text-muted" style={{ fontSize: '0.72rem' }}>disponibles</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
