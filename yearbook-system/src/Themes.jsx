import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./themes.css";

function Themes() {
  const [themes, setThemes] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/themes",
          { withCredentials: true }
        );

        setThemes(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchThemes();
  }, []);

  const customizeTheme = async (theme) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/yearbooks/create-from-theme",
        {
          title: "New Yearbook",
          theme_id: theme.id,
        },
        { withCredentials: true }
      );

      navigate("/admin/design", {
  state: {
    pages: res.data.theme_pages,
    yearbookId: res.data.yearbook_id,
  },
});
    } catch (err) {
      console.log(err);
    }
  };

  const filteredThemes = themes.filter((t) =>
    t.theme_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="themes-page">

      {/* HEADER */}
      <div className="themes-header">
        <h1>Theme Templates</h1>

        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* GRID */}
      <div className="themes-grid">
        {filteredThemes.map((theme) => {

          // parse pages safely
          let pages = [];
          try {
            pages = theme.pages ? JSON.parse(theme.pages) : [];
          } catch (e) {
            pages = [];
          }

          return (
            <div key={theme.id} className="theme-card">

              {/* THUMBNAIL */}
          <div className="theme-thumb">
  {(() => {
    let pages = [];

    try {
      pages = theme.pages ? JSON.parse(theme.pages) : [];
    } catch (e) {
      pages = [];
    }

    const thumbnail =
      theme.thumbnail ||
      pages?.[0]?.thumbnail ||
      pages?.[0]?.image ||
      null;

    return thumbnail ? (
      <img src={thumbnail} alt={theme.theme_name} />
    ) : (
      <div className="placeholder">
        <span>No Preview</span>
      </div>
    );
  })()}
</div>

              {/* INFO */}
              <div className="theme-info">
                <h3>{theme.theme_name}</h3>
                <p>{theme.description}</p>

                <button onClick={() => customizeTheme(theme)}>
                  Customize
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Themes;