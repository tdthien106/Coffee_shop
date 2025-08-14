import { useEffect, useMemo, useState } from "react";

/* ====== Config API (đổi nếu cần) ====== */
const API = "http://localhost:3000/api";

/* ====== Tag ghi chú gợi ý ====== */
const PRESET_TAGS = ["Ít đường", "Ít sữa", "Ít đá", "Để đá riêng", "Không topping"];

/* ====== Utils ====== */
const fmtVND =  (n)=>
  (Number(n) || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

export default function Orders() {
  /* ====== State menu bên trái ====== */
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [menu, setMenu] = useState([]); // item_id, name, category, price
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  /* ====== State giỏ hàng / panel bên phải ====== */
  const [cart, setCart] = useState([]);
  const [guests, setGuests] = useState(2);
  const [table, setTable] = useState("1");

  /* ====== Lấy menu từ backend ====== */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`${API}/menu/items`);
        if (!res.ok) throw new Error(`Menu fetch failed (${res.status})`);
        const json = await res.json();
        // Kỳ vọng json.data = [{item_id, name, category, base_price/price}]
        const rows = (json?.data || []).map((r) => ({
          item_id: r.item_id,
          name: r.name,
          category: r.category || "Other",
          price: Number(r.base_price ?? r.price) || 0,
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
        // Khi đã có sẵn, không mở note
        return next;
      }
      return [
        ...prev,
        {
          item_id: m.item_id,
          name: m.name,
          price: Number(m.price) || 0,
          quantity: 1,
          notes: { text: "", tags: [] },
          openNote: true, // mở ghi chú sẵn khi mới thêm món
        },
      ];
    });
  };

  const inc = (id) => {
    setCart((cs) =>
      cs.map((x) => (x.item_id === id ? { ...x, quantity: x.quantity + 1 } : x))
    );
  };
  const dec = (id) => {
    setCart((cs) =>
      cs.map((x) =>
        x.item_id === id ? { ...x, quantity: Math.max(1, x.quantity - 1) } : x
      )
    );
  };
  const removeLine = (id) => setCart((cs) => cs.filter((x) => x.item_id !== id));

  const toggleOpenNote = (id) =>
    setCart((cs) =>
      cs.map((x) => (x.item_id === id ? { ...x, openNote: !x.openNote } : x))
    );

  const setNoteText = (id, val) =>
    setCart((cs) =>
      cs.map((x) =>
        x.item_id === id ? { ...x, notes: { ...x.notes, text: val } } : x
      )
    );

  const toggleTag = (id, tag) =>
    setCart((cs) =>
      cs.map((x) => {
        if (x.item_id !== id) return x;
        const has = x.notes.tags.includes(tag);
        return {
          ...x,
          notes: {
            ...x.notes,
            tags: has ? x.notes.tags.filter((t) => t !== tag) : [...x.notes.tags, tag],
          },
        };
      })
    );

  const cancelOrder = () => {
    setCart([]);
    setGuests(2);
    setTable("1");
  };

  /* ====== Tổng tiền ====== */
  const subtotal = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.quantity, 0),
    [cart]
  );
  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;

  /* ====== Thanh toán (demo – backend của bạn xử lý) ====== */
  const handlePayment = async () => {
    if (!cart.length) return alert("Chưa có món!");
    try {
      const me = JSON.parse(sessionStorage.getItem("user") || "{}");
      const staffId = me?.user_id; // dùng khi tạo order

      // 1) Tạo order
      const orderId = "O" + Date.now();
      const createRes = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          order_id: orderId,
          staff_id: staffId,
          // có thể gửi thêm guests / table nếu backend hỗ trợ
        }),
      });
      if (!createRes.ok) throw new Error("Create order failed");

      // 2) Add từng item vào order_detail (nếu backend có cột note thì gửi kèm)
      for (const it of cart) {
        await fetch(`${API}/orders/${orderId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            drink_id: it.item_id,
            quantity: it.quantity,
            // note: ${it.notes.tags.join("; ")}${it.notes.text ? " | " + it.notes.text : ""},
          }),
        });
      }

      alert("Đã tạo order " + orderId);
      cancelOrder();
    } catch (e) {
      console.error(e);
      alert(e.message || "Payment error");
    }
  };

  /* ====== Render ====== */
  return (
    <div className="orders-page">
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
              <div key={m.item_id} className="card" onClick={() => addToCart(m)}>
                <div className="img ph">
                  <span>IMG</span>
                </div>
                <div className="name">{m.name}</div>
                <div className="price">{fmtVND(m.price)}</div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p dim">Không có món phù hợp.</div>
            )}
          </div>
        )}
      </div>

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
            <input
              className="mini"
              value={table}
              onChange={(e) => setTable(e.target.value)}
            />
          </div>
        </div>

        <div className="cart">
          {cart.map((c) => (
            <div key={c.item_id} className="line">
              <div className="thumb ph small">IMG</div>
              <div className="meta">
                <div className="ln">
                  <div className="nm">{c.name}</div>
                  <button className="rm" onClick={() => removeLine(c.item_id)}>
                    <span style={{ color: "#e23" }}>➖</span>
                  </button>
                </div>

                <div className="qty">
                  <span className="q-label">Quantity</span>
                  <div className="q-ctrl">
                    <button onClick={() => dec(c.item_id)}>-</button>
                    <span>{c.quantity}</span>
                    <button onClick={() => inc(c.item_id)}>+</button>
                  </div>
                </div>

                <div className="price-line">{fmtVND(c.price)}</div>

                {/* Note UI */}
                <div className="note-row">
                  <button
                    type="button"
                    className="note-toggle"
                    onClick={() => toggleOpenNote(c.item_id)}
                  >
                    📝 Ghi chú
                  </button>
                </div>

                {c.openNote && (
                  <div className="note-box">
                    <div className="tags">
                      {PRESET_TAGS.map((t) => {
                        const on = c.notes.tags.includes(t);
                        return (
                          <button
                            key={t}
                            className={`tag ${on ? "on" : ""}`}
                            onClick={() => toggleTag(c.item_id, t)}
                            type="button"
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <textarea
                      value={c.notes.text}
                      onChange={(e) => setNoteText(c.item_id, e.target.value)}
                      placeholder="Ghi chú thêm (tuỳ chọn)…"
                      rows={3}
                    />
                  </div>
                )}
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
          <div className="row">
            <span>
              SERVICE CHARGE <strong>10%</strong>
            </span>
            <span>{fmtVND(service)}</span>
          </div>
          <div className="row total">
            <span>TOTAL</span>
            <span>{fmtVND(total)}</span>
          </div>
        </div>

        <div className="actions">
          <button className="cancel" onClick={cancelOrder}>
            CANCEL ORDER
          </button>
          <button className="pay" onClick={handlePayment}>
            PAYMENT
          </button>
        </div>
      </aside>
    </div>
  );
}