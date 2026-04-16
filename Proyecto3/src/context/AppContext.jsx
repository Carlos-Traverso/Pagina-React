import { createContext, useContext, useReducer, useCallback } from 'react';
import { productosService, stockService, clientesService, pedidosService } from '../services/dataService';
import { validarTransicion } from '../constants/estados';
import { calcularTotal } from '../utils/formatters';

// =========================================
// Estado inicial
// =========================================
const initialState = {
  productos: productosService.getAll(),
  stock:     stockService.getAll(),
  clientes:  clientesService.getAll(),
  pedidos:   pedidosService.getAll(),
};

// =========================================
// Reducer
// =========================================
const reducer = (state, action) => {
  switch (action.type) {
    // Productos
    case 'SET_PRODUCTOS':   return { ...state, productos: action.payload };
    case 'ADD_PRODUCTO':    return { ...state, productos: [...state.productos, action.payload] };
    case 'UPDATE_PRODUCTO': return { ...state, productos: state.productos.map(p => p.id === action.payload.id ? action.payload : p) };

    // Stock
    case 'SET_STOCK': return { ...state, stock: action.payload };

    // Clientes
    case 'SET_CLIENTES':   return { ...state, clientes: action.payload };
    case 'ADD_CLIENTE':    return { ...state, clientes: [...state.clientes, action.payload] };
    case 'UPDATE_CLIENTE': return { ...state, clientes: state.clientes.map(c => c.id === action.payload.id ? action.payload : c) };

    // Pedidos
    case 'SET_PEDIDOS':   return { ...state, pedidos: action.payload };
    case 'ADD_PEDIDO':    return { ...state, pedidos: [...state.pedidos, action.payload] };
    case 'UPDATE_PEDIDO': return { ...state, pedidos: state.pedidos.map(p => p.id === action.payload.id ? action.payload : p) };

    default: return state;
  }
};

// =========================================
// Context
// =========================================
const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ---- Productos ----
  const crearProducto = useCallback((data) => {
    const nuevo = productosService.crear(data);
    dispatch({ type: 'ADD_PRODUCTO', payload: nuevo });
    // Crear entrada de stock para el nuevo producto (comienza en 0)
    const newStock = stockService.crearEntry(nuevo.id);
    dispatch({ type: 'SET_STOCK', payload: newStock });
    return nuevo;
  }, []);

  const actualizarProducto = useCallback((id, data) => {
    const actualizado = productosService.actualizar(id, data);
    dispatch({ type: 'UPDATE_PRODUCTO', payload: actualizado });
  }, []);

  // ---- Stock ----
  const ingresarStock = useCallback((producto_id, cantidad) => {
    const nuevoStock = stockService.ingresarStock(producto_id, cantidad);
    dispatch({ type: 'SET_STOCK', payload: nuevoStock });
  }, []);

  const actualizarStockMinimo = useCallback((producto_id, cantidad_minima) => {
    const nuevoStock = stockService.actualizar(producto_id, { cantidad_minima });
    dispatch({ type: 'SET_STOCK', payload: nuevoStock });
  }, []);

  // ---- Clientes ----
  const crearCliente = useCallback((data) => {
    const nuevo = clientesService.crear(data);
    dispatch({ type: 'ADD_CLIENTE', payload: nuevo });
    return nuevo;
  }, []);

  const actualizarCliente = useCallback((id, data) => {
    const actualizado = clientesService.actualizar(id, data);
    dispatch({ type: 'UPDATE_CLIENTE', payload: actualizado });
  }, []);

  // ---- Pedidos ----
  const crearPedido = useCallback((datosForm) => {
    const cliente = state.clientes.find(c => c.id === datosForm.cliente_id);
    const descuento = cliente?.descuento_porcentaje ?? 0;
    const total = calcularTotal(datosForm.items, descuento);

    const nuevoPedido = pedidosService.crear({
      ...datosForm,
      total,
      descuento_aplicado: descuento,
    });

    // Si se confirma directamente, reservar stock
    if (datosForm.estado === 'confirmado') {
      let nuevoStock = state.stock;
      for (const item of datosForm.items) {
        nuevoStock = stockService.reservar(item.producto_id, item.cantidad);
      }
      dispatch({ type: 'SET_STOCK', payload: nuevoStock });
    }

    dispatch({ type: 'ADD_PEDIDO', payload: nuevoPedido });
    return nuevoPedido;
  }, [state.clientes, state.stock]);

  const cambiarEstadoPedido = useCallback((id, nuevoEstado) => {
    const pedido = state.pedidos.find(p => p.id === id);
    if (!pedido) return;
    if (!validarTransicion(pedido.estado, nuevoEstado)) {
      alert(`No se puede cambiar de "${pedido.estado}" a "${nuevoEstado}"`);
      return;
    }

    const extra = {};
    if (nuevoEstado === 'entregado') extra.fecha_entrega_real = new Date().toISOString();

    const actualizado = pedidosService.actualizarEstado(id, nuevoEstado, extra);

    // Efectos en stock
    let nuevoStock = state.stock;
    if (nuevoEstado === 'confirmado' && pedido.estado === 'borrador') {
      for (const item of pedido.items) {
        nuevoStock = stockService.reservar(item.producto_id, item.cantidad);
      }
    } else if (nuevoEstado === 'cancelado') {
      if (['confirmado', 'en_produccion', 'listo'].includes(pedido.estado)) {
        for (const item of pedido.items) {
          nuevoStock = stockService.liberar(item.producto_id, item.cantidad);
        }
      }
    } else if (nuevoEstado === 'entregado') {
      for (const item of pedido.items) {
        nuevoStock = stockService.confirmarSalida(item.producto_id, item.cantidad);
      }
    }

    dispatch({ type: 'SET_STOCK', payload: nuevoStock });
    dispatch({ type: 'UPDATE_PEDIDO', payload: actualizado });
  }, [state.pedidos, state.stock]);

  const value = {
    state,
    crearProducto,
    actualizarProducto,
    ingresarStock,
    actualizarStockMinimo,
    crearCliente,
    actualizarCliente,
    crearPedido,
    cambiarEstadoPedido,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
};
