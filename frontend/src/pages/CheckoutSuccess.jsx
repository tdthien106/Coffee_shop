import { useLocation, useNavigate } from "react-router-dom";

export default function CheckoutSuccess(){
  const nav = useNavigate();
  const { state } = useLocation() || {};

  return (
    <div className="success-wrap">
      <div className="pay-top">
        <button className="back" onClick={()=>nav("/orders", { replace:true })}>←</button>
        <div className="title">TRANSFER</div>
        <div className="meta">{new Date().toLocaleDateString()}&nbsp;{new Date().toLocaleTimeString()}</div>
      </div>

      <div className="ok">
        <div className="big">Successful !!!</div>
        <div className="tick">✔️</div>
        {state?.order_id && (
          <div className="info">
            Order: <strong>{state.order_id}</strong> – Payment: <strong>{state.payment_id}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
