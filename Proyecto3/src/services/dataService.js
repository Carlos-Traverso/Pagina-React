// =========================================
// Service de localStorage — única capa de datos
// =========================================
import { productosIniciales, stockInicial, clientesIniciales, pedidosIniciales } from '../data/seedData';

const PREFIX = 'erp_pasta_';

const storage = {
  get: (key) => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
};

// Inicializar datos si no existen
const inicializar = () => {
  if (!storage.get('productos')) storage.set('productos', productosIniciales);
  if (!storage.get('stock'))     storage.set('stock', stockInicial);
  if (!storage.get('clientes'))  storage.set('clientes', clientesIniciales);
  if (!storage.get('pedidos'))   storage.set('pedidos', pedidosIniciales);
};

inicializar();

// ---- Productos ----
export const productosService = {
  getAll:    () => storage.get('productos') ?? [],
  crear:     (data) => { const todos = productosService.getAll(); const nuevo = { id: crypto.randomUUID(), ...data }; storage.set('productos', [...todos, nuevo]); return nuevo; },
  actualizar: (id, data) => { const todos = productosService.getAll().map(p => p.id === id ? { ...p, ...data } : p); storage.set('productos', todos); return todos.find(p => p.id === id); },
  eliminar:  (id) => { storage.set('productos', productosService.getAll().map(p => p.id === id ? { ...p, activo: false } : p)); },
};

// ---- Stock ----
export const stockService = {
  getAll: () => storage.get('stock') ?? [],
  crearEntry: (producto_id) => {
    const todos = stockService.getAll();
    // Si ya existe, no crear duplicado
    if (todos.some(s => s.producto_id === producto_id)) return todos;
    const nueva = { id: crypto.randomUUID(), producto_id, cantidad_disponible: 0, cantidad_reservada: 0, cantidad_minima: 10, ultima_actualizacion: new Date().toISOString() };
    const actualizado = [...todos, nueva];
    storage.set('stock', actualizado);
    return actualizado;
  },
  actualizar: (producto_id, cambios) => {
    const todos = stockService.getAll().map(s =>
      s.producto_id === producto_id ? { ...s, ...cambios, ultima_actualizacion: new Date().toISOString() } : s
    );
    storage.set('stock', todos);
    return todos;
  },
  reservar: (producto_id, cantidad) => {
    const todos = stockService.getAll().map(s =>
      s.producto_id === producto_id
        ? { ...s, cantidad_reservada: s.cantidad_reservada + cantidad }
        : s
    );
    storage.set('stock', todos);
    return todos;
  },
  liberar: (producto_id, cantidad) => {
    const todos = stockService.getAll().map(s =>
      s.producto_id === producto_id
        ? { ...s, cantidad_reservada: Math.max(0, s.cantidad_reservada - cantidad) }
        : s
    );
    storage.set('stock', todos);
    return todos;
  },
  confirmarSalida: (producto_id, cantidad) => {
    const todos = stockService.getAll().map(s =>
      s.producto_id === producto_id
        ? {
            ...s,
            cantidad_disponible: Math.max(0, s.cantidad_disponible - cantidad),
            cantidad_reservada: Math.max(0, s.cantidad_reservada - cantidad),
          }
        : s
    );
    storage.set('stock', todos);
    return todos;
  },
  ingresarStock: (producto_id, cantidad) => {
    const todos = stockService.getAll().map(s =>
      s.producto_id === producto_id
        ? { ...s, cantidad_disponible: s.cantidad_disponible + cantidad }
        : s
    );
    storage.set('stock', todos);
    return todos;
  },
};

// ---- Clientes ----
export const clientesService = {
  getAll:    () => storage.get('clientes') ?? [],
  crear:     (data) => { const todos = clientesService.getAll(); const nuevo = { id: crypto.randomUUID(), ...data }; storage.set('clientes', [...todos, nuevo]); return nuevo; },
  actualizar: (id, data) => { const todos = clientesService.getAll().map(c => c.id === id ? { ...c, ...data } : c); storage.set('clientes', todos); return todos.find(c => c.id === id); },
  eliminar:  (id) => { storage.set('clientes', clientesService.getAll().map(c => c.id === id ? { ...c, activo: false } : c)); },
};

// ---- Pedidos ----
export const pedidosService = {
  getAll: () => storage.get('pedidos') ?? [],
  crear: (data) => {
    const todos = pedidosService.getAll();
    const nuevo = {
      id: crypto.randomUUID(),
      numero: `PED-${new Date().getFullYear()}-${String(todos.length + 1).padStart(4, '0')}`,
      fecha_creacion: new Date().toISOString(),
      ...data,
    };
    storage.set('pedidos', [...todos, nuevo]);
    return nuevo;
  },
  actualizarEstado: (id, estado, extra = {}) => {
    const todos = pedidosService.getAll().map(p =>
      p.id === id ? { ...p, estado, ...extra } : p
    );
    storage.set('pedidos', todos);
    return todos.find(p => p.id === id);
  },
  actualizar: (id, data) => {
    const todos = pedidosService.getAll().map(p => p.id === id ? { ...p, ...data } : p);
    storage.set('pedidos', todos);
    return todos.find(p => p.id === id);
  },
};
