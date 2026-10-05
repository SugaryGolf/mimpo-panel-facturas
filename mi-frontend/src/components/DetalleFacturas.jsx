import { ArrowUpDown, ArrowDown, ArrowUp, SearchX, Star } from 'lucide-react'
import { useState } from 'react'

function fmt(n) {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function DetalleFacturas({ facturasFiltradas, totalFacturas, kpisFiltrados }) {
  const [orden, setOrden] = useState('desc')

  const sorted = [...facturasFiltradas].sort((a, b) =>
    orden === 'desc' ? b.total - a.total : a.total - b.total
  )

  const toggleOrden = () => setOrden(prev => prev === 'desc' ? 'asc' : 'desc')

  if (facturasFiltradas.length === 0) {
    return (
      <div className="empty-state" id="modulo-detalle-empty">
        <SearchX size={48} strokeWidth={1.3} />
        <p>No se encontraron facturas con los filtros actuales.</p>
      </div>
    )
  }

  return (
    <div className="table-card" id="modulo-detalle">
      <div className="table-header">
        <h3 className="table-title">Detalle de facturas</h3>
        <span className="table-count">
          {facturasFiltradas.length} de {totalFacturas}
        </span>
      </div>

      <div className="table-scroll">
        <table className="table-details">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Folio</th>
              <th>Emisor</th>
              <th>Serie del equipo</th>
              <th style={{ textAlign: 'right' }}>Páginas</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
              <th style={{ textAlign: 'right' }}>IVA</th>
              <th
                className="sortable-header"
                style={{ textAlign: 'right' }}
                onClick={toggleOrden}
                title="Ordenar por Total"
                id="th-total-sort"
              >
                <span className="th-sort-wrap">
                  Total
                  {orden === 'desc'
                    ? <ArrowDown size={13} />
                    : <ArrowUp size={13} />}
                </span>
              </th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((f, i) => {
              const isMayor = f.total === kpisFiltrados.maxima && kpisFiltrados.maxima > 0
              const iva = f.iva_trasladado || f.total * 0.137931
              const sub = f.subtotal || f.total - iva
              return (
                <tr key={i} className={`table-row ${isMayor ? 'row-highlight' : ''}`}>
                  <td className="td-fecha">{f.fecha || '—'}</td>
                  <td>{f.folio || 'S/N'}</td>
                  <td className="td-emisor">{f.emisor}</td>
                  <td className="td-serie">{f.serie || 'N/A'}</td>
                  <td style={{ textAlign: 'right' }}>{f.paginas ? f.paginas.toLocaleString('en-US') : '0'}</td>
                  <td style={{ textAlign: 'right' }}>${fmt(sub)}</td>
                  <td style={{ textAlign: 'right' }}>${fmt(iva)}</td>
                  <td className="td-total" style={{ textAlign: 'right' }}>${fmt(f.total)}</td>
                  <td>
                    {isMayor && (
                      <span className="badge-mayor">
                        <Star size={11} strokeWidth={2} fill="currentColor" />
                        Mayor monto
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
