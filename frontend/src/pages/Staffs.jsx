import { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

const STORES = [
  { id:'s1', name:'HCMUS - 227 Nguyễn Văn Cừ', working:200, late:0, early:0 },
  { id:'s2', name:'HCMUS - 227 Nguyễn Văn Cừ', working:200, late:0, early:0 },
  { id:'s3', name:'HCMUS - 227 Nguyễn Văn Cừ', working:200, late:0, early:0 },
];


export default function Staffs() {
  const [tab, setTab] = useState("Find");
  return (
    <section className="card no-hover" >
      <div className="card-header">
          <div className="title">GROUP 06 Staffs</div>
          <div className="tabs staffs">
              {["Find","Add","Salary","Scheduling"].map(t=>(
                  <button key={t} className={"tab staffs"+(tab===t?" active":"")} onClick={()=>setTab(t)}>
                    {t==="Find"?"Find staff":t==="Add"?"Add staff":t}
                  </button>
                ))}
          </div>
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
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);

        // Lấy tất cả nhân viên
        const empRes = await fetch(`${API}/employees`);
        const empJson = await empRes.json();

        // Lấy tất cả users
        const userRes = await fetch(`${API}/users`);
        const userJson = await userRes.json();

        // Gộp dữ liệu employee với user
        const merged = (empJson.data || []).map((emp) => {
          const user = (userJson.data || []).find(
            (u) => u.user_id === emp.user_id
          );
          return {
            employeeId: emp.employee_id,
            userId: emp.user_id,
            fullName: user?.name || "N/A",
            position: emp.position,
          };
        });

        setStaffList(merged);
      } catch (err) {
        console.error(err);
        setErr("Không thể tải danh sách nhân viên");
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);


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
      <button className="btn staffs" onClick={onSearch} disabled={loading}>Tìm kiếm</button>
    </div>

      {loading && <div style={{marginTop:16, color:'#888'}}>Đang tải...</div>}
      {err && <div style={{marginTop:16, color:'red'}}>{err}</div>}
    {/* Danh sách nhân viên */}
      <div className="staff-list">
        <h3>Danh sách nhân viên</h3>
        <ul>
          {staffList.map((staff) => (
            <li
              key={staff.employeeId}
              style={{ cursor: "pointer", padding: "4px 0" }}
              onClick={() => onSearch(staff.employeeId)}
            >
              <b>{staff.employeeId}</b> - {staff.fullName}
            </li>
          ))}
        </ul>
      </div>

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
              ? <button className="btn outline staffs" onClick={()=>setEditable(true)}>Edit</button>
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
/*function SchedulingView() {
  const [open, setOpen] = useState(false);
  const [storeName, setStore] = useState("");
  const [currentWeek, setCurrentWeek] = useState(26);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 23));
  const [staffData, setStaffData] = useState({});
  const [selectedStaff, setSelectedStaff] = useState(null);

  const openModal = (name) => { 
    setStore(name); 
    setOpen(true); 
  };

  // Dữ liệu mẫu các cửa hàng
  const STORES = [
    { id: 1, name: "Cửa Hàng Quận 1", working: "320 giờ", late: 3, early: 2 },
    { id: 2, name: "Cửa Hàng Quận 2", working: "280 giờ", late: 1, early: 4 },
    { id: 3, name: "Cửa Hàng Quận 3", working: "350 giờ", late: 5, early: 1 },
    { id: 4, name: "Cửa Hàng Quận 4", working: "300 giờ", late: 2, early: 3 }
  ];

  // Dữ liệu mẫu nhân viên
  const STAFF_MEMBERS = {
    1: ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D"],
    2: ["Nguyễn Văn E", "Trần Thị F", "Lê Văn G"],
    3: ["Nguyễn Văn H", "Trần Thị I", "Lê Văn K", "Phạm Thị L", "Hoàng Văn M"],
    4: ["Nguyễn Văn N", "Trần Thị O"]
  };

  // Tính toán ngày trong tuần
  const getWeekDates = () => {
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Thứ 2
    
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Định dạng ngày thành dd/mm
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Thay đổi tuần
  const changeWeek = (direction) => {
    const newWeek = currentWeek + direction;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    
    let newYear = currentYear;
    
    if (newWeek > 52) {
      setCurrentWeek(1);
      newYear = currentYear + 1;
      setCurrentYear(newYear);
    } else if (newWeek < 1) {
      setCurrentWeek(52);
      newYear = currentYear - 1;
      setCurrentYear(newYear);
    } else {
      setCurrentWeek(newWeek);
    }
    
    setCurrentDate(newDate);
  };

  // Xử lý thay đổi ca làm việc
  const handleShiftChange = (dayIndex, shiftIndex, staffName) => {
    setStaffData(prev => {
      const newData = {...prev};
      const dayId = `day-${dayIndex}`;
      const shiftId = `shift-${shiftIndex}`;
      
      if (!newData[dayId]) {
        newData[dayId] = {};
      }
      
      // Gán nhân viên vào ca mới
      if (staffName) {
        newData[dayId][shiftId] = staffName;
      } else {
        delete newData[dayId][shiftId];
      }
      
      return newData;
    });
  };

  // Lấy nhân viên đã được giao cho ca cụ thể
  const getAssignedStaff = (dayIndex, shiftIndex) => {
    const dayId = `day-${dayIndex}`;
    const shiftId = `shift-${shiftIndex}`;
    return staffData[dayId]?.[shiftId] || '';
  };

  // Lưu dữ liệu
  const saveData = () => {
    alert('Dữ liệu đã được lưu!');
    console.log('Dữ liệu nhân viên:', staffData);
    // Ở đây bạn có thể thêm code để gửi dữ liệu đến server
  };

  const weekDates = getWeekDates();
  const storeId = STORES.find(store => store.name === storeName)?.id || 1;
  const staffNames = STAFF_MEMBERS[storeId] || ["Nguyễn Văn A", "Nguyễn Văn B", "Nguyễn Văn C"];

  return (
    <>
      <div className="panel">
        <div className="store-list">
          {STORES.map(s => (
            <div key={s.id} className="store clickable" onClick={() => openModal(s.name)}>
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
        <div className="modal" onClick={(e) => { if (e.target.classList.contains('modal')) setOpen(false) }}>
          <div className="modal-card">
            <div className="modal-head">
              <div>{storeName}</div>
              <button className="close" onClick={() => setOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="toolbar">
                <div className="week-navigation">
                  <button onClick={() => changeWeek(-1)}>&lt;</button>
                  <span className="week">Week {currentWeek} – {currentDate.getMonth() + 1}/{currentYear}</span>
                  <button onClick={() => changeWeek(1)}>&gt;</button>
                </div>
                <button className="btn save" onClick={saveData}>SAVE</button>
              </div>
              
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="shift-col">Ca làm việc</th>
                    {weekDates.map((date, index) => (
                      <th key={index}>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][index]}<br/>
                        <small>{formatDate(date)}</small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map((shift, shiftIndex) => (
                    <tr key={shiftIndex}>
                      <td className="shift-col">
                        Ca {shift}
                      </td>
                      {weekDates.map((_, dayIndex) => {
                        const assignedStaff = getAssignedStaff(dayIndex, shiftIndex);
                        
                        return (
                          <td key={dayIndex}>
                            <select 
                              className="staff-select"
                              value={assignedStaff}
                              onChange={(e) => handleShiftChange(dayIndex, shiftIndex, e.target.value)}
                            >
                              <option value="">-- Chưa giao --</option>
                              {staffNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </td>
                        );
                      })}
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
*/


function SchedulingView() {
  const [open, setOpen] = useState(false);
  const [storeName, setStore] = useState("");
  const [currentWeek, setCurrentWeek] = useState(26);
  const [currentYear, setCurrentYear] = useState(2025);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 5, 23));
  const [staffData, setStaffData] = useState({});

  const openModal = (name) => { 
    setStore(name); 
    setOpen(true); 
  };

  // Dữ liệu mẫu các cửa hàng
  const STORES = [
    { id: 1, name: "District 1 Store", working: "320 hours", late: 3, early: 2 },
    { id: 2, name: "District 2 Store", working: "280 hours", late: 1, early: 4 },
    { id: 3, name: "District 3 Store", working: "350 hours", late: 5, early: 1 },
    { id: 4, name: "District 4 Store", working: "300 hours", late: 2, early: 3 }
  ];

  // Dữ liệu mẫu nhân viên
  const STAFF_MEMBERS = {
    1: ["Nguyen Van A", "Tran Thi B", "Le Van C", "Pham Thi D"],
    2: ["Nguyen Van E", "Tran Thi F", "Le Van G"],
    3: ["Nguyen Van H", "Tran Thi I", "Le Van K", "Pham Thi L", "Hoang Van M"],
    4: ["Nguyen Van N", "Tran Thi O"]
  };

  // Tính toán ngày trong tuần (Monday to Sunday)
  const getWeekDates = () => {
    const startDate = new Date(currentDate);
    // Set to Monday of the current week
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Định dạng ngày thành dd/mm
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Thay đổi tuần
  const changeWeek = (direction) => {
    const newWeek = currentWeek + direction;
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    
    let newYear = currentYear;
    
    if (newWeek > 52) {
      setCurrentWeek(1);
      newYear = currentYear + 1;
      setCurrentYear(newYear);
    } else if (newWeek < 1) {
      setCurrentWeek(52);
      newYear = currentYear - 1;
      setCurrentYear(newYear);
    } else {
      setCurrentWeek(newWeek);
    }
    
    setCurrentDate(newDate);
  };

  // Xử lý thay đổi ca làm việc
  const handleShiftChange = (dayIndex, shiftIndex, staffName) => {
    setStaffData(prev => {
      const newData = {...prev};
      const dayId = `day-${dayIndex}`;
      const shiftId = `shift-${shiftIndex}`;
      
      if (!newData[dayId]) {
        newData[dayId] = {};
      }
      
      
      // Gán nhân viên vào ca mới
      if (staffName) {
        newData[dayId][shiftId] = staffName;
      } else {
        delete newData[dayId][shiftId];
      }
      
      return newData;
    });
  };

  // Lấy nhân viên đã được giao cho ca cụ thể
  const getAssignedStaff = (dayIndex, shiftIndex) => {
    const dayId = `day-${dayIndex}`;
    const shiftId = `shift-${shiftIndex}`;
    return staffData[dayId]?.[shiftId] || '';
  };

  // Lưu dữ liệu
  const saveData = () => {
    alert('Data has been saved!');
    console.log('Staff data:', staffData);
  };

  const weekDates = getWeekDates();
  const storeId = STORES.find(store => store.name === storeName)?.id || 1;
  const staffNames = STAFF_MEMBERS[storeId] || ["Nguyen Van A", "Nguyen Van B", "Nguyen Van C"];

  return (
    <>
      <div className="panel">
        <div className="store-list">
          {STORES.map(s => (
            <div key={s.id} className="store-card" onClick={() => openModal(s.name)}>
              <div className="store-header">
                <div className="store-icon">🏛</div>
                <div className="store-name">{s.name}</div>
                <div className="store-compare">0% vs last month</div>
              </div>
              <div className="store-details">
                <div className="detail-item">
                  <span className="label">Total working:</span>
                  <span className="value">{s.working}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Late Arrival:</span>
                  <span className="value">{s.late}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Early Leave:</span>
                  <span className="value">{s.early}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setOpen(false) }}>
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{storeName}</h2>
              <button className="close-btn" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="schedule-toolbar">
                <div className="week-navigator">
                  <button className="nav-btn" onClick={() => changeWeek(-1)}>&lt;</button>
                  <span className="week-display">Week {currentWeek} - {currentDate.getMonth() + 1}/{currentYear}</span>
                  <button className="nav-btn" onClick={() => changeWeek(1)}>&gt;</button>
                </div>
                <button className="save-btn" onClick={saveData}>SAVE SCHEDULE</button>
              </div>
              
              <div className="schedule-table-container">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="shift-header">Shift</th>
                      {weekDates.map((date, index) => (
                        <th key={index} className="day-header">
                          <div className="day-name">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</div>
                          <div className="day-date">{formatDate(date)}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((shift, shiftIndex) => (
                      <tr key={shiftIndex} className="shift-row">
                        <td className="shift-info">
                          <div className="shift-title">Shift {shift}</div>
                          <div className="shift-time">
                            {shift === 1 ? '6am-12am' : shift === 2 ? '12am-6pm' : '6pm-12pm'}
                          </div>
                        </td>
                        {weekDates.map((_, dayIndex) => {
                          const assignedStaff = getAssignedStaff(dayIndex, shiftIndex);
                          
                          return (
                            <td key={dayIndex} className="shift-cell">
                              <select 
                                className="staff-selector"
                                value={assignedStaff}
                                onChange={(e) => handleShiftChange(dayIndex, shiftIndex, e.target.value)}
                              >
                                <option value="">-- Select --</option>
                                {staffNames.map((name, index) => (
                                  <option key={index} value={name}>{name}</option>
                                ))}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

  
    </>
  );
}