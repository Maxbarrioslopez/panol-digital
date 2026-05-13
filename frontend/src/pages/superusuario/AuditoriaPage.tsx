import { useEffect, useState } from 'react'
import api from '../../services/api'
import { ShieldCheck, Search } from 'lucide-react'

export function AuditoriaPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [tabla, setTabla] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const params: any = { limit: 50 }
      if (tabla) params.tabla = tabla
      const res = await api.get('/api/auditoria', { params })
      setLogs(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Auditoría del sistema</h2>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={tabla}
          onChange={(e) => setTabla(e.target.value)}
          placeholder="Filtrar por tabla..."
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <button
          onClick={cargar}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Search className="h-4 w-4 mr-2" /> Buscar
        </button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Fecha</th>
                <th className="px-4 py-3 text-left font-medium">Usuario</th>
                <th className="px-4 py-3 text-left font-medium">Acción</th>
                <th className="px-4 py-3 text-left font-medium">Tabla</th>
                <th className="px-4 py-3 text-left font-medium">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-accent/50">
                  <td className="px-4 py-3 text-muted-foreground">{new Date(log.fechaAccion).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.usuario?.nombre || 'Sistema'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      log.accion === 'POST' ? 'bg-green-500/10 text-green-500' :
                      log.accion === 'PUT' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.tablaAfectada}</td>
                  <td className="px-4 py-3">{log.registroId}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
