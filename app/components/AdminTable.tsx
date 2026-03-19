"use client";

import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  title: string;
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
};

export default function AdminTable<T>({
  columns,
  rows,
  rowKey,
}: Props<T>) {
  return (
    <div style={{ overflowX: "auto", borderRadius: 14 }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#1f1f2b",
          color: "#fff",
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "12px 14px",
                  borderBottom: "1px solid rgba(255,255,255,.08)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgba(255,255,255,.7)",
                }}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid rgba(255,255,255,.05)",
                    fontSize: 14,
                  }}
                >
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
