import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function PublicStudentProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/profile/${id}`)
      .then((res) => setProfile(res.data));
  }, [id]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="public-profile">
      <h1>{profile.full_name}</h1>
      <p>{profile.email}</p>
      <p>{profile.department_program}</p>

      <h3>Nickname</h3>
      <p>{profile.nickname || "N/A"}</p>

      <h3>Motto</h3>
      <p>{profile.motto || "No motto"}</p>
    </div>
  );
}

export default PublicStudentProfile;