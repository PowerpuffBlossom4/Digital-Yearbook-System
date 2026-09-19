import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./LandingPage";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import StudentsFaculty from "./StudentsFaculty";
import MemoriesMessages from "./Memories-Messages";
import DesignStudio from "./DesignStudio";
import StudentLayout from "./StudenLayoutt";
import StudentDashboard from "./StudentDashboard";
import StudentProfile from "./StudentProfile";

import StudentMemories from "./StudentMemories";
import StudentYearbook from "./StudentYearbook";
import Yearbook from "./pages/admin/Yearbooks";
import FlipbookViewer from "./pages/admin/FlipbookViewer";

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

        

          <Route path="memories" element={<MemoriesMessages />} />

          <Route path="design" element={<DesignStudio />} />

          <Route path="yearbooks" element={<Yearbook />} />


        </Route>

         {/* STUDENT ROUTES */}
        <Route path="/student" element={<StudentLayout />}>
  <Route index element={<StudentDashboard />} />

  <Route path="profile" element={<StudentProfile/>} />
   {/* Other student's profile */}
  <Route path=":studentId" element={<StudentProfile />} />
  <Route path="memories" element={<StudentMemories/>} />
  <Route path="yearbook" element={<StudentYearbook/>} />
  
</Route>

<Route path="/faculty" element={<FacultyLayout />}>
  <Route index element={<StudentDashboard />} />
</Route>

<Route
  path="/admin/yearbook/view/:id"
  element={<FlipbookViewer />}
/>

{/* STUDENT YEARBOOK FLIPBOOK */}
<Route
  path="/yearbooks/:id"
  element={<FlipbookViewer />}
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;