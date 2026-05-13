import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toast } from 'sonner'
import { Users, Package, ShoppingCart, AlertTriangle, Factory, Tag, ClipboardList } from 'lucide-react'

export function DashboardSupervisor() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ usuarios: 0, insumos: 0, stockBajo: 0, compras: 0, ots: 0, categorias: 0, solicitudesHoy: 0 })
  const [stockBajo, setStockBajo] = useState<any[]>([])

  useEffect(() => {
    cargar()
  }, [])

  const cargar = async () => {
    try {
      const [u, i, sb, c, ot, cat, sol] = await Promise.all([
        api.get('/api/usuarios'),
        api.get('/api/insumos'),
        api.get('/api/reportes/stock-bajo'),
        api.get('/api/compras'),
        api.get('/api/ordenes-trabajo'),
        api.get('/api/categorias'),
        api.get('/api/solicitudes'),
      ])
      const hoy = new Date().toISOString().split('T')[0]
      setStats({
        usuarios: u.data.data?.length || 0,
        insumos: i.data.data?.length || 0,
        stockBajo: sb.data.data?.length || 0,
        compras: c.data.data?.filter((x: any) => x.estado === 'PENDIENTE').length || 0,
        ots: ot.data.data?.length || 0,
        categorias: cat.data.data?.length || 0,
        solicitudesHoy: sol.data.data?.filter((x: any) => x.fechaSolicitud?.startsWith(hoy)).length || 0,
      })
      setStockBajo(sb.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cards = [
    { label: 'Usuarios', value: stats.usuarios, icon: Users, color: 'text-blue-500', path: '/supervisor/usuarios' },
    { label: 'Insumos', value: stats.insumos, icon: Package, color: 'text-green-500', path: '/supervisor/insumos' },
    { label: 'Stock bajo', value: stats.stockBajo, icon: AlertTriangle, color: 'text-red-500', path: '/supervisor/insumos' },
    { label: 'Compras pend.', value: stats.compras, icon: ShoppingCart, color: 'text-amber-500', path: '/supervisor/compras' },
    { label: 'OTs', value: stats.ots, icon: ClipboardList, color: 'text-purple-500', path: '/supervisor/ordenes-trabajo' },
    { label: 'Categorías', value: stats.categorias, icon: Tag, color: 'text-pink-500', path: '/supervisor/categorias' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Panel del supervisor</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <button
            key={card.path}
            onClick={() => navigate(card.path)}
            className="text-left rounded-xl border bg-card p-4 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <span className="text-sm text-muted-foreground">{card.label}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </button>
        ))}
      </div>

      {stockBajo.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="p-4 border-b flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold">Insumos con stock bajo</h3>
            <button onClick={() => navigate('/supervisor/insumos')} className="ml-auto text-sm text-primary hover:underline">Ver todos</button>
          </div>
          <div className="divide-y">
            {stockBajo.slice(0, 5).map((ins) => (
              <div key={ins.id} className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{ins.nombre}</p>
                  <p className="text-xs text-muted-foreground">{ins.codigoInterno} | {ins.categoria?.nombre}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-500">{ins.stockActual} / {ins.stockMinimo}</p>
                  <p className="text-xs text-muted-foreground">mínimo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
