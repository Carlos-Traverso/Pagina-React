import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PedidosPage } from '../pages/pedidos/PedidosPage';
import { ClientesPage } from '../pages/clientes/ClientesPage';
import { ProductosPage } from '../pages/productos/ProductosPage';
import { StockPage } from '../pages/stock/StockPage';
import { ProduccionPage } from '../pages/produccion/ProduccionPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',  element: <DashboardPage /> },
      { path: 'pedidos',    element: <PedidosPage /> },
      { path: 'clientes',   element: <ClientesPage /> },
      { path: 'productos',  element: <ProductosPage /> },
      { path: 'stock',      element: <StockPage /> },
      { path: 'produccion', element: <ProduccionPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
