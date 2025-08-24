import { useEffect, useState } from "react";

const API = "http://localhost:3000/api";

const STORES = [
  { id: 's1', name: 'HCMUS - 227 Nguyễn Văn Cừ', working: 200, late: 0, early: 0 },
  { id: 's2', name: 'HCMUS - 227 Nguyễn Văn Cừ', working: 200, late: 0, early: 0 },
  { id: 's3', name: 'HCMUS - 227 Nguyễn Văn Cừ', working: 200, late: 0, early: 0 },
];


export default function Staffs() {
  const [tab, setTab] = useState("Find");
  return (
    <section className="card">
      <div className="tabs">
        {["Find", "Add", "Salary", "Scheduling"].map(t => (
          <button key={t} className={"tab" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>
            {t === "Find" ? "Find staff" : t === "Add" ? "Add staff" : t}
          </button>
        ))}
      </div>
      {tab === "Find" && <FindStaff />}
      {tab === "Add" && <AddStaff />}
      {tab === "Salary" && <SalaryView />}
      {tab === "Scheduling" && <SchedulingView />}
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


function FindStaff() {
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
        <button className="btn" onClick={onSearch} disabled={loading}>Tìm kiếm</button>
      </div>

      {loading && <div style={{ marginTop: 16, color: '#888' }}>Đang tải...</div>}
      {err && <div style={{ marginTop: 16, color: 'red' }}>{err}</div>}
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
              ? <button className="btn outline" onClick={() => setEditable(true)}>Edit</button>
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

function AddStaff() {
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
        employeeCode: "", fullName: "", dob: "", gender: "", phone: "",
        username: "", password: ""
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
        {!canSubmit && <small style={{ marginLeft: 8, color: '#888' }}>(Cần nhập đủ thông tin)</small>}
        {loading && <span style={{ marginLeft: 8, color: '#888' }}>Đang thêm...</span>}
        {err && <div style={{ color: 'red', marginTop: 8 }}>{err}</div>}
        {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
      </div>
    </div>
  );
}

/* ---------- Salary ---------- */
function SalaryView() {
  return (
    <div className="panel">
      <div className="summary">
        <div className="sum-box"><div>Total working hour</div><b>200</b></div>
        <div className="sum-box"><div>Late Arrival</div><b>0</b></div>
        <div className="sum-box"><div>Early Leave</div><b>0</b></div>
      </div>
      <div className="store-list">
        {STORES.map(s => (
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


/* ---------- Scheduling ---------- */
let globalAssignments = [];
let globalEmployees = [];
let globalUsers = [];

function SchedulingView() {
  const [open, setOpen] = useState(false);
  const [storeName, setStore] = useState("");
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekNumber());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentDate, setCurrentDate] = useState(getMondayOfCurrentWeek());

  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Hàm lấy thứ Hai của tuần hiện tại
  function getMondayOfCurrentWeek() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(today.setDate(diff));
  }

  // Hàm lấy số tuần hiện tại
  function getCurrentWeekNumber() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Hàm lấy thông tin đầy đủ của nhân viên
  const getEmployeeInfo = (employeeId) => {
    if (!employeeId) return null;

    const employee = employees.find(emp => emp.employee_id === employeeId);
    if (!employee) return null;

    const user = users.find(user => user.user_id === employee.user_id);
    if (!user) return null;

    return {
      employee_id: employee.employee_id,
      user_id: employee.user_id,
      name: user.name,
      position: employee.position,
    };
  };


  // Hàm lấy tên nhân viên
  const getEmployeeName = (employeeId) => {
    const employeeInfo = getEmployeeInfo(employeeId);
    return employeeInfo ? employeeInfo.name : "Unknown";
  };

  const openModal = async (name) => {
    setStore(name);
    setOpen(true);

    if (globalAssignments.length > 0) {
      setAssignments(globalAssignments);
    }

    else {

      // Lấy tất cả các phân công ca và chuẩn hóa dữ liệu
      const assignmentsResponse = await fetch(`${API}/shift-employees`);
      const assignmentsData = await assignmentsResponse.json();
      const assignmentsList = assignmentsData.data || assignmentsData || [];

      // Chuẩn hóa dữ liệu để có cùng định dạng
      const normalizedAssignments = assignmentsList.map(item => ({
        shiftID: item.shift_id || item.shiftID || item.shiftId,
        employeeId: item.employee_id || item.employeeId
      }));

      setAssignments(normalizedAssignments);
      globalAssignments = normalizedAssignments;
    }

    setLoading(true);
    try {

      setCurrentWeek(getCurrentWeekNumber());
      setCurrentYear(new Date().getFullYear());
      setCurrentDate(getMondayOfCurrentWeek());

      // Lấy tất cả nhân viên
      const employeesResponse = await fetch(`${API}/employees`);
      const employeesData = await employeesResponse.json();
      const employeesList = employeesData.data || employeesData || [];
      setEmployees(employeesList);
      globalEmployees = employeesList;

      // Lấy tất cả người dùng
      const usersResponse = await fetch(`${API}/users`);
      const usersData = await usersResponse.json();
      const usersList = usersData.data || usersData || [];
      setUsers(usersList);
      globalUsers = usersList;


    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data. Please check console for details.');
    } finally {
      setLoading(false);
    }
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

  // Định dạng ngày thành yyyymmdd để sử dụng với API (định dạng trong shiftID)
  const formatDateForShiftID = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  };

  // Định dạng ngày thành dd/mm
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  // Thay đổi tuần
  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));

    // Tính toán tuần mới và năm mới
    const startOfYear = new Date(newDate.getFullYear(), 0, 1);
    const days = Math.floor((newDate - startOfYear) / (24 * 60 * 60 * 1000));
    const newWeek = Math.ceil((days + 1) / 7);

    setCurrentDate(newDate);
    setCurrentWeek(newWeek);
    setCurrentYear(newDate.getFullYear());
  };

  // Lấy shiftID dựa trên ngày và ca (không dựa vào cửa hàng)
  const getShiftID = (date, shiftNumber) => {
    const dateStr = formatDateForShiftID(date);
    const ca = shiftNumber + 1; // shiftNumber là 0,1,2 -> ca là 1,2,3
    return `SH_${dateStr}_C${ca}`;
  };

  // Lấy nhân viên đã được giao cho ca cụ thể từ state assignments
  const getAssignedEmployee = (date, shiftNumber) => {
    const shiftID = getShiftID(date, shiftNumber);
    const assignment = assignments.find(a => a.shiftID === shiftID);
    return assignment ? assignment.employeeId : '';
  };


  // Xử lý khi thay đổi nhân viên được giao cho ca cụ thể
  const handleShiftChange = (date, shiftNumber, employeeId) => {
    const shiftID = getShiftID(date, shiftNumber);

    // Tìm assignment hiện tại
    const existingAssignmentIndex = assignments.findIndex(a => a.shiftID === shiftID);
    let updatedAssignments = [...assignments];

    if (employeeId) {
      if (existingAssignmentIndex !== -1) {
        // Cập nhật assignment hiện có
        updatedAssignments[existingAssignmentIndex] = {
          ...updatedAssignments[existingAssignmentIndex],
          employeeId: employeeId
        };
      } else {
        // Tạo assignment mới
        const newAssignment = {
          shiftID: shiftID,
          employeeId: employeeId,
          date: formatDateForShiftID(date),
          ca: `C${shiftNumber + 1}`
        };
        updatedAssignments.push(newAssignment);
      }
    } else if (existingAssignmentIndex !== -1) {
      // Xóa assignment nếu không chọn nhân viên nào
      updatedAssignments.splice(existingAssignmentIndex, 1);
    }

    setAssignments(updatedAssignments);
    globalAssignments = updatedAssignments;
    setHasChanges(true);
  };

  // Hàm lưu tất cả thay đổi
  const saveAllChanges = () => {
    setHasChanges(false);
    alert('All changes have been saved locally!');
  };

  // Hàm đóng modal với cảnh báo nếu có thay đổi chưa lưu
  const closeModal = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }
    setOpen(false);
  };

  const weekDates = getWeekDates();

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
        <div className="modal-overlay" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal() }}>
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="modal-title">{storeName}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-content">
              {loading ? (
                <div className="loading">Loading data...</div>
              ) : (
                <>
                  <div className="schedule-toolbar">
                    <div className="week-navigator">
                      <button className="nav-btn" onClick={() => changeWeek(-1)}>&lt;</button>
                      <span className="week-display">Week {currentWeek} - {currentYear}</span>
                      <button className="nav-btn" onClick={() => changeWeek(1)}>&gt;</button>
                    </div>

                    {hasChanges && (
                      <div className="save-container">
                        <button className="save-btn" onClick={saveAllChanges}>
                          Save Change
                        </button>
                      </div>
                    )}
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
                                {shift === 1 ? '6am-12pm' : shift === 2 ? '12pm-6pm' : '6pm-12am'}
                              </div>
                            </td>
                            {weekDates.map((date, dayIndex) => {
                              const assignedEmployeeId = getAssignedEmployee(date, shiftIndex);
                              const employeeInfo = getEmployeeInfo(assignedEmployeeId);

                              return (
                                <td key={dayIndex} className="shift-cell">
                                  <select
                                    className="staff-selector"
                                    value={assignedEmployeeId || ""}
                                    onChange={(e) => handleShiftChange(date, shiftIndex, e.target.value)}
                                  >
                                    <option value="">-- Select --</option>
                                    {employees.map((employee) => (
                                      <option key={employee.employee_id} value={employee.employee_id}>
                                        {getEmployeeName(employee.employee_id)}
                                      </option>
                                    ))}
                                  </select>
                                  {employeeInfo && (
                                    <div className="employee-info">
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .panel {
          padding: 20px;
          background-color: #f5f7fa;
        }
        
        .store-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .store-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 20px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 1px solid #e1e5eb;
        }
        
        .store-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
        }
        
        .store-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .store-icon {
          font-size: 24px;
          margin-right: 12px;
        }
        
        .store-name {
          font-weight: 600;
          font-size: 18px;
          color: #2c3e50;
          flex: 1;
        }
        
        .store-compare {
          font-size: 14px;
          color: #27ae60;
          background-color: #e8f5e9;
          padding: 4px 8px;
          border-radius: 16px;
        }
        
        .store-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }
        
        .label {
          color: #7f8c8d;
        }
        
        .value {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;   /* căn giữa theo chiều dọc */
          justify-content: center; /* căn giữa theo chiều ngang */
          z-index: 1000;
          padding: 20px;
        }

        .modal-container {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 1400px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          margin: auto; /* đảm bảo modal luôn ở giữa */
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: #3498db;
          color: white;
        }
        
        .modal-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }
        
        .close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        
        .close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .modal-content {
          padding: 24px;
          max-height: calc(90vh - 80px);
          overflow-y: auto;
        }
        
        .schedule-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e1e5eb;
        }
        
        .week-navigator {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .nav-btn {
          background: #3498db;
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .nav-btn:hover {
          background: #2980b9;
        }
        
        .week-display {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
        }
        
        .save-btn {
          background: #27ae60;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .save-btn:hover {
          background: #219653;
        }
        
        .schedule-table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e1e5eb;
        }
        
        .schedule-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }
        
        .schedule-table th, .schedule-table td {
          padding: 12px;
          text-align: center;
        }
        
        .shift-header, .day-header {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .day-header {
          min-width: 120px;
        }
        
        .day-name {
          font-size: 16px;
          margin-bottom: 4px;
        }
        
        .day-date {
          font-size: 14px;
          color: #7f8c8d;
        }
        
        .shift-info {
          background: #f8f9fa;
          text-align: left;
          min-width: 100px;
        }
        
        .shift-title {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        
        .shift-time {
          font-size: 12px;
          color: #7f8c8d;
        }
        
        .shift-row {
          border-bottom: 1px solid #e1e5eb;
        }
        
        .shift-row:last-child {
          border-bottom: none;
        }
        
        .shift-cell {
          background: white;
        }
        
        .staff-selector {
          width: 100%;
          padding: 8px;
          border: 1px solid #dce1e6;
          border-radius: 6px;
          background: white;
          color: #2c3e50;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        
        .staff-selector:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }
        
        @media (max-width: 768px) {
          .schedule-toolbar {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .store-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}