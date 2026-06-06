import { useEffect, useState } from "react";
import axios from "axios";
import "./studentsFaculty.css";

function StudentsFaculty() {
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");


const [showModal, setShowModal] = useState(false);

const [formData, setFormData] = useState({
  full_name: "",
  email: "",
  department_program: "",
  role: "Student",
});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/users")
      .then((res) => setPeople(res.data))
      .catch((err) => console.log(err));
  }, []);

const filtered = people.filter((p) => {
  const matchSearch =
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase());

  const matchRole =
    filterRole === "All"
      ? true
      : p.role?.toLowerCase() === filterRole.toLowerCase();

  return matchSearch && matchRole;
});

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      "http://localhost:5000/api/admin/users",
      formData
    );

    setPeople([...people, res.data]); // instantly update UI
    setShowModal(false);

    setFormData({
      full_name: "",
      email: "",
      department_program: "",
      role: "Student",
    });
  } catch (err) {
    console.log(err);
  }
};

  return (
  <div className="sf-container">

    {/* HEADER */}
    <div className="sf-header">
      <div>
        <h2>Students & Faculty</h2>
        <p>Manage everyone featured in the yearbook.</p>
      </div>

      <button className="add-btn" onClick={() => setShowModal(true)}>
  + Add Person
</button>
    </div>

    {/* SEARCH + FILTER */}
    <div className="card-toolbar">

      <input
        type="text"
        placeholder="Search name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
      >
        <option value="All">All Roles</option>
        <option value="Student">Student</option>
        <option value="Faculty">Faculty</option>
      </select>

      <div className="result-count">
        {filtered.length} users found
      </div>

    </div>

   
 {/* TABLE */}
<div className="sf-table-wrapper">
  <table className="sf-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Department/Program</th>
        <th>Role</th>
      </tr>
    </thead>

    <tbody>
      {filtered.map((p) => (
        <tr key={p.id}>

          <td className="name-cell">
            <div className="avatar">
              {p.full_name?.split(" ").map(n => n[0]).join("")}
            </div>
            <span>{p.full_name}</span>
          </td>

          
          <td className="muted">{p.email}</td>
          <td className="muted">{p.department_program}</td>

          <td>
            <span className={`role-pill ${p.role?.toLowerCase()}`}>
              {p.role}
            </span>
          </td>

        </tr>
      ))}
    </tbody>
  </table>

    </div>

    {showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>

      <h3>Add Person</h3>

      <form onSubmit={handleSubmit} className="modal-form">

        <input
          name="full_name"
          placeholder="Full Name"
          value={formData.full_name}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          name="department_program"
          placeholder="Department/Program"
          value={formData.department_program}
          onChange={handleChange}
          required
        />

        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
        </select>

        <div className="modal-actions">
          <button type="button" onClick={() => setShowModal(false)}>
            Cancel
          </button>
          <button type="submit">Save</button>
        </div>

      </form>
    </div>
  </div>
)}

  </div>
);

    
  
}

export default StudentsFaculty;