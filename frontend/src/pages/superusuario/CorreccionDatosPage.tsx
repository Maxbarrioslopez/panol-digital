import { useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { Wrench, Search } from 'lucide-react'

export function CorreccionDatosPage() {
  const [tabla, setTabla] = useState('solicitudes')
  const [registroId, setRegistroId] = useState('')
  const [datos, setDatos] = useState<any>(null)
  const [cargando, setCargando] = useState(false)

  const buscar = async () => {
    setCargando(true)
    try {
      const res = await api.get(`/api/${tabla}/${registroId}`)
      setDatos(res.data.data)
    } catch (err: any) {
      toast.error('Registro no encontrado')
      setDatos(null)
    } finally {
      setCargando(false)
    }
  }

  const handleCorregir = async (campo: string, valor: any) => {
    try {
      await api.put(`/api/${tabla}/${registroId}`, { [campo]: valor })
      toast.success('Corrección aplicada')
      buscar()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al corregir')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Corrección de datos</h2>
      </div>

      <div className="flex gap-2">
        <select value={tabla} onChange={(e) => setTabla(e.target.value)} className="flex h-10 rounded-md border px-3 py-2 text-sm">
          <option value="solicitudes">Solicitudes</option>
          <option value="insumos">Insumos</option>
          <option value="usuarios">Usuarios</option>
          <option value="ordenes-trabajo">OTs</option>
        </select>
        <input
          type="number"
          value={registroId}
          onChange={(e) => setRegistroId(e.target.value)}
          placeholder="ID del registro"
          className="flex h-10 rounded-md border px-3 py-2 text-sm"
        />
        <button
          onClick={buscar}
          disabled={cargando || !registroId}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Search className="mr-2 h-4 w-4" /> Buscar
        </button>
      </div>

      {datos && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="font-semibold">Datos del registro #{registroId}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                {Object.entries(datos).filter(([k]) => !['claveHash', 'datosAnteriores', 'datosNuevos'].includes(k)).map(([key, value]) => (
                  <tr key={key} className="hover:bg-accent/50">
                    <td className="px-4 py-2 font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
