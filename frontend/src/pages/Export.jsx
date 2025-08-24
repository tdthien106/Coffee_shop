// src/pages/Export.jsx
import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = [
  { id: "order", label: "Order Summary" },
  { id: "employees", label: "Employee Summary" },
];
const PAGE_SIZE = [25, 50, 100];
const API_BASE = "http://localhost:3000/api/export";

export default function ExportPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pageSize, setPageSize] = useState(PAGE_SIZE[0]);
  const [page, setPage] = useState(1);

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    from: "",
    to: "",
    category: CATEGORIES[0].id,
    store: "HCMUS - 227NVC",
  });

  const blobUrlsRef = useRef([]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      blobUrlsRef.current = [];
    };
  }, []);

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // ===== Utils =====
  const nowText = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(
      d.getMonth() + 1
    )}/${d.getFullYear()}`;
  };

  const rangeText = (from, to) => {
    const toVN = (s) => {
      if (!s) return "";
      const [y, m, d] = s.split("-");
      return `${d}/${m}/${y}`;
    };
    return `${toVN(from)}–${toVN(to)}`;
  };

  // CSV: ; delimiter, BOM, CRLF, rút gọn ISO-date
  const toCSV = (arr, delimiter = ";") => {
    if (!arr || arr.length === 0) return "data\r\n";

    const normalize = (v) => {
      if (v === null || v === undefined) return "";
      const s = String(v);
      if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
      return s;
    };

    const headers = Object.keys(arr[0]);
    const needsQuote = new RegExp(`[${delimiter}"\\n\\r]`);
    const escapeCell = (v) => {
      const s = normalize(v);
      return needsQuote.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const lines = [
      headers.join(delimiter),
      ...arr.map((row) => headers.map((h) => escapeCell(row[h])).join(delimiter)),
    ];

    return lines.join("\r\n");
  };

  const makeDownloadUrl = (csvText) => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    blobUrlsRef.current.push(url);
    return url;
  };

  // Tải bằng <a download> để đặt đúng tên file
  const handleDownload = (url, filename = "export.csv") => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ===== Core =====
  async function handleRequestExport(e) {
    e.preventDefault();
    try {
      if (!form.from || !form.to) {
        alert("Please select a date range.");
        return;
      }
      setLoading(true);

      let data = [];
      const categoryLabel =
        CATEGORIES.find((c) => c.id === form.category)?.label || form.category;

      if (form.category === "order") {
        const params = new URLSearchParams({ from: form.from, to: form.to });
        const res = await fetch(`${API_BASE}/orders?` + params.toString());
        if (!res.ok) throw new Error(`Orders API failed: ${res.status}`);
        data = await res.json();
      } else {
        const res = await fetch(`${API_BASE}/employees`);
        if (!res.ok) throw new Error(`Employees API failed: ${res.status}`);
        data = await res.json();
      }

      const csv = toCSV(data);

      // ==== Tên file: <loai>_<from>_<to>_<store đã sanitize>.csv ====
      const base = form.category === "order" ? "orders" : "employees";
      const rangePart = `${form.from}_${form.to}`;
      const storePart = form.store
        .trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9_-]/g, ""); // an toàn cho tên file
      const fileName = `${base}_${rangePart}_${storePart}.csv`;

      const url = makeDownloadUrl(csv);

      setRows((prev) => [
        {
          id: crypto.randomUUID(),
          category: categoryLabel,
          accessedAt: nowText(),
          dateRange: rangeText(form.from, form.to),
          downloadUrl: url,
          fileName,
          count: Array.isArray(data) ? data.length : 0,
        },
        ...prev,
      ]);

      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Export failed");
    } finally {
      setLoading(false);
    }
  }

  const handleReload = () => setRows((r) => [...r]);

  return (
    <div className="exp-wrap">
   

      <h1 className="exp-title">GROUP 06 Export</h1>
      <div className="exp-toolbar">
        <button className="exp-btn" onClick={() => setOpenModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 21h16"/>
          </svg>
          Export data
        </button>
        <button className="exp-btn exp-btn--green" onClick={handleReload}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>
          </svg>
          Reload
        </button>
      </div>

      <div className="exp-card">
        <div style={{ overflowX: "auto" }}>
          <table className="exp-table">
            <thead>
              <tr>
                <th className="exp-th exp-col-num">#</th>
                <th className="exp-th exp-col-cat">Category</th>
                <th className="exp-th exp-col-date">Accessed on</th>
                <th className="exp-th exp-col-date">Date</th>
                <th className="exp-th">Rows</th>
                <th className="exp-th exp-col-dl">Download</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="exp-td" colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: "16px" }}>Loading…</td></tr>
              )}

              {!loading && paged.length === 0 && (
                <tr><td className="exp-td" colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: "16px" }}>No exports yet.</td></tr>
              )}

              {!loading && paged.map((r, i) => (
                <tr key={r.id} className="exp-tr">
                  <td className="exp-td exp-col-num">{(page - 1) * pageSize + i + 1}.</td>
                  <td className="exp-td exp-col-cat">{r.category}</td>
                  <td className="exp-td exp-col-date">{r.accessedAt}</td>
                  <td className="exp-td exp-col-date">{r.dateRange}</td>
                  <td className="exp-td" style={{ textAlign: "center" }}>{r.count ?? "—"}</td>
                  <td className="exp-td exp-col-dl">
                    <button
                      className="exp-dl"
                      onClick={() => handleDownload(r.downloadUrl, r.fileName || "export.csv")}
                      title={r.fileName || "export.csv"}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 21h16"/>
                      </svg>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="exp-foot">
          <div>
            {PAGE_SIZE.map((s) => (
              <button
                key={s}
                className={`exp-chip ${pageSize === s ? "active" : ""}`}
                onClick={() => { setPageSize(s); setPage(1); }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {openModal && (
        <div className="exp-backdrop" onClick={() => setOpenModal(false)}>
          <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="exp-modal-head">
              <strong>Request report</strong>
              <button className="exp-chip" onClick={() => setOpenModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRequestExport}>
              <div className="exp-modal-body">
                <label>Category</label>
                <select
                  className="exp-select"
                  value={form.category}
                  onChange={(e) => onChange("category", e.target.value)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>

                <label>Date</label>
                <div className="exp-row">
                  <input
                    type="date"
                    lang="vi"
                    className="exp-input"
                    value={form.from}
                    onChange={(e) => onChange("from", e.target.value)}
                  />
                  <input
                    type="date"
                    lang="vi"
                    className="exp-input"
                    value={form.to}
                    onChange={(e) => onChange("to", e.target.value)}
                  />
                </div>

                <label>Store</label>
                <input className="exp-input" value={form.store} onChange={(e)=>onChange("store", e.target.value)} />
              </div>

              <div className="exp-modal-foot">
                <button type="button" className="exp-chip" onClick={() => setOpenModal(false)}>Cancel</button>
                <button type="submit" className="exp-chip">Export</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
