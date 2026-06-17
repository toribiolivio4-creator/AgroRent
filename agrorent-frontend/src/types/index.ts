export interface Usuario {
  id: number; nombre: string; email: string
  plan: 'basico' | 'productor' | 'agronomo'; activo: boolean; creado_en: string
}
export interface Lote {
  id: number; usuario_id: number; nombre: string; hectareas: number
  cultivo: string; ubicacion?: string; campania: string; notas?: string; creado_en: string
}
export interface Gasto {
  id: number; lote_id: number; fecha: string; categoria: string
  descripcion?: string; importe: number; notas?: string; creado_en: string
}
export interface Ingreso {
  id: number; lote_id: number; fecha: string; toneladas: number
  precio_por_tonelada: number; total: number; comprador?: string; notas?: string; creado_en: string
}
export interface RentabilidadLote {
  lote_id: number; nombre: string; cultivo: string; hectareas: number; campania: string
  total_gastos: number; total_ingresos: number; ganancia: number; ganancia_por_ha: number
  margen_porcentaje: number; costo_por_ha: number; ingreso_por_ha: number
  gastos_por_categoria: Record<string, number>; ranking: number
}
export interface Dashboard {
  total_ingresos: number; total_gastos: number; ganancia_neta: number; margen_global: number
  total_hectareas: number; lotes_activos: number; mejor_lote: string; ranking: RentabilidadLote[]
}
export const CATEGORIAS_GASTO = ['semillas','fertilizantes','herbicidas','fungicidas','combustible','mano_de_obra','arrendamiento','maquinaria','otros'] as const
export const CATEGORIA_LABELS: Record<string, string> = {
  semillas:'Semillas', fertilizantes:'Fertilizantes', herbicidas:'Herbicidas',
  fungicidas:'Fungicidas', combustible:'Combustible', mano_de_obra:'Mano de obra',
  arrendamiento:'Arrendamiento', maquinaria:'Maquinaria', otros:'Otros'
}
export const CULTIVO_COLORS: Record<string, string> = {
  Soja:'#1d9e75', Maíz:'#e5a227', Trigo:'#378ADD', Girasol:'#e8b84b', Sorgo:'#a05c3b', Otro:'#8a8880'
}
