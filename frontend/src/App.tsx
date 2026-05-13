import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/uiStore'
import { AuthProvider } from './context/AuthContext'
import { PrivateLayout } from './components/layout/PrivateLayout'
import { useSocket } from './hooks/useSocket'
import { Login } from './pages/auth/Login'
import { RecuperarClave } from './pages/auth/RecuperarClave'
import { CambiarClave } from './pages/auth/CambiarClave'
import { PrimeraClavePage } from './pages/auth/PrimeraClavePage'
import { DashboardTrabajador } from './pages/trabajador/DashboardTrabajador'
import { NuevaSolicitudPage } from './pages/trabajador/NuevaSolicitudPage'
import { MisSolicitudes } from './pages/trabajador/MisSolicitudes'
import { DashboardPanolero } from './pages/panolero/DashboardPanolero'
import { SolicitudDetallePage } from './pages/panolero/SolicitudDetallePage'
import { ReingresoPage } from './pages/panolero/ReingresoPage'
import { HistorialDevolucionesPage } from './pages/panolero/HistorialDevolucionesPage'
import { DashboardSupervisor } from './pages/supervisor/DashboardSupervisor'
import { UsuariosPage } from './pages/supervisor/UsuariosPage'
import { InsumosPage } from './pages/supervisor/InsumosPage'
import { CategoriasPage } from './pages/supervisor/CategoriasPage'
import { ProcesosPage } from './pages/supervisor/ProcesosPage'
import { OrdenesTrabajoPage } from './pages/supervisor/OrdenesTrabajoPage'
import { ComprasPage } from './pages/supervisor/ComprasPage'
import { RecepcionComprasPage } from './pages/supervisor/RecepcionComprasPage'
import { DesbloqueosPage } from './pages/supervisor/DesbloqueosPage'
import { MovimientosStockPage } from './pages/supervisor/MovimientosStockPage'
import { DashboardCostos } from './pages/oficina-tecnica/DashboardCostos'
import { CostoOTPage } from './pages/oficina-tecnica/CostoOTPage'
import { PresupuestoVsRealPage } from './pages/oficina-tecnica/PresupuestoVsRealPage'
import { ExportarReportesPage } from './pages/oficina-tecnica/ExportarReportesPage'
import { AuditoriaPage } from './pages/superusuario/AuditoriaPage'
import { ConfiguracionPage } from './pages/superusuario/ConfiguracionPage'
import { CorreccionDatosPage } from './pages/superusuario/CorreccionDatosPage'
import { PerfilPage } from './pages/common/PerfilPage'

function App() {
  const initAuth = useAuthStore((s) => s.initAuth)
  const theme = useThemeStore((s) => s.theme)
  useSocket()

  useEffect(() => {
    initAuth()
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [initAuth, theme])

  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-clave" element={<RecuperarClave />} />
        <Route path="/cambiar-clave" element={<CambiarClave />} />
        <Route path="/primera-clave" element={<PrimeraClavePage />} />
        <Route element={<PrivateLayout />}>
          <Route path="/" element={<RoleDashboard />} />
          <Route path="/perfil" element={<PerfilPage />} />
          {/* Trabajador */}
          <Route path="/trabajador" element={<DashboardTrabajador />} />
          <Route path="/trabajador/nueva-solicitud" element={<NuevaSolicitudPage />} />
          <Route path="/trabajador/mis-solicitudes" element={<MisSolicitudes />} />
          {/* Pañolero */}
          <Route path="/panolero" element={<DashboardPanolero />} />
          <Route path="/panolero/solicitud/:id" element={<SolicitudDetallePage />} />
          <Route path="/panolero/reingreso" element={<ReingresoPage />} />
          <Route path="/panolero/historial-devoluciones" element={<HistorialDevolucionesPage />} />
          {/* Supervisor */}
          <Route path="/supervisor" element={<DashboardSupervisor />} />
          <Route path="/supervisor/usuarios" element={<UsuariosPage />} />
          <Route path="/supervisor/insumos" element={<InsumosPage />} />
          <Route path="/supervisor/categorias" element={<CategoriasPage />} />
          <Route path="/supervisor/procesos" element={<ProcesosPage />} />
          <Route path="/supervisor/ordenes-trabajo" element={<OrdenesTrabajoPage />} />
          <Route path="/supervisor/compras" element={<ComprasPage />} />
          <Route path="/supervisor/recepcion-compras" element={<RecepcionComprasPage />} />
          <Route path="/supervisor/desbloqueos" element={<DesbloqueosPage />} />
          <Route path="/supervisor/movimientos-stock" element={<MovimientosStockPage />} />
          {/* Oficina Técnica */}
          <Route path="/oficina-tecnica" element={<DashboardCostos />} />
          <Route path="/oficina-tecnica/costo-ot/:id" element={<CostoOTPage />} />
          <Route path="/oficina-tecnica/presupuesto-vs-real" element={<PresupuestoVsRealPage />} />
          <Route path="/oficina-tecnica/exportar" element={<ExportarReportesPage />} />
          {/* Superusuario */}
          <Route path="/superusuario/auditoria" element={<AuditoriaPage />} />
          <Route path="/superusuario/configuracion" element={<ConfiguracionPage />} />
          <Route path="/superusuario/correccion-datos" element={<CorreccionDatosPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

function RoleDashboard() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" />
  switch (user.rolId) {
    case 5: return <Navigate to="/trabajador" />
    case 3: return <Navigate to="/panolero" />
    case 2: return <Navigate to="/supervisor" />
    case 4: return <Navigate to="/oficina-tecnica" />
    default: return <Navigate to="/supervisor" />
  }
}

export default App
