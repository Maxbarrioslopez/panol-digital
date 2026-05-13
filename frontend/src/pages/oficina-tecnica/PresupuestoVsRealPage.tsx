import { useEffect, useState } from 'react'
import api from '../../services/api'
import { toast } from 'sonner'
import { TrendingUp, ArrowDownToLine } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export function PresupuestoVsRealPage() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const res = await api.get('/api/costos/presupuesto-vs-real')
      setData(res.data.data || [])
    } catch (err) {
      toast.error('Error al cargar datos')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Presupuesto vs Real</h2>
        </div>
        <button className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
          <ArrowDownToLine className="mr-2 h-4 w-4" /> Exportar
        </button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="font-semibold mb-4">Comparativo por OT</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="codigo" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="presupuesto" fill="#3b82f6" name="Presupuesto" />
            <Bar dataKey="real" fill="#10b981" name="Real" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left">OT</th>
                <th className="px-4 py-3 text-right">Presupuesto</th>
                <th className="px-4 py-3 text-right">Real</th>
                <th className="px-4 py-3 text-right">Desviación</th>
                <th className="px-4 py-3 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((d) => (
                <tr key={d.otId} className="hover:bg-accent/50">
                  <td className="px-4 py-3 font-medium">{d.codigo}</td>
                  <td className="px-4 py-3 text-right">${Number(d.presupuesto).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">${Number(d.real).toLocaleString()}</td>
                  <td className={`px-4 py-3 text-right font-medium ${d.desviacion > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    ${Number(d.desviacion).toLocaleString()}
                  </td>
                  <td className={`px-4 py-3 text-right ${d.porcentajeDesviacion > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {Number(d.porcentajeDesviacion).toFixed(1)}%
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No hay datos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
