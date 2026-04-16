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
        <StatCard icon="📋" label="Pedidos Activos"  value={metrics.pedidosActivos.length} sublabel="en proceso"           color="#3b82f6" />
        <StatCard icon="💰" label="Ventas del Mes"   value={formatCurrency(metrics.ventasMes)} sublabel="este mes"          color="#10b981" />
        <StatCard icon="👥" label="Clientes Activos" value={clientesActivos}                   sublabel="registrados"        color="#8b5cf6" />
        <StatCard icon="⚠️" label="Stock Crítico"    value={metrics.stockCritico.length}       sublabel="productos bajo mínimo" color="#ef4444" />
      </div>

      {/* Charts Row */}
      <div className="dashboard__charts">
        {/* Ventas 7 días */}
        <Card className="dashboard__chart-card">
          <h3 className="chart-title">Ventas — Últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.barData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="dia" tick={{ fill: '#6b6894', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6894', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '' : `$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#1a1929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f0ff', fontSize: 12 }}
                formatter={(v) => [formatCurrency(v), 'Ventas']}
              />
              <Bar dataKey="total" fill="#f97316" radius={[5, 5, 0, 0]} />
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
              <Tooltip contentStyle={{ background: '#1a1929', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f0ff', fontSize: 12 }} />
              <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11, color: '#a09ebb' }} />
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
          <h3 style={{ marginBottom: '1rem' }}>⚠️ Stock Crítico</h3>
          {metrics.stockCritico.length === 0 ? (
            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>✅ Todo el stock está en niveles normales</p>
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
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>{libre} u</span>
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
