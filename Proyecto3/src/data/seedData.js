// =========================================
// Datos de prueba (seed data) para el ERP
// =========================================

export const productosIniciales = [
  { id: 'p1', nombre: 'Spaghetti 500g', codigo: 'SPA-500', descripcion: 'Pasta larga seca premium', categoria: 'seca', peso_gramos: 500, precio_unitario: 1200, costo_produccion: 600, activo: true },
  { id: 'p2', nombre: 'Fetuccine 500g', codigo: 'FET-500', descripcion: 'Pasta ancha seca', categoria: 'seca', peso_gramos: 500, precio_unitario: 1350, costo_produccion: 680, activo: true },
  { id: 'p3', nombre: 'Ravioles de Ricotta 400g', codigo: 'RAV-RIC-400', descripcion: 'Ravioles frescos rellenos de ricotta', categoria: 'rellena', peso_gramos: 400, precio_unitario: 2800, costo_produccion: 1400, activo: true },
  { id: 'p4', nombre: 'Fideos Tallarín 500g', codigo: 'TAL-500', descripcion: 'Tallarín fino seco', categoria: 'seca', peso_gramos: 500, precio_unitario: 1100, costo_produccion: 550, activo: true },
  { id: 'p5', nombre: 'Gnocchi Frescos 500g', codigo: 'GNO-500', descripcion: 'Gnocchi de papa frescos', categoria: 'fresca', peso_gramos: 500, precio_unitario: 1800, costo_produccion: 900, activo: true },
  { id: 'p6', nombre: 'Capellini 500g', codigo: 'CAP-500', descripcion: 'Pasta muy fina tipo ángel', categoria: 'seca', peso_gramos: 500, precio_unitario: 1250, costo_produccion: 620, activo: true },
];

export const stockInicial = [
  { id: 's1', producto_id: 'p1', cantidad_disponible: 150, cantidad_reservada: 0, cantidad_minima: 20 },
  { id: 's2', producto_id: 'p2', cantidad_disponible: 80,  cantidad_reservada: 0, cantidad_minima: 15 },
  { id: 's3', producto_id: 'p3', cantidad_disponible: 12,  cantidad_reservada: 0, cantidad_minima: 10 },
  { id: 's4', producto_id: 'p4', cantidad_disponible: 200, cantidad_reservada: 0, cantidad_minima: 30 },
  { id: 's5', producto_id: 'p5', cantidad_disponible: 5,   cantidad_reservada: 0, cantidad_minima: 10 },
  { id: 's6', producto_id: 'p6', cantidad_disponible: 90,  cantidad_reservada: 0, cantidad_minima: 20 },
];

export const clientesIniciales = [
  { id: 'c1', nombre: 'Supermercado El Sol', tipo: 'mayorista', email: 'compras@elsol.com', telefono: '011-4523-1234', direccion: { calle: 'Av. Corrientes', numero: '1234', ciudad: 'Buenos Aires', provincia: 'CABA', codigo_postal: '1043' }, descuento_porcentaje: 10, activo: true },
  { id: 'c2', nombre: 'Restaurante La Nonna', tipo: 'restaurante', email: 'hola@lanonna.com', telefono: '011-4788-9900', direccion: { calle: 'Defensa', numero: '567', ciudad: 'San Telmo', provincia: 'CABA', codigo_postal: '1065' }, descuento_porcentaje: 15, activo: true },
  { id: 'c3', nombre: 'María González', tipo: 'minorista', email: 'maria.gonzalez@gmail.com', telefono: '011-3344-5566', direccion: { calle: 'Rivadavia', numero: '890', ciudad: 'Flores', provincia: 'CABA', codigo_postal: '1406' }, descuento_porcentaje: 0, activo: true },
  { id: 'c4', nombre: 'Almacén Don Roberto', tipo: 'minorista', email: 'donroberto@almacen.com', telefono: '011-4212-3456', direccion: { calle: 'Lacarra', numero: '234', ciudad: 'Mataderos', provincia: 'CABA', codigo_postal: '1440' }, descuento_porcentaje: 5, activo: true },
  { id: 'c5', nombre: 'Distribuidora Norte', tipo: 'mayorista', email: 'ventas@dinorte.com', telefono: '011-4563-7890', direccion: { calle: 'Av. Triunvirato', numero: '4500', ciudad: 'Villa Urquiza', provincia: 'CABA', codigo_postal: '1431' }, descuento_porcentaje: 12, activo: true },
];

const haceDias = (dias) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d.toISOString();
};

export const pedidosIniciales = [
  {
    id: 'ped1',
    numero: 'PED-2025-0001',
    cliente_id: 'c1',
    items: [
      { id: 'i1', producto_id: 'p1', cantidad: 20, precio_unitario_snapshot: 1200, subtotal: 24000 },
      { id: 'i2', producto_id: 'p4', cantidad: 15, precio_unitario_snapshot: 1100, subtotal: 16500 },
    ],
    estado: 'entregado',
    fecha_creacion: haceDias(10),
    fecha_entrega_estimada: haceDias(7),
    fecha_entrega_real: haceDias(6),
    total: 36450,
    descuento_aplicado: 10,
    notas: 'Entrega en horario de mañana',
  },
  {
    id: 'ped2',
    numero: 'PED-2025-0002',
    cliente_id: 'c2',
    items: [
      { id: 'i3', producto_id: 'p3', cantidad: 8, precio_unitario_snapshot: 2800, subtotal: 22400 },
      { id: 'i4', producto_id: 'p5', cantidad: 5, precio_unitario_snapshot: 1800, subtotal: 9000 },
    ],
    estado: 'en_produccion',
    fecha_creacion: haceDias(3),
    fecha_entrega_estimada: haceDias(-2),
    total: 26690,
    descuento_aplicado: 15,
    notas: '',
  },
  {
    id: 'ped3',
    numero: 'PED-2025-0003',
    cliente_id: 'c3',
    items: [
      { id: 'i5', producto_id: 'p1', cantidad: 5, precio_unitario_snapshot: 1200, subtotal: 6000 },
    ],
    estado: 'confirmado',
    fecha_creacion: haceDias(1),
    fecha_entrega_estimada: haceDias(-3),
    total: 6000,
    descuento_aplicado: 0,
    notas: '',
  },
  {
    id: 'ped4',
    numero: 'PED-2025-0004',
    cliente_id: 'c5',
    items: [
      { id: 'i6', producto_id: 'p2', cantidad: 30, precio_unitario_snapshot: 1350, subtotal: 40500 },
      { id: 'i7', producto_id: 'p6', cantidad: 20, precio_unitario_snapshot: 1250, subtotal: 25000 },
    ],
    estado: 'listo',
    fecha_creacion: haceDias(5),
    fecha_entrega_estimada: haceDias(0),
    total: 57420,
    descuento_aplicado: 12,
    notas: 'Pedido grande, coordinar camión',
  },
  {
    id: 'ped5',
    numero: 'PED-2025-0005',
    cliente_id: 'c4',
    items: [
      { id: 'i8', producto_id: 'p4', cantidad: 10, precio_unitario_snapshot: 1100, subtotal: 11000 },
    ],
    estado: 'borrador',
    fecha_creacion: haceDias(0),
    fecha_entrega_estimada: haceDias(-5),
    total: 10450,
    descuento_aplicado: 5,
    notas: '',
  },
  {
    id: 'ped6',
    numero: 'PED-2025-0006',
    cliente_id: 'c1',
    items: [
      { id: 'i9', producto_id: 'p1', cantidad: 50, precio_unitario_snapshot: 1200, subtotal: 60000 },
      { id: 'i10', producto_id: 'p2', cantidad: 25, precio_unitario_snapshot: 1350, subtotal: 33750 },
    ],
    estado: 'entregado',
    fecha_creacion: haceDias(20),
    fecha_entrega_estimada: haceDias(15),
    fecha_entrega_real: haceDias(14),
    total: 84375,
    descuento_aplicado: 10,
    notas: '',
  },
];
