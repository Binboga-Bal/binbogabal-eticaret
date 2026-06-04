"use client";

import { useState } from "react";

interface Props {
  data: unknown;
  indent?: number;
}

function JsonNode({ data, indent = 0 }: Props) {
  const [collapsed, setCollapsed] = useState(indent > 2);
  const pad = "  ".repeat(indent);

  if (data === null) return <span className="text-slate-400">null</span>;
  if (typeof data === "boolean") return <span className="text-purple-600">{String(data)}</span>;
  if (typeof data === "number") return <span className="text-blue-600">{data}</span>;
  if (typeof data === "string") return <span className="text-green-700">&quot;{data}&quot;</span>;

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-slate-500">[]</span>;
    return (
      <span>
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-500 hover:text-slate-900 font-mono">
          {collapsed ? `[...${data.length}]` : "["}
        </button>
        {!collapsed && (
          <>
            {data.map((item, i) => (
              <div key={i} className="ml-4">
                {pad}  <JsonNode data={item} indent={indent + 1} />{i < data.length - 1 ? "," : ""}
              </div>
            ))}
            <div>{pad}]</div>
          </>
        )}
      </span>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-slate-500">{"{}"}</span>;
    return (
      <span>
        <button onClick={() => setCollapsed(!collapsed)} className="text-slate-500 hover:text-slate-900 font-mono">
          {collapsed ? `{...${entries.length}}` : "{"}
        </button>
        {!collapsed && (
          <>
            {entries.map(([k, v], i) => (
              <div key={k} className="ml-4">
                {pad}  <span className="text-rose-700 font-medium">&quot;{k}&quot;</span>
                <span className="text-slate-500">: </span>
                <JsonNode data={v} indent={indent + 1} />
                {i < entries.length - 1 ? "," : ""}
              </div>
            ))}
            <div>{pad}{"}"}</div>
          </>
        )}
      </span>
    );
  }

  return <span>{String(data)}</span>;
}

export function JsonViewer({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <span className="text-slate-400 text-sm">—</span>;
  }
  return (
    <pre className="text-xs font-mono leading-relaxed overflow-auto max-h-80 rounded bg-slate-50 p-3 border border-slate-200">
      <JsonNode data={data} indent={0} />
    </pre>
  );
}
