import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-sm transition-colors hover:border-slate-700 hover:bg-slate-900 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
