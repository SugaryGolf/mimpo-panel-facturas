import { FileStack, DollarSign, Percent, Printer, TrendingUp, Monitor } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const KPI_CONFIG = [
  { key: 'facturas',   label: 'Facturas',           Icon: FileStack,  sub: 'en la selección' },
  { key: 'monto',      label: 'Total facturado',     Icon: DollarSign, sub: 'subtotal incluido' },
  { key: 'iva',        label: 'IVA trasladado',      Icon: Percent,    sub: 'impuesto selección' },
  { key: 'paginas',    label: 'Páginas impresas',    Icon: Printer,    sub: 'todos los equipos' },
  { key: 'maxima',     label: 'Factura más alta',    Icon: TrendingUp, sub: null },
  { key: 'equipo',     label: 'Mayor impresor',      Icon: Monitor,    sub: null },
]

function fmt(n) {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard({
  kpisFiltrados, facturasFiltradas, graficas, isDarkMode
}) {
  const chartText    = isDarkMode ? '#A9A3B5' : '#718096'
  const tooltipBg    = isDarkMode ? '#201A33' : '#FFFFFF'
  const tooltipBorder= isDarkMode ? '#3A3352' : '#E2E8F0'
  const tooltipColor = isDarkMode ? 'white' : '#2D3748'

  const iva = facturasFiltradas.reduce((s, f) => s + (f.iva_trasladado || f.total * 0.137931), 0)
  const topEquipo = graficas.equipos?.[0]

  const kpiValues = {
    facturas: { main: kpisFiltrados.totalFacturas,        sub: 'en la selección',   prefix: '' },
    monto:    { main: `$${fmt(kpisFiltrados.montoTotal)}`, sub: `Subtotal $${fmt(kpisFiltrados.montoTotal - iva)}`, prefix: '' },
    iva:      { main: `$${fmt(iva)}`,                     sub: 'impuesto selección', prefix: '' },
    paginas:  { main: (graficas.equipos || []).reduce((s, e) => s + e.paginas, 0).toLocaleString('en-US'), sub: 'todos los equipos', prefix: '' },
    maxima:   {
      main: `$${fmt(kpisFiltrados.maxima)}`,
      sub: facturasFiltradas.length > 0
        ? `Folio ${facturasFiltradas.reduce((m, f) => f.total > m.total ? f : m, facturasFiltradas[0]).folio || 'S/N'}`
        : 'Sin datos'
    },
    equipo: {
      main: topEquipo ? topEquipo.serie : 'Sin datos',
      sub: topEquipo ? `${topEquipo.paginas.toLocaleString('en-US')} páginas` : '0 páginas'
    },
  }

  const barData = MESES.map((mes, i) => ({
    mes,
    total: facturasFiltradas
      .filter(f => parseInt(f.fecha?.split('-')[1]) === i + 1)
      .reduce((s, f) => s + f.total, 0)
  }))

  const maxBar = Math.max(...barData.map(d => d.total), 1)

  return (
    <>
      {/* KPI GRID */}
      <div className="kpi-grid">
        {KPI_CONFIG.map(({ key, label, Icon }) => {
          const val = kpiValues[key]
          return (
            <div key={key} className="kpi-card" id={`kpi-${key}`}>
              <div className="kpi-icon-wrap">
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <p className="kpi-label">{label}</p>
              <h2 className="kpi-value">{val.main}</h2>
              {val.sub && <p className="kpi-sub">{val.sub}</p>}
            </div>
          )
        })}
      </div>

      {/* CHARTS */}
      <div className="chart-section">
        {/* Bar Chart */}
        <div className="chart-card chart-card--wide">
          <h3 className="chart-title">Total facturado por mes</h3>
          <div style={{ height: 300, marginTop: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barCategoryGap="35%">
                <XAxis dataKey="mes" stroke={chartText} axisLine={false} tickLine={false} dy={8} fontSize={12} />
                <YAxis
                  stroke={chartText} axisLine={false} tickLine={false}
                  tickFormatter={v => v > 0 ? `$${(v/1000).toFixed(0)}k` : ''}
                  dx={-8} fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(128,128,128,0.08)' }}
                  formatter={v => [`$${v.toLocaleString('es-MX')}`, 'Facturado']}
                  contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: 10, color: tooltipColor, fontSize: 13 }}
                />
                <Bar dataKey="total" radius={[6,6,0,0]} maxBarSize={50}>
                  {barData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.total === maxBar && d.total > 0 ? '#A6192E' : '#E5385A'}
                      fillOpacity={d.total > 0 ? 1 : 0.15}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking */}
        <div className="chart-card">
          <h3 className="chart-title">Equipos · más páginas</h3>
          <div className="ranking-list">
            {(graficas.equipos || []).slice(0, 5).map((eq, i) => {
              const max = graficas.equipos[0]?.paginas || 1
              const pct = (eq.paginas / max) * 100
              return (
                <div key={i} className="ranking-item">
                  <span className="ranking-pos">{i + 1}</span>
                  <div className="ranking-info">
                    <span className="ranking-name" title={eq.serie}>
                      {eq.serie.length > 20 ? eq.serie.slice(0, 20) + '…' : eq.serie}
                    </span>
                    <div className="ranking-bar-track">
                      <div className="ranking-bar-fill" style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                  <span className="ranking-value">{eq.paginas.toLocaleString('en-US')}</span>
                </div>
              )
            })}
            {(!graficas.equipos || graficas.equipos.length === 0) && (
              <p style={{ color: chartText, marginTop: 20 }}>Sin equipos registrados.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
