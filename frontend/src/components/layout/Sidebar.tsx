import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ClipboardList, RotateCcw,
  Users, BarChart3, Settings, ShieldCheck, Factory,
  ShoppingCart, Unlock, TrendingUp, Download, Wrench,
  Tag, History, Key, User, Box, Receipt, LogOut
} from 'lucide-react'

export function Sidebar() {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const rolId = user?.rolId

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const renderLink = (path: string, IconComponent: React.ComponentType<{ className?: string }>, label: string) => (
    <Link
      key={path}
      to={path}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
        isActive(path)
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <IconComponent className="h-4 w-4" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )

  return (
    <aside className="relative w-64 border-r bg-background h-[calc(100vh-3.5rem)] sticky top-14 hidden md:block overflow-y-auto">
      <nav className="flex flex-col gap-1 p-4">
        {renderLink('/', LayoutDashboard, t('dashboard'))}
        {renderLink('/perfil', User, 'Mi perfil')}

        {rolId === 5 && (
          <>
            <div className="my-2 border-t" />
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trabajador</p>
            {renderLink('/trabajador/nueva-solicitud', ClipboardList, 'Nueva solicitud')}
            {renderLink('/trabajador/mis-solicitudes', Package, 'Mis solicitudes')}
          </>
        )}

        {rolId === 3 && (
          <>
            <div className="my-2 border-t" />
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pañolero</p>
            {renderLink('/panolero', ClipboardList, 'Cola solicitudes')}
            {renderLink('/panolero/reingreso', RotateCcw, 'Reingreso')}
            {renderLink('/panolero/historial-devoluciones', History, 'Historial devoluciones')}
          </>
        )}

        {rolId === 2 && (
          <>
            <div className="my-2 border-t" />
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supervisor</p>
            {renderLink('/supervisor/usuarios', Users, 'Usuarios')}
            {renderLink('/supervisor/insumos', Package, 'Insumos')}
            {renderLink('/supervisor/categorias', Tag, 'Categorías')}
            {renderLink('/supervisor/procesos', Factory, 'Procesos')}
            {renderLink('/supervisor/ordenes-trabajo', ClipboardList, 'Órdenes de trabajo')}
            {renderLink('/supervisor/compras', ShoppingCart, 'Autorizar compras')}
            {renderLink('/supervisor/recepcion-compras', Receipt, 'Recepcionar compras')}
            {renderLink('/supervisor/desbloqueos', Unlock, 'Desbloqueos')}
            {renderLink('/supervisor/movimientos-stock', History, 'Movimientos stock')}
            {renderLink('/oficina-tecnica', TrendingUp, 'Costos')}
          </>
        )}

        {rolId === 4 && (
          <>
            <div className="my-2 border-t" />
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Oficina Técnica</p>
            {renderLink('/oficina-tecnica', BarChart3, 'Dashboard Costos')}
            {renderLink('/oficina-tecnica/presupuesto-vs-real', TrendingUp, 'Presupuesto vs Real')}
            {renderLink('/oficina-tecnica/exportar', Download, 'Exportar reportes')}
          </>
        )}

        {(rolId === 1 || rolId === 2) && (
          <>
            <div className="my-2 border-t" />
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Administración</p>
            {rolId === 1 && renderLink('/supervisor', LayoutDashboard, 'Panel supervisor')}
            {rolId === 1 && renderLink('/superusuario/auditoria', ShieldCheck, t('auditoria'))}
            {rolId === 1 && renderLink('/superusuario/configuracion', Settings, t('configuracion'))}
            {rolId === 1 && renderLink('/superusuario/correccion-datos', Wrench, 'Corrección datos')}
          </>
        )}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
