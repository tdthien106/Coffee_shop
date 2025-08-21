// src/pages/Export.jsx
import { useEffect, useMemo, useState } from "react";

const CATEGORIES = [
  { id: "order", label: "Order Summary" },
  { id: "dish", label: "Dish Summary" },
  { id: "attendance", label: "Attendance Summary" },
  { id: "revenue", label: "Revenue Summary" },
];
const PAGE_SIZE = [25, 50, 100];``

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
    store: "",
  });

  useEffect(() => {
    fetchExports();
  }, []);

  async function fetchExports() {
    setLoading(true);
    try {
      const demo = [
        { id: "1", category: "Order Summary",     accessedAt: "10:00 30/06/2025", dateRange: "01/06–30/06", downloadUrl: "#" },
        { id: "2", category: "Dish Summary",      accessedAt: "10:00 30/06/2025", dateRange: "01/06–30/06", downloadUrl: "#" },
        { id: "3", category: "Attendance Summary",accessedAt: "10:00 30/06/2025", dateRange: "01/06–30/06", downloadUrl: "#" },
        { id: "4", category: "Revenue Summary",   accessedAt: "10:00 30/06/2025", dateRange: "01/06–30/06", downloadUrl: "#" },
      ];
      setRows(demo);
    } finally {
      setLoading(false);
    }
  }

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const handleDownload = (url) => url && window.open(url, "_blank");

  async function handleRequestExport(e) {
    e.preventDefault();
    if (!form.from || !form.to) return alert("Please select a date range.");
    try {
      setLoading(true);
      setOpenModal(false);
      fetchExports();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="exp-wrap">
      {/* ======= SCOPED CSS (chỉ sửa giao diện, không đụng global) ======= */}
      <style>{`
        /* Layout tổng: bỏ nền xám, kéo full chiều ngang vùng content */
        .exp-wrap{
          padding:28px;
          background:transparent;         /* <— bỏ nền xám */
          min-height:100%;
          width:100%;                      /* <— kéo full width theo content */
        }
        .exp-title{font-size:22px;font-weight:800;color:#1f2937;margin:0 0 12px}
        .exp-toolbar{display:flex;gap:8px;margin-bottom:10px}
        .exp-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:6px 10px;border-radius:6px;border:1px solid #bfc5cc;
          background:#f2f4f7;box-shadow:0 1px 0 rgba(0,0,0,.15), inset 0 1px 0 #fff;
          font-weight:700;font-size:12px;cursor:pointer;color:#111;
        }
        .exp-btn--green{background:#e9f7ea;border-color:#a6d7a6;color:#276a2b}
        .exp-btn svg{width:14px;height:14px;flex:0 0 14px}

        /* Card cũ: biến thành wrapper trong suốt, không viền/đổ bóng */
        .exp-card{
          background:transparent;          /* <— không nền */
          border:none;                     /* <— không viền */
          border-radius:0;
          box-shadow:none;                 /* <— không bóng */
          width:100%;                      /* <— chiếm full chiều ngang */
        }

        /* Bảng: full width, viền ô rõ ràng */
        .exp-table{width:100%;max-width:none;border-collapse:collapse;font-size:13.5px;background:#fff}
        .exp-th{
          background:#f3f4f6;color:#333;text-align:left;font-weight:800;padding:10px;
          border:1px solid #d2d6dc;
        }
        .exp-td{padding:10px;border:1px solid #e5e7eb;background:#fff}
        .exp-tr:hover .exp-td{background:#fafafa}

        .exp-dl{
          display:inline-flex;align-items:center;gap:6px;
          padding:4px 8px;border:1px solid #bfbfbf;border-radius:6px;background:#f0f0f0;
          font-size:12px;font-weight:700;box-shadow:0 1px 0 rgba(0,0,0,.18), inset 0 1px 0 #fff;cursor:pointer
        }
        .exp-dl svg{width:12px;height:12px;flex:0 0 12px}

        /* Footer (giữ nếu bạn còn cần 25/50/100) */
        .exp-foot{display:flex;align-items:center;justify-content:space-between;background:transparent;padding:8px 0}
        .exp-chip{
          padding:4px 8px;border:1px solid #bfc5cc;border-radius:6px;background:#ececec;
          font-weight:700;font-size:12px;box-shadow:inset 0 1px 0 #fff, 0 1px 0 rgba(0,0,0,.15);cursor:pointer;margin-right:6px
        }
        .exp-chip.active{background:#fff}
        .exp-pager{display:flex;align-items:center;gap:8px}
        .exp-pager .exp-chip{margin-right:0;padding:6px 10px}

        /* Modal giữ nguyên */
        .exp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:50}
        .exp-modal{width:min(520px,92vw);background:#fff;border:1px solid #cfd3da;border-radius:10px;overflow:hidden;box-shadow:0 18px 60px rgba(0,0,0,.35)}
        .exp-modal-head{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #dcdcdc;background:#f6f7f9}
        .exp-modal-body{padding:12px}
        .exp-modal-body label{display:block;font-size:13px;color:#555;margin:8px 0 6px}
        .exp-row{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .exp-input,.exp-select{width:100%;padding:8px 10px;border:1px solid #bfc5cc;border-radius:8px;background:#fff}
        .exp-modal-foot{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;border-top:1px solid #dcdcdc;background:#f6f7f9}

        .exp-th, .exp-td {
            padding: 10px;
            border: 1px solid #e5e7eb;
        }
        .exp-col-num { text-align: center; width: 50px }
        .exp-col-cat { text-align: center; }
        .exp-col-date { text-align: center; }
        .exp-col-dl { text-align: center; }
      `}</style>

      {/* Title + toolbar */}
      <h1 className="exp-title">Export data</h1>
      <div className="exp-toolbar">
        <button className="exp-btn" onClick={() => setOpenModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M4 21h16"/>
          </svg>
          Export data
        </button>
        <button className="exp-btn exp-btn--green" onClick={fetchExports}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/>
          </svg>
          Reload
        </button>
      </div>

      {/* Wrapper (đã bỏ nền + bóng) + Bảng full width */}
      <div className="exp-card">
        <div style={{ overflowX: "auto" }}>
          <table className="exp-table">
            <thead>
              <tr>
                <th className="exp-th exp-col-num">#</th>
                <th className="exp-th exp-col-cat">Category</th>
                <th className="exp-th exp-col-date">Accessed on</th>
                <th className="exp-th exp-col-date">Date</th>
                <th className="exp-th exp-col-dl">Download</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td className="exp-td" colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "16px" }}>Loading…</td></tr>
              )}

              {!loading && paged.length === 0 && (
                <tr><td className="exp-td" colSpan={5} style={{ textAlign: "center", color: "#64748b", padding: "16px" }}>No exports yet.</td></tr>
              )}

              {!loading && paged.map((r, i) => (
                <tr key={r.id} className="exp-tr">
                  <td className="exp-td exp-col-num">{(page - 1) * pageSize + i + 1}.</td>
                  <td className="exp-td exp-col-cat">{r.category}</td>
                  <td className="exp-td exp-col-date">{r.accessedAt}</td>
                  <td className="exp-td exp-col-date">{r.dateRange}</td>
                  <td className="exp-td exp-col-dl">
                    <button className="exp-dl" onClick={() => handleDownload(r.downloadUrl)}>
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

        {/* Footer: để lại 25 / 50 / 100; nếu muốn bỏ hẳn, xóa block này */}
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

      {/* Modal (giữ nguyên chức năng) */}
      {openModal && (
        <div className="exp-backdrop" onClick={() => setOpenModal(false)}>
          <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="exp-modal-head">
              <strong>Request report</strong>
              <button className="exp-chip" onClick={() => setOpenModal(false)}>✕</button>
            </div>
            <form onSubmit={handleRequestExport}>
              <div className="exp-modal-body">
                <label>Date</label>
                <div className="exp-row">
                  <input type="date" lang="vi" className="exp-input" value={form.from} onChange={(e) => onChange("from", e.target.value)} />
                  <input type="date" lang="vi" className="exp-input" value={form.to}   onChange={(e) => onChange("to", e.target.value)} />
                </div>

                <label>Category</label>
                <select className="exp-select" value={form.category} onChange={(e) => onChange("category", e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>

                <label>Store</label>
                <input className="exp-input" value="HCMUS - 227NVC" disabled />
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
