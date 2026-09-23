import { Loader2 } from 'lucide-react'

/**
 * Reusable loading indicator.
 * size: 'sm' | 'md' | 'lg'
 * fullPage: renders centered within a full-height container (for page-level loads)
 */
export default function Loader({ size = 'md', label = 'Loading…', fullPage = false, className = '' }) {
  const sizeMap = { sm: 16, md: 24, lg: 36 }
  const iconSize = sizeMap[size] || 24

  const content = (
    <div className={`flex items-center justify-center gap-2 text-gray-500 ${className}`} role="status" aria-live="polite">
      <Loader2 size={iconSize} className="animate-spin text-brand-600" aria-hidden="true" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  )

  if (fullPage) {
    return <div className="flex min-h-[40vh] w-full items-center justify-center py-16">{content}</div>
  }

  return content
}
