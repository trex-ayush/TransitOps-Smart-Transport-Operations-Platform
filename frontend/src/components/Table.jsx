export default function Table({ columns, data, empty = "No records found" }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-stone bg-white shadow-soft">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-stone">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-[11px] font-medium uppercase tracking-widest text-forest/50"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-10 text-center text-forest/40">
                {empty}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id || i}
                className="border-b border-stone/60 transition-colors last:border-0 hover:bg-card/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-forest/80">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
