import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import './App.css'

import Header        from './components/Header'
import TabBar        from './components/TabBar'
import FilterBar     from './components/FilterBar'
import Dashboard     from './components/Dashboard'
import CargaXML      from './components/CargaXML'
import ResumenMensual from './components/ResumenMensual'
import DetalleFacturas from './components/DetalleFacturas'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function App() {
  const [isDarkMode,  setIsDarkMode]  = useState(true)
  const [activeTab,   setActiveTab]   = useState('dashboard')
  const [mensaje,     setMensaje]     = useState('')
  const [dashboard,   setDashboard]   = useState({
    kpis:    { totalFacturas: 0, montoTotal: 0 },
    facturas: [],
    graficas: { equipos: [] }
  })

  const [filtroAño,      setFiltroAño]      = useState('Todos')
  const [filtroMes,      setFiltroMes]      = useState('Todos los meses')
  const [filtroEmisor,   setFiltroEmisor]   = useState('Todos los emisores')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Cargar datos
  const cargarDashboard = async () => {
    try {
      const { data } = await axios.get('/api/dashboard')
      setDashboard(data)
    } catch (err) {
      console.error('Error al cargar dashboard:', err)
    }
  }
  useEffect(() => { cargarDashboard() }, [])

  // Subida de archivos
  const manejarSubida = async (e) => {
    const archivos = e.target.files
    if (!archivos || archivos.length === 0) return
    const formData = new FormData()
    for (let i = 0; i < archivos.length; i++) formData.append('file', archivos[i])
    try {
      setMensaje(`Procesando ${archivos.length} archivo(s)…`)
      const { data } = await axios.post('/api/upload', formData)
      setMensaje(data.mensaje)
      cargarDashboard()
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error de conexión con el servidor.')
    }
  }

  // Derivados
  const emisoresUnicos = useMemo(() =>
    [...new Set(dashboard.facturas.map(f => f.emisor))].filter(Boolean).sort(),
  [dashboard.facturas])

  const añosUnicos = useMemo(() =>
    [...new Set(dashboard.facturas.map(f => f.fecha?.substring(0, 4)))].filter(Boolean).sort((a, b) => b - a),
  [dashboard.facturas])

  const facturasFiltradas = useMemo(() =>
    dashboard.facturas.filter(f => {
      if (!f.fecha) return false
      const [year, mStr] = f.fecha.split('-')
      const mIdx = parseInt(mStr, 10) - 1
      const q = filtroBusqueda.toLowerCase()
      return (
        (filtroAño    === 'Todos'            || year === filtroAño) &&
        (filtroMes    === 'Todos los meses'  || MESES[mIdx] === filtroMes) &&
        (filtroEmisor === 'Todos los emisores' || f.emisor === filtroEmisor) &&
        (!q ||
          f.uuid?.toLowerCase().includes(q) ||
          f.emisor?.toLowerCase().includes(q) ||
          f.folio?.toString().toLowerCase().includes(q) ||
          f.serie?.toLowerCase().includes(q))
      )
    }),
  [dashboard.facturas, filtroAño, filtroMes, filtroEmisor, filtroBusqueda])

  const kpisFiltrados = useMemo(() => {
    const montoTotal = facturasFiltradas.reduce((s, f) => s + f.total, 0)
    const maxima     = facturasFiltradas.length > 0 ? Math.max(...facturasFiltradas.map(f => f.total)) : 0
    return { totalFacturas: facturasFiltradas.length, montoTotal, maxima }
  }, [facturasFiltradas])

  return (
    <div>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        totalFacturas={dashboard.kpis.totalFacturas}
      />

      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '36px 24px' }}>

        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="animate-fade" key={activeTab}>

          {activeTab !== 'carga' && (
            <FilterBar
              filtroAño={filtroAño}       setFiltroAño={setFiltroAño}
              filtroMes={filtroMes}       setFiltroMes={setFiltroMes}
              filtroEmisor={filtroEmisor} setFiltroEmisor={setFiltroEmisor}
              filtroBusqueda={filtroBusqueda} setFiltroBusqueda={setFiltroBusqueda}
              añosUnicos={añosUnicos}     emisoresUnicos={emisoresUnicos}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              kpisFiltrados={kpisFiltrados}
              facturasFiltradas={facturasFiltradas}
              graficas={dashboard.graficas}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'carga' && (
            <CargaXML mensaje={mensaje} manejarSubida={manejarSubida} />
          )}

          {activeTab === 'mensual' && (
            <ResumenMensual
              facturas={dashboard.facturas}
              graficas={dashboard.graficas}
              filtroAño={filtroAño}
              añosUnicos={añosUnicos}
            />
          )}

          {activeTab === 'detalle' && (
            <DetalleFacturas
              facturasFiltradas={facturasFiltradas}
              totalFacturas={dashboard.facturas.length}
              kpisFiltrados={kpisFiltrados}
            />
          )}

        </div>
      </main>
    </div>
  )
}