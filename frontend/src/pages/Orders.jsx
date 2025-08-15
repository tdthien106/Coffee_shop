import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveCheckoutDraft } from "../utils/checkoutStore";

/* ====== Config API ====== */
const API = "http://localhost:3000/api";

/* ====== Tag ghi chú gợi ý ====== */
const PRESET_TAGS = ["Ít đường", "Ít sữa", "Ít đá", "Để đá riêng", "Không topping"];

/* ====== Utils ====== */
const fmtVND = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

export default function Orders() {
  /* ====== State menu bên trái ====== */
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [menu, setMenu] = useState([]); // item_id, name, category, price, image_url
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  /* ====== State giỏ hàng / panel bên phải ====== */
  const [cart, setCart] = useState([]);
  const [guests, setGuests] = useState(2);
  const [table, setTable] = useState("1");

  /* ====== Modal ghi chú ====== */
  const [noteModal, setNoteModal] = useState({
    open: false,
    itemId: null,
    text: "",
    tags: [],
  });

  /* ====== Lấy menu từ backend ====== */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${API}/menu/items?withDrink=1`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Menu fetch failed (${res.status})`);
        const json = await res.json();
        const rows = (json?.data || []).map((r) => ({
          item_id: r.item_id,
          name: r.name,
          category: r.category || "Other",
          price: Number(r.base_price ?? r.price) || 0,
          image_url: r.image_url || r.image_path || "",
        }));
        setMenu(rows);
      } catch (e) {
        setErr(e.message || "Load menu error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ====== Category list (có All) ====== */
  const categories = useMemo(() => {
    const set = new Set(menu.map((m) => m.category || "Other"));
    return ["All", ...Array.from(set)];
  }, [menu]);

  /* ====== Lọc theo search & category ====== */
  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    return menu.filter((m) => {
      const okCat = activeCat === "All" || m.category === activeCat;
      const okQ = !key || m.name.toLowerCase().includes(key);
      return okCat && okQ;
    });
  }, [menu, activeCat, q]);

  /* ====== Hành vi giỏ hàng ====== */
  const addToCart = (m) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.item_id === m.item_id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx].quantity += 1;
        return next;
      }
      return [
        ...prev,
        {
          item_id: m.item_id,
          name: m.name,
          price: Number(m.price) || 0,
          quantity: 1,
          image_url: m.image_url || "",
          notes: { text: "", tags: [] },
        },
      ];
    });
  };

  const inc = (id) =>
    setCart((cs) => cs.map((x) => (x.item_id === id ? { ...x, quantity: x.quantity + 1 } : x)));
  const dec = (id) =>
    setCart((cs) =>
      cs.map((x) => (x.item_id === id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x))
    );
  const removeLine = (id) => setCart((cs) => cs.filter((x) => x.item_id !== id));

  /* ====== Modal helpers ====== */
  const openNoteModal = (itemId) => {
    const it = cart.find((x) => x.item_id === itemId);
    setNoteModal({
      open: true,
      itemId,
      text: it?.notes?.text || "",
      tags: it?.notes?.tags || [],
    });
  };
  const closeNoteModal = () => setNoteModal({ open: false, itemId: null, text: "", tags: [] });
  const toggleModalTag = (tag) =>
    setNoteModal((s) => ({
      ...s,
      tags: s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag],
    }));
  const saveNoteModal = () => {
    setCart((cs) =>
      cs.map((x) =>
        x.item_id === noteModal.itemId ? { ...x, notes: { text: noteModal.text, tags: noteModal.tags } } : x
      )
    );
    closeNoteModal();
  };

  const cancelOrder = () => {
    setCart([]);
    setGuests(2);
    setTable("1");
  };

  /* ====== Tổng tiền ====== */
  const subtotal = useMemo(() => cart.reduce((s, it) => s + it.price * it.quantity, 0), [cart]);
  const service = Math.round(subtotal * 0.0); // nếu muốn 10% đổi thành 0.1
  const total = subtotal + service;

  /* ====== Thanh toán ====== */
  const handlePayment = async () => {
    if (!cart.length) return alert("Chưa có món!");
    try {
      const me =
        JSON.parse(sessionStorage.getItem("user") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null") ||
        {};
      const staffId = me?.user_id || me?.id;
      if (!staffId) return alert("Không xác định được staff đang đăng nhập.");

      const orderId = "O" + Date.now();
      const createRes = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId, staff_id: staffId }),
      });
      if (!createRes.ok) throw new Error("Create order failed");

      for (const it of cart) {
        const addRes = await fetch(`${API}/orders/${orderId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            drink_id: it.item_id,
            quantity: it.quantity,
            // note: ${it.notes.tags.join("; ")}${it.notes.text ? " | " + it.notes.text : ""},
          }),
        });
        if (!addRes.ok) throw new Error("Add item failed");
      }

      alert("Đã tạo order " + orderId);
      cancelOrder();
    } catch (e) {
      console.error(e);
      alert(e.message || "Payment error");
    }
  };

const nav = useNavigate();

const goPayment = () => {
  if (!cart.length) return alert("Chưa có món!");
  const me = JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "{}");

  saveCheckoutDraft({
    staff_id: me?.user_id || me?.id,
    table,
    guests,
    items: cart.map(it => ({
      drink_id: it.item_id,
      name: it.name,
      quantity: it.quantity,
      price: it.price,
      note: `${(it.notes?.tags||[]).join("; ")}${it.notes?.text ? " | " + it.notes.text : ""}`
    }))
  });

  nav("/checkout");
};


  /* ====== Render ====== */
  return (
    <>
      <div className="orders-page">
        {/* LEFT */}
        <div className="orders-left">
          <header className="orders-header">
            <div className="title">MAT COFFEE SHOP</div>
            <div className="search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search product or any name..."
              />
              <span className="icon">🔍</span>
            </div>
          </header>

          <div className="cat-row">
            {categories.map((c) => (
              <button
                key={c}
                className={`cat-btn ${c === activeCat ? "active" : ""}`}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p">Loading menu…</div>
          ) : err ? (
            <div className="p err">{err}</div>
          ) : (
            <div className="grid">
              {filtered.map((m) => (
                <div
                  key={m.item_id}
                  className="card"
                  onClick={() => addToCart(m)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-img">
                    {m.image_url ? <img src={m.image_url} alt={m.name} /> : <div className="img-ph">IMG</div>}
                  </div>
                  <div className="card-body">
                    <div className="card-name">{m.name}</div>
                    <div className="card-foot">
                      <span className="card-cat">{m.category || "Drink"}</span>
                      <span className="card-price">{fmtVND(m.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="p dim">Không có món phù hợp.</div>}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <aside className="orders-right">
          <div className="order-bar">
            <div>
              <div className="label">ORDER #</div>
              <div className="id dim">Tự sinh khi thanh toán</div>
            </div>
            <div className="info-line">
              <span>👥</span>&nbsp;
              <input
                className="mini"
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value || 1))}
              />
              &nbsp;&nbsp;
              <span>🪑 Table</span>&nbsp;
              <input className="mini" value={table} onChange={(e) => setTable(e.target.value)} />
            </div>
          </div>

          <div className="cart">
            {cart.map((c) => (
              <div key={c.item_id} className="line">
                {/* ẢNH */}
                <div className="thumb">
                  {c.image_url ? <img src={c.image_url} alt={c.name} /> : <div className="ph small">IMG</div>}
                </div>

                {/* NỘI DUNG */}
                <div className="meta">
                  <div className="nm" title={c.name}>{c.name}</div>
                  <div className="uprice">{fmtVND(c.price)}</div>

                  {/* NÚT DƯỚI TÊN: Xoá | Ghi chú | Số lượng */}
                  <div className="actions-row">
                    <button className="rm" title="Remove item" onClick={() => removeLine(c.item_id)}>➖</button>
                    <button className="note-ico" title="Ghi chú" onClick={() => openNoteModal(c.item_id)}>✎</button>
                    <div className="q-ctrl">
                      <button onClick={() => dec(c.item_id)}>-</button>
                      <span>{c.quantity}</span>
                      <button onClick={() => inc(c.item_id)}>+</button>
                    </div>
                  </div>

                 
                </div>
              </div>
            ))}

            {cart.length === 0 && (
              <div className="p dim">Chưa có món. Chọn từ danh sách bên trái.</div>
            )}
          </div>

          <div className="summary">
            <div className="row">
              <span>SUBTOTAL</span>
              <span>{fmtVND(subtotal)}</span>
            </div>
          
            <div className="row total">
              <span>TOTAL</span>
              <span>{fmtVND(total)}</span>
            </div>
          </div>

          <div className="actions">
            <button className="cancel" onClick={cancelOrder}>CANCEL ORDER</button>
            <button className="pay" onClick={goPayment}>PAYMENT</button>
          </div>
        </aside>
      </div>

      {/* ===== MODAL GHI CHÚ ===== */}
      {noteModal.open && (
        <div className="modal" onMouseDown={closeNoteModal}>
          <div className="modal-card" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>Ghi chú cho món</div>
              <button className="close" onClick={closeNoteModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="tags" style={{ marginBottom: 10 }}>
                {PRESET_TAGS.map((t) => {
                  const on = noteModal.tags.includes(t);
                  return (
                    <button
                      key={t}
                      className={`tag ${on ? "on" : ""}`}
                      onClick={() => toggleModalTag(t)}
                      type="button"
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <textarea
                className="note-input"
                rows={4}
                placeholder="Ghi chú thêm…"
                value={noteModal.text}
                onChange={(e) => setNoteModal((d) => ({ ...d, text: e.target.value }))}
              />
              <div className="modal-actions">
                <button className="btn" onClick={closeNoteModal}>Hủy</button>
                <button className="btn primary" onClick={saveNoteModal}>Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}