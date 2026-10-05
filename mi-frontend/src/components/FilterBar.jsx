import { SlidersHorizontal, Search } from 'lucide-react'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function FilterBar({
  filtroAño, setFiltroAño,
  filtroMes, setFiltroMes,
  filtroEmisor, setFiltroEmisor,
  filtroBusqueda, setFiltroBusqueda,
  añosUnicos, emisoresUnicos
}) {
  return (
    <div className="filters-container">
      <div className="filter-header">
        <SlidersHorizontal size={15} />
        <span>Filtros</span>
      </div>

      <div className="filter-group">
        <label className="filter-label">Año</label>
        <select
          id="filtro-año"
          className="glass-input"
          value={filtroAño}
          onChange={e => setFiltroAño(e.target.value)}
        >
          <option>Todos</option>
          {añosUnicos.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Mes</label>
        <select
          id="filtro-mes"
          className="glass-input"
          value={filtroMes}
          onChange={e => setFiltroMes(e.target.value)}
        >
          <option>Todos los meses</option>
          {MESES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="filter-group filter-group--wide">
        <label className="filter-label">Emisor</label>
        <select
          id="filtro-emisor"
          className="glass-input"
          value={filtroEmisor}
          onChange={e => setFiltroEmisor(e.target.value)}
        >
          <option>Todos los emisores</option>
          {emisoresUnicos.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <div className="filter-group filter-group--search">
        <label className="filter-label">Buscar</label>
        <div className="search-wrapper">
          <Search size={15} className="search-icon" />
          <input
            id="filtro-busqueda"
            className="glass-input search-input"
            type="text"
            value={filtroBusqueda}
            onChange={e => setFiltroBusqueda(e.target.value)}
            placeholder="Folio, UUID, serie, emisor…"
          />
        </div>
      </div>
    </div>
  )
}
