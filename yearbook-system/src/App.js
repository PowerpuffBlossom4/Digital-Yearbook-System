import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./LandingPage";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./Admin-Dashboard";
import StudentsFaculty from "./StudentsFaculty";
import Photo from "./Photo";
import MemoriesMessages from "./Memories-Messages";
import DesignStudio from "./DesignStudio";
import StudentLayout from "./StudenLayoutt";
import StudentDashboard from "./StudentDashboard";
import StudentProfile from "./StudentProfile";
import PublicStudentProfile from "./PublicStudentProfile";
import StudentMemories from "./StudentMemories";
import StudentYearbook from "./StudentYearbook";

import FacultyLayout from "./FacultyLayout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<LandingPage />} />

        {/* ADMIN LAYOUT WRAPPER */}
        <Route path="/admin" element={<AdminLayout />}>

          <Route index element={<AdminDashboard />} />

          <Route path="users" element={<StudentsFaculty />} />

          <Route path="photo" element={<Photo />} />

          <Route path="memories" element={<MemoriesMessages />} />

          <Route path="design" element={<DesignStudio />} />

        </Route>

         {/* STUDENT ROUTES */}
        <Route path="/student" element={<StudentLayout />}>
  <Route index element={<StudentDashboard />} />

  <Route path="profile" element={<StudentProfile/>} />
  <Route path="memories" element={<StudentMemories/>} />
  <Route path="yearbook" element={<StudentYearbook/>} />
  
</Route>

  <Route path="/student/:id" element={<PublicStudentProfile />} />  

<Route
  path="/faculty"
  element={<FacultyLayout />}
>


</Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;