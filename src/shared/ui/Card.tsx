import clsx from 'clsx'

interface CardProps {
  children:  React.ReactNode
  className?: string
}
export default function Card({ children, className }: CardProps) {
  return (
    <div className={clsx(
      'bg-[var(--dh-bg-card)] border border-[var(--dh-border)] rounded-[14px] p-5',
      className,
    )}>
      {children}
    </div>
  )
}
