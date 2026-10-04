import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './App.css'

function App() {
  const [mensaje, setMensaje] = useState("");
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // NUEVO: Estado para controlar el orden de la tabla de detalles (true = Mayor a menor)
  const [ordenDescendente, setOrdenDescendente] = useState(true);
  
  // 1. Añadimos el estado para controlar el Modo Claro / Oscuro (Por defecto true = oscuro)
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [dashboard, setDashboard] = useState({ 
    kpis: { totalFacturas: 0, montoTotal: 0 }, 
    facturas: [],
    graficas: { equipos: [] } 
  });

  const [filtroAño, setFiltroAño] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState('Todos los meses');
  const [filtroEmisor, setFiltroEmisor] = useState('Todos los emisores');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');

  const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // 2. Efecto para cambiar el atributo del tema en el HTML general cuando el usuario hace clic
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const cargarDashboard = async () => {
    try {
      const respuesta = await axios.get('http://localhost:5000/api/dashboard');
      setDashboard(respuesta.data);
    } catch (error) {
      console.error("Error al cargar dashboard", error);
    }
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const manejarSubida = async (evento) => {
    const archivos = evento.target.files; 
    if (!archivos || archivos.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < archivos.length; i++) {
      formData.append('file', archivos[i]);
    }

    try {
      setMensaje(`Procesando ${archivos.length} archivo(s)...`);
      const respuesta = await axios.post('http://localhost:5000/api/upload', formData);
      setMensaje(respuesta.data.mensaje); 
      cargarDashboard();
    } catch (error) {
      if (error.response && error.response.data) {
        setMensaje(error.response.data.mensaje);
      } else {
        setMensaje("Error de conexión con el servidor.");
      }
    }
  };

  const emisoresUnicos = useMemo(() => [...new Set(dashboard.facturas.map(f => f.emisor))].filter(Boolean).sort(), [dashboard.facturas]);
  const añosUnicos = useMemo(() => [...new Set(dashboard.facturas.map(f => f.fecha ? f.fecha.substring(0, 4) : null))].filter(Boolean).sort((a,b) => b - a), [dashboard.facturas]);

  const facturasFiltradas = useMemo(() => {
    return dashboard.facturas.filter(f => {
      if (!f.fecha) return false;
      const [year, monthStr] = f.fecha.split('-');
      const monthIndex = parseInt(monthStr, 10) - 1;
      
      const matchAño = filtroAño === 'Todos' || year === filtroAño;
      const matchMes = filtroMes === 'Todos los meses' || MESES[monthIndex] === filtroMes;
      const matchEmisor = filtroEmisor === 'Todos los emisores' || f.emisor === filtroEmisor;
      
      // SOLUCIÓN: Agregamos f.folio y f.serie a la condición de búsqueda
      const matchBusqueda = filtroBusqueda === '' || 
        f.uuid?.toLowerCase().includes(filtroBusqueda.toLowerCase()) || 
        f.emisor?.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        f.folio?.toString().toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        f.serie?.toLowerCase().includes(filtroBusqueda.toLowerCase());

      return matchAño && matchMes && matchEmisor && matchBusqueda;
    });
  }, [dashboard.facturas, filtroAño, filtroMes, filtroEmisor, filtroBusqueda]);

  const kpisFiltrados = useMemo(() => {
    const totalMonto = facturasFiltradas.reduce((sum, f) => sum + f.total, 0);
    const maxima = facturasFiltradas.length > 0 ? Math.max(...facturasFiltradas.map(f => f.total)) : 0;
    return {
      totalFacturas: facturasFiltradas.length,
      montoTotal: totalMonto,
      maxima: maxima
    };
  }, [facturasFiltradas]);

  // 3. Variables de color dinámicas para las gráficas Recharts (cambian si es claro u oscuro)
  const chartColorText = isDarkMode ? "#A9A3B5" : "#718096";
  const chartBgTooltip = isDarkMode ? "#201A33" : "#FFFFFF";
  const chartBorderTooltip = isDarkMode ? "#3A3352" : "#E2E8F0";

  return (
    <div>
      {/* HEADER */}
      <header className="header-top">
        <div className="header-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <h1>MIMPO<span className="red-dot">.</span></h1>
          <span className="subtitle">Global Logistics</span>
        </div>
        <div className="header-actions">
          <span className="status-badge">
            <div className="status-dot"></div>
            {dashboard.kpis.totalFacturas} facturas cargadas
          </span>
          <button onClick={() => window.open('http://localhost:5000/api/export')} className="btn-outline">
            📥 Descargar Excel
          </button>
          
          {/* 4. BOTÓN DE CAMBIO DE TEMA */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="btn-outline btn-icon" 
            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
            style={{ borderRadius: '50%', padding: '8px', width: '38px', height: '38px' }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* PESTAÑAS (TABS) */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
          {[
            { id: 'dashboard', label: 'Inicio', icon: '📊' },
            { id: 'carga', label: 'Cargar XML', icon: '📁' },
            { id: 'mensual', label: 'Resumen Mensual', icon: '📅' },
            { id: 'detalle', label: 'Detalle De Facturas', icon: '📄' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        <div className="animate-fade" key={activeTab}>
          
          {/* BARRA DE FILTROS */}
          {activeTab !== 'carga' && (
            <div className="filters-container">
              <div className="filter-group" style={{ flex: 1, minWidth: '120px' }}>
                <label className="filter-label">Año</label>
                <select className="glass-input" value={filtroAño} onChange={(e) => setFiltroAño(e.target.value)}>
                  <option>Todos</option>
                  {añosUnicos.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="filter-group" style={{ flex: 1, minWidth: '160px' }}>
                <label className="filter-label">Mes</label>
                <select className="glass-input" value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
                  <option>Todos los meses</option>
                  {MESES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="filter-group" style={{ flex: 2, minWidth: '250px' }}>
                <label className="filter-label">Emisor</label>
                <select className="glass-input" value={filtroEmisor} onChange={(e) => setFiltroEmisor(e.target.value)}>
                  <option>Todos los emisores</option>
                  {emisoresUnicos.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="filter-group" style={{ flex: 2, minWidth: '300px' }}>
                <label className="filter-label">Buscar (folio, UUID, serie...)</label>
                <input className="glass-input" type="text" value={filtroBusqueda} onChange={(e) => setFiltroBusqueda(e.target.value)} placeholder="Escribe para buscar..." style={{ textAlign: 'left' }} />
              </div>
            </div>
          )}

          {/* MÓDULO: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              <div className="kpi-grid-6">
                <div className="kpi-card-tall">
                  <p className="kpi-label-tall">Facturas</p>
                  <h2 className="kpi-value-tall">{kpisFiltrados.totalFacturas}</h2>
                  <p className="kpi-subtext-tall">en la selección</p>
                </div>
                
                <div className="kpi-card-tall">
                  <p className="kpi-label-tall">Total facturado</p>
                  <h2 className="kpi-value-tall">${kpisFiltrados.montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                  <p className="kpi-subtext-tall">
                    Subtotal ${(kpisFiltrados.montoTotal - (facturasFiltradas.reduce((s, f) => s + (f.iva || 0), 0))).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                  </p>
                </div>
                
                <div className="kpi-card-tall">
                  <p className="kpi-label-tall">IVA trasladado</p>
                  <h2 className="kpi-value-tall">
                    ${facturasFiltradas.reduce((sum, f) => sum + (f.iva_trasladado || (f.total * 0.137931)), 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="kpi-subtext-tall">impuesto de la selección</p>
                </div>

                <div className="kpi-card-tall">
                  <p className="kpi-label-tall">Páginas impresas</p>
                  <h2 className="kpi-value-tall">
                    {dashboard.graficas.equipos ? dashboard.graficas.equipos.reduce((s, e) => s + e.paginas, 0).toLocaleString('en-US') : 0}
                  </h2>
                  <p className="kpi-subtext-tall">todos los equipos</p>
                </div>

                <div className="kpi-card-tall">
                  <p className="kpi-label-tall">Factura más alta</p>
                  <h2 className="kpi-value-tall">${kpisFiltrados.maxima.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                  <p className="kpi-subtext-tall">
                    {facturasFiltradas.length > 0 ? `Folio ${facturasFiltradas.reduce((max, f) => f.total > max.total ? f : max, facturasFiltradas[0]).folio || 'S/N'} · ${facturasFiltradas.reduce((max, f) => f.total > max.total ? f : max, facturasFiltradas[0]).fecha}` : 'Sin datos'}
                  </p>
                </div>

                <div className="kpi-card-tall">
                  <p className="kpi-label-tall">Equipo que más imprime</p>
                  <h2 className="kpi-value-tall" style={{ fontSize: '1.4rem' }}>
                    {dashboard.graficas.equipos && dashboard.graficas.equipos.length > 0 
                      ? dashboard.graficas.equipos[0].serie 
                      : 'Ninguno'}
                  </h2>
                  <p className="kpi-subtext-tall">
                    {dashboard.graficas.equipos && dashboard.graficas.equipos.length > 0 
                      ? `${dashboard.graficas.equipos[0].paginas.toLocaleString('en-US')} páginas` 
                      : '0 páginas'}
                  </p>
                </div>
              </div>

              {/* SECCIÓN DE GRÁFICAS INTEGRADAS */}
              <div className="chart-section">
                
                <div className="chart-card" style={{ flex: 1.5, minWidth: '450px' }}>
                  <h3 className="chart-title" style={{ textAlign: 'left' }}>Total facturado por mes</h3>
                  <div style={{ height: '320px', marginTop: '20px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={
                        MESES.map((mes, index) => {
                          const totalMes = facturasFiltradas
                            .filter(f => parseInt(f.fecha.split('-')[1]) === index + 1)
                            .reduce((sum, f) => sum + f.total, 0);
                          return { mes, total: totalMes };
                        })
                      }>
                        <XAxis dataKey="mes" stroke={chartColorText} axisLine={false} tickLine={false} dy={10} fontSize={13} />
                        <YAxis 
                          stroke={chartColorText} 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(value) => value > 0 ? `${value / 1000} k` : ''} 
                          dx={-10} 
                          fontSize={13} 
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(128,128,128,0.1)' }} 
                          formatter={(value) => [`$${value.toLocaleString('es-MX')}`, 'Facturado']}
                          contentStyle={{ backgroundColor: chartBgTooltip, border: `1px solid ${chartBorderTooltip}`, borderRadius: '10px', color: isDarkMode ? 'white' : '#2D3748' }} 
                        />
                        <Bar dataKey="total" fill="#E5385A" radius={[6, 6, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="chart-card" style={{ flex: 1, minWidth: '350px' }}>
                  <h3 className="chart-title" style={{ textAlign: 'left' }}>Equipos con más páginas impresas</h3>
                  
                  <div className="ranking-list">
                    {dashboard.graficas.equipos && dashboard.graficas.equipos.slice(0, 4).map((equipo, index) => {
                      const maxPaginas = Math.max(...dashboard.graficas.equipos.map(e => e.paginas));
                      const porcentaje = (equipo.paginas / maxPaginas) * 100;
                      
                      return (
                        <div key={index} className="ranking-item">
                          <span className="ranking-number">{index + 1}</span>
                          <span className="ranking-name" title={equipo.serie}>
                            {equipo.serie.length > 18 ? equipo.serie.substring(0, 18) + '...' : equipo.serie}
                          </span>
                          
                          <div className="ranking-bar-track">
                            <div className="ranking-bar-fill" style={{ width: `${Math.max(porcentaje, 2)}%` }}></div>
                          </div>
                          
                          <span className="ranking-value">{equipo.paginas.toLocaleString('en-US')}</span>
                        </div>
                      );
                    })}
                    
                    {(!dashboard.graficas.equipos || dashboard.graficas.equipos.length === 0) && (
                      <p style={{ color: chartColorText, marginTop: '20px' }}>No hay equipos registrados aún.</p>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* MÓDULO: CARGA DE XML */}
          {activeTab === 'carga' && (
            <div className="upload-card">
              <div className="upload-icon">📁</div>
              <h2 className="upload-title">Suelta aquí tus facturas XML</h2>
              <p className="upload-text">Procesamiento 100% local y seguro. <br/> <span style={{color: '#E5385A'}}>{mensaje}</span></p>
              <label className="btn-primary">
                Seleccionar archivos
                <input type="file" accept=".xml" multiple hidden onChange={manejarSubida} />
              </label>
            </div>
          )}

          {/* MÓDULO RECUPERADO: RESUMEN MENSUAL (TABLA CONCENTRADA) */}
          {activeTab === 'mensual' && (
            <div className="table-card">
              <h3 className="table-title">Resumen mensual · {filtroAño === 'Todos' ? (añosUnicos[0] || new Date().getFullYear()) : filtroAño}</h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="table-monthly">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Facturas</th>
                      <th>Subtotal</th>
                      <th>Descuento</th>
                      <th>IVA</th>
                      <th>Total</th>
                      <th>Páginas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MESES.map((mes, index) => {
                      const facturasMes = dashboard.facturas.filter(f => {
                        if (!f.fecha) return false;
                        const [y, mStr] = f.fecha.split('-');
                        const mNum = parseInt(mStr, 10);
                        const aFiltrado = filtroAño === 'Todos' ? (añosUnicos[0] || new Date().getFullYear().toString()) : filtroAño;
                        return mNum === index + 1 && y === aFiltrado;
                      });

                      const cFacturas = facturasMes.length;
                      const cTotal = facturasMes.reduce((s, f) => s + f.total, 0);
                      const cIva = facturasMes.reduce((s, f) => s + (f.iva_trasladado || (f.total * 0.137931)), 0);
                      const cSubtotal = cTotal - cIva;
                      const cDescuento = 0; 
                      const cPaginas = cFacturas > 0 ? (dashboard.graficas.equipos ? dashboard.graficas.equipos.reduce((s, e) => s + e.paginas, 0) : 0) : 0;

                      return (
                        <tr key={index} className="table-row">
                          <td style={{ color: chartColorText }}>{mes}</td>
                          <td style={{ color: cFacturas > 0 ? 'var(--text-main)' : chartColorText }}>{cFacturas}</td>
                          <td style={{ color: cSubtotal > 0 ? 'var(--text-main)' : chartColorText }}>${cSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ color: chartColorText }}>${cDescuento.toFixed(2)}</td>
                          <td style={{ color: cIva > 0 ? 'var(--text-main)' : chartColorText }}>${cIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ color: cTotal > 0 ? 'var(--text-main)' : chartColorText }}>${cTotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ color: cPaginas > 0 ? 'var(--text-main)' : chartColorText }}>{cPaginas > 0 ? cPaginas.toLocaleString('en-US') : '0'}</td>
                        </tr>
                      );
                    })}
                    
                    <tr className="table-row row-total-year">
                      <td>Total del año</td>
                      <td>
                        {dashboard.facturas
                          .filter(f => (filtroAño === 'Todos' ? f.fecha?.startsWith(añosUnicos[0] || new Date().getFullYear()) : f.fecha?.startsWith(filtroAño)))
                          .length}
                      </td>
                      <td>
                        ${dashboard.facturas
                          .filter(f => (filtroAño === 'Todos' ? f.fecha?.startsWith(añosUnicos[0] || new Date().getFullYear()) : f.fecha?.startsWith(filtroAño)))
                          .reduce((s, f) => s + (f.total - (f.iva_trasladado || (f.total * 0.137931))), 0)
                          .toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>$0.00</td>
                      <td>
                        ${dashboard.facturas
                          .filter(f => (filtroAño === 'Todos' ? f.fecha?.startsWith(añosUnicos[0] || new Date().getFullYear()) : f.fecha?.startsWith(filtroAño)))
                          .reduce((s, f) => s + (f.iva_trasladado || (f.total * 0.137931)), 0)
                          .toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        ${dashboard.facturas
                          .filter(f => (filtroAño === 'Todos' ? f.fecha?.startsWith(añosUnicos[0] || new Date().getFullYear()) : f.fecha?.startsWith(filtroAño)))
                          .reduce((s, f) => s + f.total, 0)
                          .toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>{dashboard.graficas.equipos ? dashboard.graficas.equipos.reduce((s, e) => s + e.paginas, 0).toLocaleString('en-US') : 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MÓDULO: DETALLE DE FACTURAS */}
          {activeTab === 'detalle' && (
            <div className="table-card">
              <h3 className="table-title">Detalle de facturas</h3>
              
              {facturasFiltradas.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div style={{ fontSize: '3rem', margin: '0 auto 15px auto', width: '50px', opacity: 0.5 }}>🔍</div>
                  <p style={{ color: chartColorText, fontSize: '1.1rem' }}>No se encontraron facturas con los filtros actuales.</p>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-details">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Folio</th>
                          <th>Emisor</th>
                          <th>Serie del equipo</th>
                          <th>Páginas</th>
                          <th>Subtotal</th>
                          <th>IVA</th>
                          {/* Columna Total interactiva */}
                          <th className="sortable-header" onClick={() => setOrdenDescendente(!ordenDescendente)}>
                            Total {ordenDescendente ? '▼' : '▲'}
                          </th>
                          <th>Estatus</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...facturasFiltradas].sort((a, b) => ordenDescendente ? b.total - a.total : a.total - b.total).map((factura, index) => {
                          const isMayor = factura.total === kpisFiltrados.maxima && kpisFiltrados.maxima > 0;
                          const cIva = factura.iva_trasladado || (factura.total * 0.137931);
                          const cSubtotal = factura.subtotal || (factura.total - cIva);
                          
                          return (
                            <tr key={index} className="table-row">
                              <td style={{ whiteSpace: 'pre-wrap', minWidth: '70px' }}>
                                {factura.fecha ? factura.fecha.replace('-', '-\n') : ''}
                              </td>
                              <td>{factura.folio || 'S/N'}</td>
                              <td className="td-emisor" style={{ minWidth: '120px' }}>{factura.emisor}</td>
                              <td style={{ maxWidth: '300px', lineHeight: '1.4' }}>{factura.serie || 'N/A'}</td>
                              <td>{factura.paginas ? factura.paginas.toLocaleString('en-US') : '0'}</td>
                              <td>${cSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td>${cIva.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="td-total">${factura.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td>
                                {isMayor ? <span className="badge-mayor">Mayor monto</span> : null}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* FOOTER DEL DETALLE */}
                  <div style={{ textAlign: 'center', marginTop: '25px', color: chartColorText, fontSize: '0.9rem' }}>
                    Mostrando {facturasFiltradas.length} de {dashboard.facturas.length} facturas
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App