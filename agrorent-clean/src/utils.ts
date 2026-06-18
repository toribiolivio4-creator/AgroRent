/** Formatea un número como moneda argentina */
export const formatPeso = (n: number): string => {
  if (Math.abs(n) >= 1_000_000) {
    return `$${(n / 1_000_000).toFixed(1)}M`
  }
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}

export const formatPesoFull = (n: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)

/** Formatea una fecha ISO a dd/MM/yyyy */
export const formatFecha = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const clsx = (...classes: (string | boolean | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ')
