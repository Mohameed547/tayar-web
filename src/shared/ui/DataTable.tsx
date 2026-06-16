interface Column<T> {
  key:       keyof T | string
  header:    string
  render?:   (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data:    T[]
  keyField: keyof T
}

export default function DataTable<T>({ columns, data, keyField }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-[var(--color-border)]">
      <table className="w-full border-collapse text-[13px] bg-[var(--color-bg-card)]">
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className="px-4 py-[10px] text-[11px] font-bold uppercase tracking-[.05em] text-[var(--color-text-sub)] border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] text-left rtl:text-right whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={String(row[keyField])} className="group">
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3 border-b border-[var(--color-border)] text-[var(--color-text-sub)] group-hover:bg-[var(--color-bg-muted)] transition-colors align-middle"
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[var(--color-text-sub)] text-[13px]">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
