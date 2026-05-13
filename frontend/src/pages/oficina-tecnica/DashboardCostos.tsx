import { useEffect, useState } from 'react'
import api from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, Package } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function DashboardCostos() {
  const [data, setData] = useState<any[]>([])
  const [consumo, setConsumo] = useState<any[]>([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const [pv, cc] = await Promise.all([
        api.get('/api/costos/presupuesto-vs-real'),
        api.get('/api/reportes/consumo-categoria'),
      ])
      setData(pv.data.data || [])
      setConsumo(cc.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Oficina Técnica — Costos</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-500" />
            <span className="text-sm text-muted-foreground">OTs analizadas</span>
          </div>
          <p className="text-2xl font-bold">{data.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-sm text-muted-foreground">Presupuesto total</span>
          </div>
          <p className="text-2xl font-bold">
            ${data.reduce((a, b) => a + (b.presupuesto || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-muted-foreground">Real total</span>
          </div>
          <p className="text-2xl font-bold">
            ${data.reduce((a, b) => a + (b.real || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold mb-4">Presupuesto vs Real por OT</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="codigo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="presupuesto" fill="#3b82f6" name="Presupuesto" />
              <Bar dataKey="real" fill="#10b981" name="Real" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h3 className="font-semibold mb-4">Consumo por categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={consumo} dataKey="valor" nameKey="categoria" cx="50%" cy="50%" outerRadius={100} label>
                {consumo.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
