import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react'

export default function CargaXML({ mensaje, manejarSubida }) {
  const isSuccess = mensaje && !mensaje.toLowerCase().includes('error')
  const hasMsg = mensaje.length > 0

  return (
    <div className="upload-zone">
      <div className="upload-icon-wrap">
        <UploadCloud size={52} strokeWidth={1.3} />
      </div>
      <h2 className="upload-title">Sube tus facturas XML</h2>
      <p className="upload-desc">
        Procesamiento 100 % local y seguro.<br />
        Puedes seleccionar múltiples archivos a la vez.
      </p>

      {hasMsg && (
        <div className={`upload-msg ${isSuccess ? 'upload-msg--ok' : 'upload-msg--err'}`}>
          {isSuccess
            ? <CheckCircle2 size={16} strokeWidth={2} />
            : <AlertCircle size={16} strokeWidth={2} />}
          <span>{mensaje}</span>
        </div>
      )}

      <label className="btn-primary" id="btn-upload-xml">
        Seleccionar archivos .xml
        <input type="file" accept=".xml" multiple hidden onChange={manejarSubida} />
      </label>

      <p className="upload-hint">
        Formatos admitidos: CFDI 3.3 y 4.0
      </p>
    </div>
  )
}
