import { useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { Download, FileSpreadsheet, FileText } from 'lucide-react'

export function ExportarReportesPage() {
  const [tipo, setTipo] = useState('stock-bajo')
  const [descargando, setDescargando] = useState(false)

  const handleExportar = async (formato: 'excel' | 'pdf') => {
    setDescargando(true)
    try {
      const res = await api.post('/api/reportes/exportar-excel', { tipo, formato }, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte-${tipo}.${formato === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Reporte descargado')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al exportar')
    } finally {
      setDescargando(false)
    }
  }

  const reportes = [
    { id: 'stock-bajo', nombre: 'Stock bajo', descripcion: 'Insumos por debajo del mínimo' },
    { id: 'consumo-categoria', nombre: 'Consumo por categoría', descripcion: 'Valorizado por familia de insumos' },
    { id: 'costo-ot', nombre: 'Costo por OT', descripcion: 'Desglose valorizado por orden de trabajo' },
    { id: 'costo-trabajador', nombre: 'Costo por trabajador', descripcion: 'Consumo por persona' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Download className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Exportar reportes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportes.map((r) => (
          <button
            key={r.id}
            onClick={() => setTipo(r.id)}
            className={`text-left rounded-xl border p-4 transition-colors ${tipo === r.id ? 'border-primary bg-primary/5' : 'hover:bg-accent'}`}
          >
            <p className="font-medium">{r.nombre}</p>
            <p className="text-sm text-muted-foreground">{r.descripcion}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleExportar('excel')}
          disabled={descargando}
          className="inline-flex items-center justify-center rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          {descargando ? 'Generando...' : 'Descargar Excel'}
        </button>
        <button
          onClick={() => handleExportar('pdf')}
          disabled={descargando}
          className="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <FileText className="mr-2 h-5 w-5" />
          {descargando ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>
    </div>
  )
}
