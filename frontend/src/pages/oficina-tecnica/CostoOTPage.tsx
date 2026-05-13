import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import { toast } from 'sonner'
import { DollarSign, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function CostoOTPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (id) cargar()
  }, [id])

  const cargar = async () => {
    try {
      const res = await api.get(`/api/costos/ot/${id}`)
      setData(res.data.data)
    } catch (err) {
      toast.error('Error al cargar costos')
    }
  }

  if (!data) return <div className="text-center p-8">Cargando...</div>

  return (
    <div className="space-y-4">
      <button onClick={() => navigate('/oficina-tecnica')} className="text-sm text-primary flex items-center">
        <ArrowLeft className="mr-1 h-4 w-4" /> Volver
      </button>

      <div className="flex items-center gap-2">
        <DollarSign className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Costos OT: {data.codigoOT}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Presupuesto estimado</p>
          <p className="text-2xl font-bold">${Number(data.presupuestoEstimado || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Costo neto real</p>
          <p className="text-2xl font-bold">${Number(data.totalCostoNeto || 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Desviación</p>
          <p className={`text-2xl font-bold ${(data.desviacion || 0) > 0 ? 'text-red-500' : 'text-green-500'}`}>
            ${Number(data.desviacion || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Detalle por solicitud</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">Solicitud</th>
                <th className="px-4 py-3 text-right">Costo bruto</th>
                <th className="px-4 py-3 text-right">Devolución</th>
                <th className="px-4 py-3 text-right">Costo neto</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.solicitudes?.map((s: any) => (
                <tr key={s.solicitudId} className="hover:bg-accent/50">
                  <td className="px-4 py-3">#{s.solicitudId}</td>
                  <td className="px-4 py-3 text-right">${Number(s.costoBruto || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${Number(s.costoDevolucion || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium">${Number(s.costoNeto || 0).toLocaleString()}</td>
                </tr>
              ))}
              {(!data.solicitudes || data.solicitudes.length === 0) && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No hay solicitudes completadas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
