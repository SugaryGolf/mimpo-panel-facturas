const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmt(n) {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ResumenMensual({ facturas, graficas, filtroAño, añosUnicos }) {
  const añoActivo = filtroAño === 'Todos'
    ? (añosUnicos[0] || new Date().getFullYear().toString())
    : filtroAño

  const totalPaginas = (graficas.equipos || []).reduce((s, e) => s + e.paginas, 0)

  const rows = MESES.map((mes, i) => {
    const items = facturas.filter(f => {
      if (!f.fecha) return false
      const [y, m] = f.fecha.split('-')
      return parseInt(m) === i + 1 && y === añoActivo
    })
    const total   = items.reduce((s, f) => s + f.total, 0)
    const iva     = items.reduce((s, f) => s + (f.iva_trasladado || f.total * 0.137931), 0)
    const subtotal= total - iva
    return { mes, count: items.length, subtotal, iva, total }
  })

  const totals = rows.reduce((acc, r) => ({
    count: acc.count + r.count,
    subtotal: acc.subtotal + r.subtotal,
    iva: acc.iva + r.iva,
    total: acc.total + r.total,
  }), { count: 0, subtotal: 0, iva: 0, total: 0 })

  return (
    <div className="table-card" id="modulo-mensual">
      <div className="table-header">
        <h3 className="table-title">Resumen mensual · {añoActivo}</h3>
      </div>

      <div className="table-scroll">
        <table className="table-monthly">
          <thead>
            <tr>
              <th>Mes</th>
              <th>Facturas</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
              <th>Páginas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`table-row ${r.count === 0 ? 'row-empty' : ''}`}>
                <td className="td-mes">{r.mes}</td>
                <td>{r.count > 0 ? r.count : <span className="muted">—</span>}</td>
                <td>{r.subtotal > 0 ? `$${fmt(r.subtotal)}` : <span className="muted">—</span>}</td>
                <td>{r.iva > 0 ? `$${fmt(r.iva)}` : <span className="muted">—</span>}</td>
                <td>{r.total > 0 ? `$${fmt(r.total)}` : <span className="muted">—</span>}</td>
                <td>{r.count > 0 ? totalPaginas.toLocaleString('en-US') : <span className="muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="row-total-year">
              <td>Total {añoActivo}</td>
              <td>{totals.count}</td>
              <td>${fmt(totals.subtotal)}</td>
              <td>${fmt(totals.iva)}</td>
              <td>${fmt(totals.total)}</td>
              <td>{totalPaginas.toLocaleString('en-US')}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
