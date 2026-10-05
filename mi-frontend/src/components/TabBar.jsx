import { LayoutDashboard, Upload, CalendarDays, FileText } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Inicio',             Icon: LayoutDashboard },
  { id: 'carga',     label: 'Cargar XML',          Icon: Upload },
  { id: 'mensual',   label: 'Resumen Mensual',     Icon: CalendarDays },
  { id: 'detalle',   label: 'Detalle de Facturas', Icon: FileText },
]

export default function TabBar({ activeTab, setActiveTab }) {
  return (
    <nav className="tab-bar" role="tablist" aria-label="Módulos del sistema">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          id={`tab-${id}`}
          role="tab"
          aria-selected={activeTab === id}
          onClick={() => setActiveTab(id)}
          className={`tab-btn ${activeTab === id ? 'active' : ''}`}
        >
          <Icon size={16} strokeWidth={2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
