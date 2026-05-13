import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Plus, Minus, Check } from 'lucide-react'

interface InsumoSeleccionado {
  insumoId: number
  nombre: string
  cantidad: number
  stockActual: number
}

export function NuevaSolicitudPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [ots, setOts] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [insumos, setInsumos] = useState<any[]>([])
  const [procesos, setProcesos] = useState<any[]>([])
  const [subprocesos, setSubprocesos] = useState<any[]>([])

  const [otId, setOtId] = useState<number | null>(null)
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [seleccionados, setSeleccionados] = useState<InsumoSeleccionado[]>([])
  const [procesoId, setProcesoId] = useState<number | null>(null)
  const [subprocesoId, setSubprocesoId] = useState<number | null>(null)
  const [justificacionSinStock, setJustificacionSinStock] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/api/ordenes-trabajo').then((r) => setOts(r.data.data))
    api.get('/api/categorias').then((r) => setCategorias(r.data.data))
    api.get('/api/procesos/procesos').then((r) => setProcesos(r.data.data))
  }, [])

  useEffect(() => {
    if (categoriaId) {
      api.get(`/api/insumos/categoria/${categoriaId}`).then((r) => setInsumos(r.data.data))
    }
  }, [categoriaId])

  useEffect(() => {
    if (procesoId) {
      api.get(`/api/procesos/procesos/${procesoId}/subprocesos`).then((r) => setSubprocesos(r.data.data))
    }
  }, [procesoId])

  const addInsumo = (insumo: any) => {
    const existente = seleccionados.find((s) => s.insumoId === insumo.id)
    if (existente) {
      setSeleccionados(seleccionados.map((s) =>
        s.insumoId === insumo.id ? { ...s, cantidad: s.cantidad + 1 } : s
      ))
    } else {
      setSeleccionados([...seleccionados, { insumoId: insumo.id, nombre: insumo.nombre, cantidad: 1, stockActual: insumo.stockActual }])
    }
  }

  const removeInsumo = (insumoId: number) => {
    const existente = seleccionados.find((s) => s.insumoId === insumoId)
    if (!existente) return
    if (existente.cantidad <= 1) {
      setSeleccionados(seleccionados.filter((s) => s.insumoId !== insumoId))
    } else {
      setSeleccionados(seleccionados.map((s) =>
        s.insumoId === insumoId ? { ...s, cantidad: s.cantidad - 1 } : s
      ))
    }
  }

  const haySinStock = seleccionados.some((s) => s.cantidad > s.stockActual)

  const handleConfirmar = async () => {
    if (!otId || seleccionados.length === 0 || !procesoId) {
      toast.error('Completa todos los campos obligatorios')
      return
    }
    if (haySinStock && !justificacionSinStock) {
      toast.error('Justifica los insumos sin stock')
      return
    }
    setLoading(true)
    try {
      await api.post('/api/solicitudes', {
        otId,
        procesoId,
        subprocesoId,
        justificacionSinStock: haySinStock ? justificacionSinStock : undefined,
        detalles: seleccionados.map((s) => ({ insumoId: s.insumoId, cantidad: s.cantidad })),
      })
      toast.success('Solicitud enviada correctamente')
      navigate('/trabajador/mis-solicitudes')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al crear solicitud')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['OT', 'Categoría', 'Insumos', 'Proceso', 'Resumen']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Nueva solicitud de insumos</h2>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((label, idx) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
              idx + 1 <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {idx + 1 < step ? <Check className="h-4 w-4" /> : idx + 1}
            </div>
            <span className="text-xs hidden sm:inline">{label}</span>
            {idx < steps.length - 1 && <div className={`flex-1 h-1 rounded ${idx + 1 < step ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: OT */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Selecciona la orden de trabajo</p>
          <div className="grid grid-cols-1 gap-2">
            {ots.map((ot) => (
              <button
                key={ot.id}
                onClick={() => { setOtId(ot.id); setStep(2) }}
                className={`text-left rounded-lg border p-4 transition-colors hover:bg-accent ${otId === ot.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <p className="font-medium">{ot.codigo}</p>
                <p className="text-sm text-muted-foreground">{ot.descripcion}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Categoría */}
      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Selecciona una categoría</p>
            <button onClick={() => setStep(1)} className="text-sm text-primary flex items-center"><ChevronLeft className="h-4 w-4" /> Atrás</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategoriaId(cat.id); setStep(3) }}
                className={`rounded-lg border p-4 transition-colors hover:bg-accent ${categoriaId === cat.id ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="h-3 w-3 rounded-full mb-2" style={{ backgroundColor: cat.colorClasificacion || '#ccc' }} />
                <p className="font-medium text-sm">{cat.nombre}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Insumos */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Agrega insumos</p>
            <button onClick={() => setStep(2)} className="text-sm text-primary flex items-center"><ChevronLeft className="h-4 w-4" /> Atrás</button>
          </div>
          <div className="space-y-2">
            {insumos.map((ins) => {
              const sel = seleccionados.find((s) => s.insumoId === ins.id)
              const sinStock = ins.stockActual <= 0
              return (
                <div key={ins.id} className={`flex items-center justify-between rounded-lg border p-3 ${sinStock ? 'opacity-70' : ''}`}>
                  <div>
                    <p className="font-medium text-sm">{ins.nombre}</p>
                    <p className="text-xs text-muted-foreground">Stock: {ins.stockActual} {ins.unidadMedida}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sel && (
                      <>
                        <button onClick={() => removeInsumo(ins.id)} className="h-8 w-8 rounded-md border flex items-center justify-center hover:bg-accent">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{sel.cantidad}</span>
                      </>
                    )}
                    <button
                      onClick={() => addInsumo(ins)}
                      className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {seleccionados.length > 0 && (
            <button onClick={() => setStep(4)} className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Siguiente <ChevronRight className="ml-2 h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Step 4: Proceso */}
      {step === 4 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Selecciona proceso y subproceso</p>
            <button onClick={() => setStep(3)} className="text-sm text-primary flex items-center"><ChevronLeft className="h-4 w-4" /> Atrás</button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Proceso</label>
            <select
              value={procesoId || ''}
              onChange={(e) => setProcesoId(Number(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Selecciona...</option>
              {procesos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
          {procesoId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Subproceso</label>
              <select
                value={subprocesoId || ''}
                onChange={(e) => setSubprocesoId(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecciona...</option>
                {subprocesos.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <button onClick={() => setStep(5)} className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Siguiente <ChevronRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 5: Resumen */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Revisa tu solicitud</p>
            <button onClick={() => setStep(4)} className="text-sm text-primary flex items-center"><ChevronLeft className="h-4 w-4" /> Atrás</button>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">OT</p>
              <p className="font-medium">{ots.find((o) => o.id === otId)?.codigo}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Proceso</p>
              <p className="font-medium">{procesos.find((p) => p.id === procesoId)?.nombre} {subprocesos.find((s) => s.id === subprocesoId)?.nombre ? `> ${subprocesos.find((s) => s.id === subprocesoId)?.nombre}` : ''}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Insumos</p>
              <ul className="space-y-1 mt-1">
                {seleccionados.map((s) => (
                  <li key={s.insumoId} className="flex justify-between text-sm">
                    <span>{s.nombre}</span>
                    <span className="font-medium">x{s.cantidad}</span>
                  </li>
                ))}
              </ul>
            </div>
            {haySinStock && (
              <div className="space-y-1">
                <p className="text-xs text-destructive font-medium">Algunos insumos exceden el stock disponible</p>
                <textarea
                  value={justificacionSinStock}
                  onChange={(e) => setJustificacionSinStock(e.target.value)}
                  placeholder="Justificación obligatoria..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]"
                />
              </div>
            )}
          </div>
          <button
            onClick={handleConfirmar}
            disabled={loading || (haySinStock && !justificacionSinStock)}
            className="w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Confirmar solicitud'}
          </button>
        </div>
      )}
    </div>
  )
}
