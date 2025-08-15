// src/pages/CheckoutTransfer.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadCheckoutDraft, clearCheckoutDraft } from "../utils/checkoutStore";

const API = "http://localhost:3000/api";

export default function CheckoutTransfer() {
  const nav = useNavigate();
  const draft = loadCheckoutDraft();
  const [busy, setBusy] = useState(false);

  // Không có draft thì quay lại Orders
  useEffect(() => {
    if (!draft) nav("/orders", { replace: true });
  }, [draft, nav]);
  if (!draft) return null;

  const total = useMemo(
    () =>
      draft.items.reduce(
        (s, i) => s + Number(i.price) * Number(i.quantity || 1),
        0
      ),
    [draft]
  );

  async function confirmPaid() {
    try {
      setBusy(true);

      // Tạo order + payment (transfer) 1 lần
      const res = await fetch(`${API}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          staff_id: draft.staff_id,
          method: "transfer",
          items: draft.items.map(({ drink_id, quantity, note }) => ({
            drink_id,
            quantity,
            note,
          })),
        }),
      });

      // Tránh lỗi Unexpected token '<'
      const ct = res.headers.get("content-type") || "";
      const payload = ct.includes("application/json")
        ? await res.json()
        : { success: false, message: await res.text() };

      if (!res.ok || payload.success === false) {
        const msg = payload.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }

      // OK
      clearCheckoutDraft();
      nav("/checkout/success", {
        replace: true,
        state: payload.data, // {order_id, payment_id, amount, method}
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Confirm payment failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="transfer-wrap">
      <div className="pay-top">
        <button className="back" onClick={() => nav("/checkout", { replace: true })}>
          ←
        </button>
        <div className="title">TRANSFER</div>
        <div className="meta">
          {new Date().toLocaleDateString()}&nbsp;{new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="qr-box">
        <div className="bank">
          <div>Account Number : <strong>0123456789</strong></div>
          <div>Bank : <strong>KHTN BANK</strong></div>
          <div>Name : <strong>MAI ANH TUAN</strong></div>
        </div>

        <div className="qr">
          {/* Chọn 1 trong 2 cách ảnh:
              1) Ảnh đặt tại frontend/public/qr.jpg  -> src="/qr.jpg"
              2) Ảnh tĩnh từ backend/public/images/qr.jpg -> src="http://localhost:3000/static/images/qr.jpg"
          */}
          <img src="/qr.jpg" alt="VNPay QR" />
          <div className="hint">Scan to Pay</div>
        </div>
      </div>

      <div className="btns" style={{ justifyContent: "center", marginTop: 16 }}>
        <button className="btn primary" onClick={confirmPaid} disabled={busy}>
          {busy ? "Processing..." : "Đã nhận tiền"}
        </button>
      </div>

      <div style={{ marginTop: 12, textAlign: "center", opacity: 0.75 }}>
        Total:&nbsp;<strong>{total.toLocaleString("vi-VN")} đ</strong>
      </div>
    </div>
  );
}
