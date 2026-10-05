import { Sun, Moon, Download, Wifi } from 'lucide-react'

export default function Header({ isDarkMode, setIsDarkMode, totalFacturas }) {
  return (
    <header className="header-top">
      <div className="header-logo">
        <img
          src={isDarkMode ? "/logo-negativo.png" : "/logo-color.png"}
          alt="MIMPO Global Logistics"
          className="header-logo-img"
        />
        <div className="header-logo-text">
          <span className="header-subtitle">Panel de Facturas</span>
        </div>
      </div>

      <div className="header-actions">
        <div className="status-badge">
          <Wifi size={14} className="status-icon" />
          <span>{totalFacturas} facturas cargadas</span>
        </div>

        <button
          onClick={() => window.open('/api/export')}
          className="btn-outline"
          id="btn-export-excel"
        >
          <Download size={15} />
          Descargar Excel
        </button>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="btn-icon-round"
          title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          id="btn-toggle-theme"
        >
          {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  )
}
