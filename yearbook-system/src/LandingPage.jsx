import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "./LandingPage.css";

const LandingPage = () => {

  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFaculty, setShowFaculty] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {

      const res = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.role === "admin") {
        navigate("/admin");
      }

      if (res.data.role === "faculty") {
        navigate("/faculty");
      }

    } catch (err) {
      alert("Invalid Email or Password");
    }

  };

  return (
    <div className="landing-page">

      <header className="navbar">
        <div className="logo">
          <FaGraduationCap className="logo-icon" />
          <span>YearBook</span>
        </div>

        <button
          className="login-btn"
          onClick={() => setShowLoginModal(true)}
        >
          Login
        </button>
      </header>

      <div className="overlay"></div>

      <section className="hero-content">
        <h1>Web-Based Yearbook</h1>

        <p>
          Preserve memories. Manage content.
          <br />
          Access yearbooks anytime, anywhere.
        </p>

        <button
          className="yearbook-btn"
          onClick={() => setShowLoginModal(true)}
        >
          Yearbook
        </button>
      </section>

      {showLoginModal && (
  <div
    className="modal-overlay"
    onClick={() => setShowLoginModal(false)}
  >
    <div
      className="modal-box modern-login"
      onClick={(e) => e.stopPropagation()}
    >

      {/* LOGO SECTION */}
      <div className="login-logo-section">

        <div className="logo-top">
          <FaGraduationCap className="big-logo-icon" />

          
          <h1>YearBook</h1>
        </div>

        <p className="logo-subtitle">
          Digital Yearbook
        </p>

      </div>

      {/* LOGIN TYPE */}
      <div className="login-type">

        <p>Sign in as:</p>

        <div className="switch-buttons">

          <button
            className={!showFaculty ? "active" : ""}
            onClick={() => setShowFaculty(false)}
          >
            Student
          </button>

          <button
            className={showFaculty ? "active" : ""}
            onClick={() => setShowFaculty(true)}
          >
            Faculty
          </button>

        </div>

      </div>

      {/* STUDENT LOGIN */}
      {!showFaculty ? (
        <div className="student-login">

          <button
            className="google-btn"
            onClick={() =>
              window.location.href =
                "http://localhost:5000/auth/google"
            }
          >
            <FcGoogle className="google-icon" />
            Sign in with Google
          </button>

          <small>
            *Use your institutional account to sign-in
          </small>

        </div>
      ) : (

        /* FACULTY LOGIN */
        <div className="login-card fade-in">

          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="login-submit-btn"
            onClick={handleLogin}
          >
            Log In
          </button>

        </div>
      )}

    </div>
  </div>
)}

    </div>
  );
};

export default LandingPage;