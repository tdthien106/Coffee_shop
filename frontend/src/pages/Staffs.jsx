import { useState } from "react";

const STORES = [
  { id:'s1', name:'HCMUS - 227 Nguyễn Văn Cừ', working:200, late:0, early:0 },
  { id:'s2', name:'HCMUS - 227 Nguyễn Văn Cừ', working:200, late:0, early:0 },
  { id:'s3', name:'HCMUS - 227 Nguyễn Văn Cừ', working:200, late:0, early:0 },
];

export default function Staffs() {
  const [tab, setTab] = useState("Find");
  return (
    <section className="card">
      <div className="tabs">
        {["Find","Add","Salary","Scheduling"].map(t=>(
          <button key={t} className={"tab"+(tab===t?" active":"")} onClick={()=>setTab(t)}>
            {t==="Find"?"Find staff":t==="Add"?"Add staff":t}
          </button>
        ))}
      </div>
      {tab==="Find" && <FindStaff />}
      {tab==="Add" && <AddStaff />}
      {tab==="Salary" && <SalaryView />}
      {tab==="Scheduling" && <SchedulingView />}
    </section>
  );
}

/* ---------- shared Field ---------- */
function Field({ label, children }) {
  return (
    <div className="field">
      <div className="label">{label}:</div>
      {children}
    </div>
  );
}

/* ---------- Find staff (editable + Employee Code) ---------- */
function FindStaff(){
  const [editable, setEditable] = useState(false);
  const [form, setForm] = useState({
    employeeCode: "E0001",
    fullName: "Võ Lê Huyền",
    dob: "19/09/2005",
    gender: "Female",
    idCard: "079203011325",
    phone: "0907304059",
    address: "1234 Nguyễn Văn Cừ Quận 5",
  });

  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((s) => ({ ...s, [key]: e.target.value })),
    readOnly: !editable,
    className: "input",
  });

  const onSave = () => {
    // TODO: gọi API update ở đây
    setEditable(false);
  };

  return (
    <div className="panel">
      <div className="search">
        <input className="input" placeholder="Search information of staff" />
        <span>🔍</span>
      </div>

      <div className="profile">
        <img className="avatar-img" src="https://i.pravatar.cc/64?img=5" alt="" />
        <div className="fields">
          <Field label="Employee Code"><input {...bind("employeeCode")} /></Field>
          <Field label="Full Name"><input {...bind("fullName")} /></Field>
          <Field label="Date of birth"><input {...bind("dob")} /></Field>
          <Field label="Gender"><input {...bind("gender")} /></Field>
          <Field label="Identification Card"><input {...bind("idCard")} /></Field>
          <Field label="Phone number"><input {...bind("phone")} /></Field>
          <Field label="Address"><input {...bind("address")} /></Field>
        </div>
      </div>

      <div className="actions">
        {!editable
          ? <button className="btn outline" onClick={()=>setEditable(true)}>Edit</button>
          : <button className="btn primary" onClick={onSave}>Save</button>}
        <button className="btn danger">Delete</button>
      </div>
    </div>
  );
}

/* ---------- Add staff (always editable + minimal validate) ---------- */
function AddStaff(){
  const [form, setForm] = useState({
    employeeCode: "",
    fullName: "",
    dob: "",
    gender: "",
    idCard: "",
    phone: "",
    address: "",
  });

  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((s) => ({ ...s, [key]: e.target.value })),
    className: "input",
  });

  const canSubmit = form.employeeCode && form.fullName && form.phone;

  const onAdd = () => {
    if (!canSubmit) return;
    // TODO: gọi API create ở đây
    alert("Added!\n" + JSON.stringify(form, null, 2));
    setForm({ employeeCode:"", fullName:"", dob:"", gender:"", idCard:"", phone:"", address:"" });
  };

  return (
    <div className="panel">
      <div className="upload" title="Upload avatar">⬆️</div>
      <div className="fields">
        <Field label="Employee Code"><input {...bind("employeeCode")} placeholder="VD: E0005" /></Field>
        <Field label="Full Name"><input {...bind("fullName")} placeholder="Full name" /></Field>
        <Field label="Date of birth"><input {...bind("dob")} placeholder="DD/MM/YYYY" /></Field>
        <Field label="Gender"><input {...bind("gender")} placeholder="Female / Male" /></Field>
        <Field label="Identification Card"><input {...bind("idCard")} placeholder="xxxxxxxxxx" /></Field>
        <Field label="Phone number"><input {...bind("phone")} placeholder="xxxxxxxxxx" /></Field>
        <Field label="Address"><input {...bind("address")} placeholder="Address" /></Field>
      </div>

      <div className="actions">
        <button className="btn primary" disabled={!canSubmit} onClick={onAdd}>Add</button>
        {!canSubmit && <small style={{marginLeft:8,color:'#888'}}>(Cần: Employee Code, Full Name, Phone)</small>}
      </div>
    </div>
  );
}

/* ---------- Salary ---------- */
function SalaryView(){
  return (
    <div className="panel">
      <div className="summary">
        <div className="sum-box"><div>Total working hour</div><b>200</b></div>
        <div className="sum-box"><div>Late Arrival</div><b>0</b></div>
        <div className="sum-box"><div>Early Leave</div><b>0</b></div>
      </div>
      <div className="store-list">
        {STORES.map(s=>(
          <div key={s.id} className="store">
            <div className="row">
              <div className="badge">🏛</div>
              <div className="name">{s.name}</div>
              <div className="pct">0% with last month</div>
            </div>
            <div className="meta">
              <div>Total working hour: <b>{s.working}</b></div>
              <div>Late Arrival: <b>{s.late}</b></div>
              <div>Early Leave: <b>{s.early}</b></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Scheduling + modal ---------- */
function SchedulingView(){
  const [open,setOpen] = useState(false);
  const [storeName,setStore] = useState("");
  const openModal = (name)=>{ setStore(name); setOpen(true); };

  return (
    <>
      <div className="panel">
        <div className="store-list">
          {STORES.map(s=>(
            <div key={s.id} className="store clickable" onClick={()=>openModal(s.name)}>
              <div className="row">
                <div className="badge">🏛</div>
                <div className="name">{s.name}</div>
                <div className="pct">0% with last month</div>
              </div>
              <div className="meta">
                <div>Total working hour: <b>{s.working}</b></div>
                <div>Late Arrival: <b>{s.late}</b></div>
                <div>Early Leave: <b>{s.early}</b></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="modal" onClick={(e)=>{ if(e.target.classList.contains('modal')) setOpen(false) }}>
          <div className="modal-card">
            <div className="modal-head">
              <div>{storeName}</div>
              <button className="close" onClick={()=>setOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="toolbar">
                <span className="week">Week 26 – 06/2025</span>
                <button className="btn save">SAVE</button>
              </div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="staff-col">Staffs</th>
                    <th>Mon<br/><small>23/06</small></th>
                    <th>Tue<br/><small>24/06</small></th>
                    <th>Wed<br/><small>25/06</small></th>
                    <th>Thu<br/><small>26/06</small></th>
                    <th>Fri<br/><small>27/06</small></th>
                  </tr>
                </thead>
                <tbody>
                  {["Nguyễn văn A","Nguyễn văn A","Nguyễn văn A","Nguyễn văn A"].map((n,i)=>(
                    <tr key={i}>
                      <td className="staff-col">{n}</td>
                      <td>6:00 - 14:00</td><td>6:00 - 14:00</td><td>6:00 - 14:00</td><td>6:00 - 14:00</td><td>6:00 - 14:00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
