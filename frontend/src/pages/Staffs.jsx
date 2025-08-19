import { useState } from "react";

const API = "http://localhost:3000/api";

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


function FindStaff(){
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editable, setEditable] = useState(false);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState("");
  const [userID, setUserID] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const onSearch = async () => {
    setLoading(true);
    setErr("");
    setForm(null);
    try {
      // Lấy thông tin employee
      const empRes = await fetch(`${API}/employees/${search.trim()}`);
      if (!empRes.ok) throw new Error("Không tìm thấy nhân viên");
      const employee = await empRes.json();
      setUserID(employee.user_id);
      setEmployeeId(employee.employee_id);

      // Lấy thông tin user liên kết
      const userRes = await fetch(`${API}/users/${employee.user_id}`);
      if (!userRes.ok) throw new Error("Không tìm thấy thông tin người dùng");
      const user = await userRes.json();

      // Gộp thông tin cần thiết
      setForm({
        userID: user.id,
        employeeCode: employee.employee_id,
        fullName: user.data?.name,
        dob: user.data?.birthday,
        gender: user.data?.gender,
        phone: user.data?.phone_number,
      });
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  const bind = (key) => ({
    value: form ? form[key] : "",
    onChange: (e) => setForm((s) => ({ ...s, [key]: e.target.value })),
    readOnly: !editable,
    className: "input",
  });

  const onSave = async () => {
    setLoading(true);
    setErr("");
    try {
      // Lấy thông tin để kiểm tra 
      const userRes = await fetch(`${API}/users`);
      const users = await userRes.json();
      const otherUsers = (users.data || []).filter(u => u.user_id !== userID);

      const empRes = await fetch(`${API}/employees`);
      const employees = await empRes.json();
      const otherEmployees = (employees.data || []).filter(e => e.employee_id !== employeeId);
      // Kiểm tra trùng lặp
      if (otherUsers.some(u => u.name === form.fullName)) {
        setErr("Tên nhân viên đã tồn tại!");
        setLoading(false);
        return;
      }

      if (otherEmployees.some(e => e.employee_id === form.employeeCode)) {
        setErr("Mã nhân viên đã tồn tại!");
        setLoading(false);
        return;
      }

      // Cập nhật thông tin user
      await fetch(`${API}/users/${userID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,
          birthday: form.dob,
          gender: form.gender,
          phone_number: form.phone,
        }),
      });

      // Cập nhật thông tin employee
      await fetch(`${API}/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position: form.position,
          salary: form.salary,
        }),
      });

      setEditable(false);
      alert("Đã lưu thông tin!");
    } catch (e) {
      setErr("Lưu thất bại: " + e.message);
    }
    setLoading(false);
  };

const onDelete = async () => {
  if (!employeeId) return;
  if (!window.confirm("Bạn có chắc muốn xóa nhân viên này?")) return;
  setLoading(true);
  setErr("");
  try {
    await fetch(`${API}/employees/${employeeId}`, {
      method: "DELETE",
    });
    alert("Đã xóa nhân viên!");
    setForm(null);
    setSearch("");
  } catch (e) {
    setErr("Xóa thất bại: " + e.message);
  }
  setLoading(false);
};

  return (
    <div className="panel">
    <div className="search">
      <input
        className="input"
        placeholder="Nhập mã nhân viên (VD: S001)"
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onSearch(); }}
      />
      <button className="btn" onClick={onSearch} disabled={loading}>Tìm kiếm</button>
    </div>

      {loading && <div style={{marginTop:16, color:'#888'}}>Đang tải...</div>}
      {err && <div style={{marginTop:16, color:'red'}}>{err}</div>}

      {form && (
        <div className="profile">
          <img className="avatar-img" src="https://i.pravatar.cc/64?img=5" alt="" />
          <div className="fields">
            <Field label="Employee Code"><input {...bind("employeeCode")} /></Field>
            <Field label="Full Name"><input {...bind("fullName")} /></Field>
            <Field label="Date of birth"><input {...bind("dob")} /></Field>
            <Field label="Gender"><input {...bind("gender")} /></Field>
            <Field label="Phone number"><input {...bind("phone")} /></Field>
          </div>
          <div className="actions">
            {!editable
              ? <button className="btn outline" onClick={()=>setEditable(true)}>Edit</button>
              : <button className="btn primary" onClick={onSave} disabled={loading}>Save</button>}
            <button className="btn danger" onClick={onDelete} disabled={loading}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
/* ---------- Add staff (always editable + minimal validate) ---------- */

async function getNextUserId() {
  const res = await fetch(`${API}/users`);
  const users = await res.json();
  // Lấy user_id lớn nhất
  const maxId = users.data
    .map(u => parseInt(u.user_id.replace("U", ""), 10))
    .reduce((a, b) => Math.max(a, b), 0);
  // Tạo user_id tiếp theo
  const nextId = "U" + String(maxId + 1).padStart(3, "0");
  return nextId;
}

function AddStaff(){
  const [form, setForm] = useState({
    employeeCode: "",
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");


  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((s) => ({ ...s, [key]: e.target.value })),
    className: "input",
  });

  const canSubmit = form.employeeCode && form.fullName && form.phone && form.username && form.password;

  const onAdd = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setErr("");
    setSuccess("");
    
    try {
      //Lấy thông tin để kiểm tra trùng lặp
      const userRes1 = await fetch(`${API}/users`);
      const users = await userRes1.json();
      const otherUsers = (users.data || []).filter(u => u.username !== form.username && u.name !== form.fullName);
      const empRes1 = await fetch(`${API}/employees`);
      const employees = await empRes1.json();
      const otherEmployees = (employees.data || []).filter(e => e.employee_id !== form.employeeCode);
      // Kiểm tra trùng lặp
      if (otherUsers.some(u => u.username === form.username)) {
        setErr("Username đã tồn tại!");
        setLoading(false);
        return;
      }
      if (otherEmployees.some(e => e.employee_id === form.employeeCode)) {
        setErr("Mã nhân viên đã tồn tại!");
        setLoading(false);
        return;
      }

      // Lấy user_id tiếp theo
      const next_userID = await getNextUserId();
      // 1. Tạo user mới
      const userRes = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: next_userID,
          name: form.fullName,
          gender: form.gender,
          birthday: form.dob,
          phone_number: form.phone,
          username: form.username,
          password: form.password,
        }),
      });
      if (!userRes.ok) throw new Error("Tạo user thất bại");
      const user = await userRes.json();
      const user_id = user.data?.user_id || user.user_id || form.username;

      // 2. Tạo employee mới
      const empRes = await fetch(`${API}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: form.employeeCode,
          user_id: user_id,
        }),
      });
      if (!empRes.ok) throw new Error("Tạo employee thất bại");

      setSuccess("Thêm nhân viên thành công!");
      setForm({
        employeeCode:"", fullName:"", dob:"", gender:"", phone:"",
        username:"", password:""
      });
    } catch (e) {
      setErr(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="panel">
      <div className="fields">
        <Field label="Employee Code"><input {...bind("employeeCode")} placeholder="VD: E0005" /></Field>
        <Field label="Full Name"><input {...bind("fullName")} placeholder="Full name" /></Field>
        <Field label="Date of birth"><input {...bind("dob")} placeholder="YYYY-MM-DD" /></Field>
        <Field label="Gender"><input {...bind("gender")} placeholder="Female / Male" /></Field>
        <Field label="Phone number"><input {...bind("phone")} placeholder="xxxxxxxxxx" /></Field>
        <Field label="Username"><input {...bind("username")} placeholder="Username" /></Field>
        <Field label="Password"><input {...bind("password")} type="password" placeholder="Password" /></Field>
      </div>

      <div className="actions">
        <button className="btn primary" disabled={!canSubmit || loading} onClick={onAdd}>Add</button>
        {!canSubmit && <small style={{marginLeft:8,color:'#888'}}>(Cần nhập đủ thông tin)</small>}
        {loading && <span style={{marginLeft:8,color:'#888'}}>Đang thêm...</span>}
        {err && <div style={{color:'red',marginTop:8}}>{err}</div>}
        {success && <div style={{color:'green',marginTop:8}}>{success}</div>}
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
