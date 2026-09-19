
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaBookOpen,
  FaCamera,
  FaUsers,
  FaSearch,
  FaImages,
  FaQuoteLeft,
  FaHeart,
  FaUniversity,
  FaArrowDown,
  FaCheckCircle,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import adssuLogo from "./assets/adssu-logo.png";
import heroBackground from "./assets/hero-background.jpg";
import graduationBackground from "./assets/graduation-background.jpg";
import institutionBackground from "./assets/adssu-institution.jpg";
import gradUet from "./assets/grad-uet.jpg";
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

  const openLogin = () => {
    setShowLoginModal(true);
  };

  const closeLogin = () => {
    setShowLoginModal(false);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="landing-page">    

      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="navbar">

        <div
          className="logo"
          onClick={() => scrollToSection("home")}
        >
<div className="logo-icon-wrapper">
  <img
    src={adssuLogo}
    alt="Agusan del Sur State University Logo"
    className="school-logo"
  />
</div>

          <div className="logo-text">
            <span className="logo-title">ADSSU Digital Yearbook</span>
            
          </div>
        </div>

        <nav className="nav-links">

          <button onClick={() => scrollToSection("about")}>
            About
          </button>

          <button onClick={() => scrollToSection("features")}>
            Features
          </button>

          <button onClick={() => scrollToSection("mission")}>
            Mission & Vision
          </button>

          <button onClick={() => scrollToSection("graduation")}>
            Graduation
          </button>

        </nav>

        <button
          className="login-btn"
          onClick={openLogin}
        >
          Login
        </button>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}
      <section
  className="hero-section"
  id="home"
  style={{
    backgroundImage: `url(${heroBackground})`,
  }}
>

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <div className="hero-badge">
            <FaUniversity />
            <span>Agusan del Sur State University</span>
          </div>

          <h1>
            Web-Based
            <span> Interactive Digital Yearbook</span>
          </h1>

          <p>
            Preserve the moments, people, achievements, and memories
            that made your school journey unforgettable.
          </p>

          <div className="hero-buttons">

            <button
              className="yearbook-btn"
              onClick={openLogin}
            >
              <FaBookOpen />
              Explore Yearbook
            </button>

            <button
              className="learn-btn"
              onClick={() => scrollToSection("about")}
            >
              Learn More
            </button>

          </div>

          <div className="hero-stats">

            <div>
              <strong>2026</strong>
              <span>Graduating Class</span>
            </div>

            <div>
              <strong>Digital</strong>
              <span>Yearbook</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Accessibility</span>
            </div>

          </div>

        </div>

        <button
          className="scroll-down"
          onClick={() => scrollToSection("about")}
        >
          <FaArrowDown />
        </button>

      </section>


{/* =====================================================
    ABOUT THE YEARBOOK — PREMIUM EDITORIAL DESIGN
===================================================== */}
<section className="about-section" id="about">

  {/* Decorative Elements */}
  <div className="about-decoration about-decoration-one"></div>
  <div className="about-decoration about-decoration-two"></div>

  <div className="section-container">

    {/* =================================================
        HEADER
    ================================================= */}
    <div className="about-header">

      <div className="about-header-label">
        <span className="about-label-line"></span>

        <span>
          ABOUT THE YEARBOOK
        </span>

        <span className="about-label-line"></span>
      </div>

      <h2>
        A Smarter Way to
        <span> Preserve Every Story.</span>
      </h2>

      <p>
        A web-based interactive digital yearbook designed to
        bring together the people, memories, achievements,
        and stories that define the student journey.
      </p>

    </div>


    {/* =================================================
        MAIN EDITORIAL LAYOUT
    ================================================= */}
    <div className="about-editorial-grid">


      {/* =================================================
          LEFT — IMAGE
      ================================================= */}
      <div className="about-visual">

        <div className="about-visual-number">
          01
        </div>

        <div className="about-photo-frame">

          <div
            className="about-photo"
            style={{
              backgroundImage: `url(${gradUet})`,
            }}
          >

            <div className="about-photo-overlay"></div>


            {/* Top Badge */}
            <div className="about-year-badge">

              <FaGraduationCap />

              <div>
                <span>CLASS OF</span>
                <strong>2026</strong>
              </div>

            </div>


            {/* Vertical Text */}
            <div className="about-vertical-text">
              ADSSU DIGITAL YEARBOOK
            </div>


            {/* Image Content */}
            <div className="about-photo-content">

              <span>
                AGUSAN DEL SUR STATE UNIVERSITY
              </span>

              <h3>
                Every Chapter.
                <br />
                <strong>Every Memory.</strong>
              </h3>

            </div>

          </div>


          {/* Image Footer */}
          <div className="about-photo-footer">

            <div className="about-photo-footer-text">

              <span>
                DIGITAL YEARBOOK
              </span>

              <strong>
                Memories • People • Achievements
              </strong>

            </div>

            <div className="about-photo-icon">
              <FaBookOpen />
            </div>

          </div>

        </div>


        {/* Floating Decorative Card */}
        <div className="about-floating-card">

          <FaHeart />

          <div>
            <strong>
              Stories That Matter
            </strong>

            <span>
              Preserved digitally
            </span>
          </div>

        </div>

      </div>


      {/* =================================================
          RIGHT — CONTENT
      ================================================= */}
      <div className="about-information">

        {/* Section Number */}
        <div className="about-info-heading">

          <span className="about-info-number">
            01
          </span>

          <span className="about-info-label">
            THE DIGITAL EXPERIENCE
          </span>

        </div>


        <h3>
          A Complete Digital
          <span> Yearbook Experience.</span>
        </h3>


        <p className="about-lead">
          The Web-Based Interactive Digital Yearbook System
          provides a centralized platform for managing
          graduating students, organizing yearbook content,
          and publishing an interactive digital yearbook.
        </p>

        <p>
          The system brings together student and faculty
          profiles, photographs, personal messages, memories,
          and other yearbook content while providing
          administrators with tools for managing themes,
          layouts, approvals, and publication.
        </p>


        {/* =================================================
            FEATURE CARDS
        ================================================= */}
        <div className="about-feature-list">

          <div className="about-feature">

            <div className="about-feature-icon">
              <FaUsers />
            </div>

            <div>
              <strong>
                Centralized Management
              </strong>

              <span>
                Organize profiles, photographs, memories,
                and yearbook content in one platform.
              </span>
            </div>

          </div>


          <div className="about-feature">

            <div className="about-feature-icon">
              <FaBookOpen />
            </div>

            <div>
              <strong>
                Interactive Experience
              </strong>

              <span>
                Explore digital pages, profiles, messages,
                memories, and interactive yearbook content.
              </span>
            </div>

          </div>


          <div className="about-feature">

            <div className="about-feature-icon">
              <FaCamera />
            </div>

            <div>
              <strong>
                Digital Memories
              </strong>

              <span>
                Preserve meaningful photographs, stories,
                achievements, and messages.
              </span>
            </div>

          </div>


          <div className="about-feature">

            <div className="about-feature-icon">
              <FaCheckCircle />
            </div>

            <div>
              <strong>
                Ready for Publication
              </strong>

              <span>
                Compile approved content into an interactive
                flipbook and downloadable PDF.
              </span>
            </div>

          </div>

        </div>


        {/* =================================================
            BOTTOM STATS
        ================================================= */}
        <div className="about-stats">

          <div className="about-stat">

         

              <p>
                Centralized
              </p>
            </div>

      


          <div className="about-stat">

           

              <p>
                Interactive
              </p>
            </div>

    


          <div className="about-stat">

          

              <p>
                Digital
              </p>
            </div>

        

        </div>

      </div>

    </div>

  </div>

</section>







      {/* =====================================================
          GRADUATION
      ===================================================== */}
<section
  className="graduation-section"
  id="graduation"
  style={{
    backgroundImage: `url(${graduationBackground})`,
  }}
>

        <div className="graduation-overlay"></div>

        <div className="graduation-content">

 

          <h2>
            A Chapter Ends.
            <br />
            <span>A New Journey Begins.</span>
          </h2>

          <p>
            Every graduation is a collection of stories —
            friendships formed, challenges overcome,
            lessons learned, and dreams waiting to unfold.
          </p>

          <button
            onClick={openLogin}
            className="graduation-btn"
          >
            <FaBookOpen />
            View the Yearbook
          </button>

        </div>

      </section>



{/* =====================================================
    DIGITAL EXPERIENCE
===================================================== */}
<section
  className="features-section"
  id="features"
>

  <div className="section-container">

    <div className="section-heading centered">

      <span className="section-label">
        DIGITAL EXPERIENCE
      </span>

      <h2>
        Built Around Your
        <span> Yearbook Journey</span>
      </h2>

      <p>
        Experience a modern digital yearbook designed to make
        memories, profiles, photographs, and stories easier to
        manage, explore, and preserve.
      </p>

    </div>

    <div className="features-grid">

      {/* 01 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaBookOpen />
        </div>

        <h3>Interactive Digital Yearbook</h3>

        <p>
          Explore a complete digital yearbook through interactive
          pages, organized sections, and a flipbook experience
          designed for easy viewing.
        </p>

      </div>


      {/* 02 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaUsers />
        </div>

        <h3>Student & Faculty Profiles</h3>

        <p>
          View organized profiles containing personal information,
          photographs, quotes, faculty positions, departments,
          and meaningful messages.
        </p>

      </div>


      {/* 03 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaCamera />
        </div>

        <h3>Smart Photo Management</h3>

        <p>
          Upload individual or multiple photographs with organized
          processing, automatic resizing, cropping, optimization,
          and image enhancement.
        </p>

      </div>


      {/* 04 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaImages />
        </div>

        <h3>Theme & Layout Studio</h3>

        <p>
          Customize yearbook themes and layouts using a
          Canva-inspired design studio with drag-and-drop editing,
          templates, fonts, colors, and backgrounds.
        </p>

      </div>


      {/* 05 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaHeart />
        </div>

        <h3>Memories & Social Interaction</h3>

        <p>
          Share memories, posts, messages, comments, and reactions
          that allow students and faculty to participate in a more
          interactive yearbook experience.
        </p>

      </div>


      {/* 06 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaSearch />
        </div>

        <h3>Organized & Easy Access</h3>

        <p>
          Find and explore yearbook content through organized
          student information, profiles, memories, and other
          digital yearbook sections.
        </p>

      </div>


      {/* 07 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaCheckCircle />
        </div>

        <h3>Secure Role-Based Access</h3>

        <p>
          Students, faculty, and administrators receive
          role-based access with school email verification and
          protected dashboard features.
        </p>

      </div>


      {/* 08 */}
      <div className="feature-card">

        <div className="feature-icon">
          <FaCalendarAlt />
        </div>

        <h3>Digital Publishing</h3>

        <p>
          After approval, the completed yearbook can be published
          as an interactive flipbook and generated as a
          downloadable PDF copy.
        </p>

      </div>

    </div>

  </div>

</section>




{/* =====================================================
    ABOUT ADSSU — INTRODUCTION
===================================================== */}

<section className="about-introduction">
  <div className="section-container">

    <div className="about-intro-card">

      <div className="about-intro-number">
        01
      </div>

      <div className="about-intro-content">

        <span className="about-section-label">
          ABOUT ADSSU
        </span>

        <h3>
          A Tradition of Service,
          Innovation & Excellence
        </h3>

        <p>
          The Agusan del Sur State University (ADSSU) is a dynamic
          public higher education institution located in the
          municipality of Bunawan, Agusan del Sur. Anchored in a
          long-standing tradition of service and innovation, ADSSU
          continues to play a vital role in the transformation of
          agriculture and technology in Caraga and beyond.
        </p>

        <p>
          ADSSU’s roots date back to 1908, when American educators
          established the Manobo Industrial School to uplift the
          lives of Indigenous communities through education.
          Over the decades, the institution evolved through various
          names and mandates—from Manobo Farm School to Bunawan
          Agricultural School—growing alongside the communities
          it served.
        </p>

        <p>
          It was formally established as a state college through
          Republic Act No. 7932 on March 1, 1995, marking a new
          chapter of accelerated growth, wider academic offerings,
          and deeper community engagement.
        </p>

      </div>

    </div>

  </div>
</section>

{/* =====================================================
    ABOUT ADSSU — HISTORY
===================================================== */}

<section className="about-history">

  <div className="section-container">

    <div className="about-history-header">

      <span className="about-section-label">
        OUR HISTORY
      </span>

      <h3>
        From Our Roots to a
        <span> Global Institution</span>
      </h3>

      <p>
        A journey shaped by education, community service,
        agriculture, innovation, and generations of learners.
      </p>

    </div>

    <div className="history-timeline">

      <div className="history-item">

        <div className="history-year">
          1908
        </div>

        <div className="history-line"></div>

        <div className="history-content">

          <h4>
            The Beginning
          </h4>

          <p>
            American educators established the Manobo Industrial
            School to uplift Indigenous communities through
            education and practical learning.
          </p>

        </div>

      </div>


      <div className="history-item">

        <div className="history-year">
          DEVELOPMENT
        </div>

        <div className="history-line"></div>

        <div className="history-content">

          <h4>
            Growing With the Community
          </h4>

          <p>
            The institution evolved through different names and
            mandates, including Manobo Farm School and Bunawan
            Agricultural School.
          </p>

        </div>

      </div>


      <div className="history-item">

        <div className="history-year">
          1995
        </div>

        <div className="history-line"></div>

        <div className="history-content">

          <h4>
            Becoming a State College
          </h4>

          <p>
            Republic Act No. 7932 formally established the
            institution as a state college on March 1, 1995,
            expanding its academic programs and community
            engagement.
          </p>

        </div>

      </div>


      <div className="history-item history-current">

        <div className="history-year">
          TODAY
        </div>

        <div className="history-line"></div>

        <div className="history-content">

          <h4>
            Agusan del Sur State University
          </h4>

          <p>
            Today, ADSSU continues to advance sustainable
            agriculture, innovation, research, education,
            extension, and community development.
          </p>

        </div>

      </div>

    </div>

  </div>

</section>

{/* =====================================================
    ABOUT ADSSU — TODAY
===================================================== */}

<section className="about-today-section">

  <div className="section-container">

    <div className="about-today">

      <div className="about-today-content">

        <span className="about-section-label">
          ADSSU TODAY
        </span>

        <h3>
          Knowledge.
          <br />
          <span>Innovation.</span>
          <br />
          Sustainable Future.
        </h3>

        <p>
          Today, ADSSU is recognized as a globally-engaged
          institution of sustainable agriculture and innovation,
          actively contributing to national development through
          instruction, research, extension, and resource generation.
        </p>

        <p>
          It champions inclusive access to quality education while
          building strong industry and community partnerships.
        </p>

        <div className="institution-highlight">

          <div className="institution-highlight-icon">
            <FaUniversity />
          </div>

          <div>
            <span className="institution-highlight-label">
              OUR INSTITUTION
            </span>

            <strong>
              Agusan del Sur State University
            </strong>

            <p>
              Celebrating achievements, memories,
              and new beginnings.
            </p>
          </div>

        </div>

      </div>


      <div className="about-today-stats">

        <div className="about-stat">
          <strong>1908</strong>
          <span>
            Roots in community-centered education
          </span>
        </div>

        <div className="about-stat">
          <strong>1995</strong>
          <span>
            Established as a state college
          </span>
        </div>

        <div className="about-stat">
          <strong>ADSSU</strong>
          <span>
            Globally-engaged institution of sustainable
            agriculture and innovation
          </span>
        </div>

      </div>

    </div>

  </div>

</section>


{/* =====================================================
    ADSSU INSTITUTIONAL PROFILE
===================================================== */}

<section
  className="institutional-section"
  id="mission"
  style={{
    backgroundImage: `url(${institutionBackground})`,
  }}
>
  <div className="institutional-overlay"></div>

  <div className="section-container institutional-container">

    {/* ================= HEADER ================= */}
    <div className="institutional-header">
      <div className="institutional-eyebrow">
        <span></span>
        OUR INSTITUTION
        <span></span>
      </div>

      <h2>
        ADSSU <span>Vision, Mission & Goals</span>
      </h2>

      <p>
        Discover the vision, mission, philosophy, and institutional
        goals that guide Agusan del Sur State University.
      </p>
    </div>


    {/* ================= VISION ================= */}
    <div className="institutional-main-card vision-feature">

      <div className="institutional-side-number">
        01
      </div>

      <div className="institutional-icon-box">
        <FaStar />
      </div>

      <div className="institutional-content">
        <span className="institutional-label">
          VISION
        </span>

        <h3>
          The globally-engaged Institution of sustainable
          agriculture and innovation.
        </h3>
      </div>

    </div>


    {/* ================= MISSION ================= */}
    <div className="institutional-main-card mission-feature">

      <div className="institutional-side-number">
        02
      </div>

      <div className="institutional-icon-box">
        <FaUniversity />
      </div>

      <div className="institutional-content">

        <span className="institutional-label">
          MISSION
        </span>

        <h3>
          To serve the humanity, the Institution will:
        </h3>

        <div className="mission-list">

          <div className="mission-item">
            <span>01</span>
            <p>
              Provide quality and inclusive instruction
            </p>
          </div>

          <div className="mission-item">
            <span>02</span>
            <p>
              Further its excellence and values
            </p>
          </div>

          <div className="mission-item">
            <span>03</span>
            <p>
              Undertake vibrant research and innovation
            </p>
          </div>

          <div className="mission-item">
            <span>04</span>
            <p>
              Pursue responsive community services for
              sustainable development
            </p>
          </div>

        </div>

      </div>

    </div>


    {/* ================= PHILOSOPHY ================= */}
    <div className="philosophy-card">

      <div className="philosophy-mark">
        <FaQuoteLeft />
      </div>

      <div className="philosophy-content">

        <span className="institutional-label">
          PHILOSOPHY
        </span>

        <p>
          ADSSU believes that the Higher Education should be
          anchored to the tenets of democracy; be guided by the
          continuing pursuit for relevance and excellence and;
          the mover and catalyst for development.
        </p>

      </div>

    </div>


    {/* ================= GOALS ================= */}
    <div className="goals-section">

      <div className="goals-header">

        <div>
          <span className="institutional-label">
            INSTITUTIONAL GOALS
          </span>

          <h3>
            Building a Sustainable <span>Future</span>
          </h3>
        </div>

        <p>
          ADSSU's goals focus on institutional growth, student
          development, research, innovation, community engagement,
          and sustainable development.
        </p>

      </div>


      <div className="goals-grid">

        <div className="goal-card">
          <span>01</span>
          <p>
            Maximize opportunities to increase institutional
            revenue to sustain growth.
          </p>
        </div>

        <div className="goal-card">
          <span>02</span>
          <p>
            Provide improved delivery of administrative services.
          </p>
        </div>

        <div className="goal-card">
          <span>03</span>
          <p>
            Engage actively with industry partners to complement
            the programs and operations.
          </p>
        </div>

        <div className="goal-card">
          <span>04</span>
          <p>
            Provide comprehensive students services to attain
            holistic student development.
          </p>
        </div>

        <div className="goal-card">
          <span>05</span>
          <p>
            Enhance research, development and innovation
            productivity with social impact and influence.
          </p>
        </div>

        <div className="goal-card">
          <span>06</span>
          <p>
            Strengthen responsive and impactful extension
            activities.
          </p>
        </div>

        <div className="goal-card">
          <span>07</span>
          <p>
            Attain recognition as leading provider for innovative
            and entrepreneurial technology and business solutions
            that will spur economic development.
          </p>
        </div>

        <div className="goal-card">
          <span>08</span>
          <p>
            Accelerate human resource and student development
            contributing to knowledge economy.
          </p>
        </div>

      </div>

    </div>

  </div>
</section>

    

{/* =====================================================
    YOUR JOURNEY
===================================================== */}

<section className="journey-section" id="journey">
  <div className="section-container">

    {/* HEADER */}
    <div className="journey-header">
      <div className="journey-eyebrow">
        <span></span>
        YOUR JOURNEY
        <span></span>
      </div>

      <h2>
        From First Day to
        <span> Graduation Day</span>
      </h2>

      <p>
        Every student journey is made up of moments,
        milestones, friendships, challenges, and achievements
        that become part of a story worth remembering.
      </p>
    </div>

    {/* TIMELINE */}
    <div className="journey-timeline">

      {/* 01 */}
      <div className="journey-item">
        <div className="journey-marker">
          <span>01</span>
        </div>

        <div className="journey-card">
          <div className="journey-card-top">
            <span className="journey-step">CHAPTER 01</span>
            <span className="journey-line"></span>
          </div>

          <h3>Beginning</h3>

          <p>
            The first day marks the beginning of a new
            academic journey filled with opportunities,
            discoveries, and dreams.
          </p>

          <div className="journey-card-footer">
            <span>START</span>
            <span>01</span>
          </div>
        </div>
      </div>

      {/* 02 */}
      <div className="journey-item">
        <div className="journey-marker">
          <span>02</span>
        </div>

        <div className="journey-card">
          <div className="journey-card-top">
            <span className="journey-step">CHAPTER 02</span>
            <span className="journey-line"></span>
          </div>

          <h3>Student Life</h3>

          <p>
            Classes, friendships, organizations, activities,
            challenges, and unforgettable experiences shape
            the years spent at ADSSU.
          </p>

          <div className="journey-card-footer">
            <span>EXPERIENCE</span>
            <span>02</span>
          </div>
        </div>
      </div>

      {/* 03 */}
      <div className="journey-item">
        <div className="journey-marker">
          <span>03</span>
        </div>

        <div className="journey-card">
          <div className="journey-card-top">
            <span className="journey-step">CHAPTER 03</span>
            <span className="journey-line"></span>
          </div>

          <h3>Achievements</h3>

          <p>
            Every accomplishment, milestone, competition,
            project, and success becomes part of a journey
            worth celebrating.
          </p>

          <div className="journey-card-footer">
            <span>ACHIEVE</span>
            <span>03</span>
          </div>
        </div>
      </div>

      {/* 04 */}
      <div className="journey-item journey-item-final">
        <div className="journey-marker">
          <span>04</span>
        </div>

        <div className="journey-card">
          <div className="journey-card-top">
            <span className="journey-step">CHAPTER 04</span>
            <span className="journey-line"></span>
          </div>

          <h3>Graduation</h3>

          <p>
            One chapter comes to an end as a new journey
            begins. The memories, lessons, and friendships
            continue beyond graduation.
          </p>

          <div className="journey-card-footer">
            <span>NEW BEGINNING</span>
            <span>04</span>
          </div>
        </div>
      </div>

    </div>

    {/* BOTTOM MESSAGE */}
    <div className="journey-closing">
      <span className="journey-closing-line"></span>

      <p>
        Four chapters. Countless memories.
        <strong> One unforgettable journey.</strong>
      </p>

      <span className="journey-closing-line"></span>
    </div>

  </div>
</section>


      {/* =====================================================
          LEGACY CTA
      ===================================================== */}
      <section className="legacy-section">

        <div className="legacy-content">

          <FaHeart className="legacy-heart" />

          <span className="section-label">
            YOUR STORY MATTERS
          </span>

          <h2>
            Memories Fade.
            <br />
            <span>Stories Live On.</span>
          </h2>

          <p>
            Let this yearbook become a digital reminder
            of the people, moments, and memories that
            shaped your journey.
          </p>

          <button
            className="legacy-btn"
            onClick={openLogin}
          >
            <FaBookOpen />
            Enter the Yearbook
          </button>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="landing-footer">

        <div className="footer-container">

          <div className="footer-brand">

<div className="footer-logo">
  <img
    src={adssuLogo}
    alt="Agusan del Sur State University Logo"
    className="footer-school-logo"
  />

  <div>
    <strong>ADSSU Digital Yearbook</strong>
    
  </div>
</div>

            <p>
              Preserving memories. Celebrating achievements.
              Connecting generations.
            </p>

          </div>


          <div className="footer-links">

            <h4>Explore</h4>

            <button onClick={() => scrollToSection("about")}>
              About
            </button>

            <button onClick={() => scrollToSection("features")}>
              Features
            </button>

            <button onClick={() => scrollToSection("mission")}>
              Mission & Vision
            </button>

            <button onClick={() => scrollToSection("graduation")}>
              Graduation
            </button>

          </div>


          <div className="footer-links">

            <h4>Yearbook</h4>

            <button onClick={openLogin}>
              Student Login
            </button>

            <button onClick={openLogin}>
              Faculty Login
            </button>

          </div>

        </div>


        <div className="footer-bottom">

          <span>
            © 2026 Agusan del Sur State University
          </span>

          <span>
            Web-Based Interactive Digital Yearbook
          </span>

        </div>

      </footer>


      {/* =====================================================
          LOGIN MODAL
      ===================================================== */}
      {showLoginModal && (

        <div
          className="modal-overlay"
          onClick={closeLogin}
        >

          <div
            className="modal-box modern-login"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={closeLogin}
            >
              ×
            </button>


            <div className="login-header">

<div className="login-logo">
  <img
    src={adssuLogo}
    alt="Agusan del Sur State University Logo"
    className="login-school-logo"
  />
</div>

              <span>ADSSU DIGITAL YEARBOOK</span>

              <h2>
                Welcome Back
              </h2>

              <p>
                Sign in to access the yearbook.
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
                  Use your institutional account to sign in
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
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />

                </div>


                <div className="input-group">

                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
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