import type { Child } from 'hono/jsx'

type PanelProps = { children: Child; className?: string; label?: string; labelledBy?: string }

export function Panel({ children, className = 'wa-stack wa-gap-m', label, labelledBy }: PanelProps) {
  return <section class={className} aria-label={label} aria-labelledby={labelledBy}>
    <style>{`@scope {
      :scope { padding: var(--wa-space-l); border: var(--wa-border-width-s) solid var(--wa-color-surface-border); border-radius: var(--wa-border-radius-l); background: var(--wa-color-surface-raised); }
    }`}</style>
    {children}
  </section>
}
