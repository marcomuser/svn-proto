import type { Child } from 'hono/jsx'

type PageHeaderProps = { title: string; intro: string; action?: Child }

export function PageHeader({ title, intro, action }: PageHeaderProps) {
  return <header class="wa-split wa-align-items-center wa-gap-m">
    <div class="wa-stack wa-gap-xs"><h1 class="page-title">{title}</h1><p class="page-intro">{intro}</p></div>
    {action}
  </header>
}
