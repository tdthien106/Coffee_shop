import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadCheckoutDraft, clearCheckoutDraft } from "../utils/checkoutStore";

const API = "http://localhost:3000/api";

export default function CheckoutSummary(){
  const nav = useNavigate();
  const draft = loadCheckoutDraft();

  useEffect(()=>{ if (!draft) nav("/orders", { replace:true }); }, [draft, nav]);
  if (!draft) return null;

  const total = useMemo(
    ()=> draft.items.reduce((s,i)=> s + Number(i.price)*Number(i.quantity||1), 0),
    [draft]
  );

  const payNow = async (method) => {
    try {
      const res = await fetch(`${API}/checkout`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        credentials: "include",
        body: JSON.stringify({
          staff_id: draft.staff_id,
          method,
          items: draft.items.map(({drink_id, quantity, note})=>({drink_id, quantity, note}))
        })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Checkout failed");
      clearCheckoutDraft();
      nav("/checkout/success", { state: json.data, replace:true });
    } catch (e) {
      alert(e.message || "Payment error");
    }
  };

  return (
    <div className="pay-wrap">
      <div className="pay-top">
        <button className="back" onClick={()=>nav("/orders", {replace:true})}>←</button>
        <div className="title">{`TABLE ${draft.table || "1"}`}</div>
        <div className="meta">{new Date().toLocaleDateString()}&nbsp;{new Date().toLocaleTimeString()}</div>
      </div>

      <table className="pay-table">
        <thead>
          <tr><th>ITEM</th><th>Quantity</th><th>Total Amount</th></tr>
        </thead>
        <tbody>
          {draft.items.map(it=>(
            <tr key={it.drink_id}>
              <td>
                <div>{it.name}</div>
                {it.note && <div style={{fontSize:12,opacity:.7}}>Note: {it.note}</div>}
              </td>
              <td><div className="qty-box">{it.quantity}</div></td>
              <td>{(Number(it.price)*it.quantity).toLocaleString("vi-VN")} Đ</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pay-footer">
        <div className="btns">
          <button className="btn cash" onClick={()=>payNow("cash")}>💲 Cash</button>
          <button className="btn transfer" onClick={()=>nav("/checkout/transfer")}>🔳 Transfer</button>
        </div>
        <div className="total">
          <span>Total</span>
          <strong>{total.toLocaleString("vi-VN")} Đ</strong>
        </div>
      </div>
    </div>
  );
}
