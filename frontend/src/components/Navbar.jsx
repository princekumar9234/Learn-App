import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, Shield, Moon, Sun } from "lucide-react";
import axios from "axios";

const Navbar = ({ user, admin, setUser, setAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      await axios.post("/logout");
      setUser(null);
      setAdmin(null);
      navigate("/");
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return (
    <nav
      className="glass-card"
      style={{
        margin: "1rem auto",
        width: "95%",
        padding: "0.9rem 1.5rem",
        position: "sticky",
        top: "0.75rem",
        zIndex: 1000,
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          position: "relative",
        }}
      >
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <img
            src="/logo.png"
            alt="Learn.Dev"
            style={{
              height: "35px",
              width: "35px",
              borderRadius: "10px",
              boxShadow: "0 0 15px var(--primary-glow)",
              objectFit: "cover",
            }}
            refresh="true"
          />
          <span
            style={{
              fontSize: "1.4rem",
              fontWeight: "800",
              fontFamily: "var(--font-heading)",
              background:
                "linear-gradient(to right, var(--primary), var(--secondary))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Learn.Dev
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{
              padding: "0.6rem",
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              justifyContent: "center",
            }}
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Desktop Nav */}
          <ul
            className="md-desktop"
            style={{ gap: "1.2rem", alignItems: "center", listStyle: "none" }}
          >
            {user ? (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className="btn btn-ghost"
                    style={{ padding: "0.6rem 1rem" }}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="btn btn-primary"
                    style={{ padding: "0.6rem 1.3rem" }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </li>
              </>
            ) : admin ? (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="btn btn-ghost"
                    style={{ padding: "0.6rem 1rem" }}
                  >
                    Admin Panel
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="btn btn-primary"
                    style={{ padding: "0.6rem 1.3rem" }}
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="btn btn-ghost"
                    style={{ padding: "0.6rem 1rem" }}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="btn btn-ghost"
                    style={{ padding: "0.6rem 1rem" }}
                  >
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className="btn btn-primary"
                    style={{ padding: "0.6rem 1.3rem" }}
                  >
                    Join Free
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ color: "var(--text-main)", border: "none" }}
          className="md-hidden "
        >
          {isOpen ? <X /> : <Menu />}
        </button>

        {/* Mobile Menu */}
        <div className="md-mobile">
          {isOpen && (
            <div className="mobile-sheet">
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  
                  flexDirection: "column",
                  gap: "0.7rem",
                }}
              >
                {/* Mobile Theme Toggle inside Menu */}
                <li
                  style={{
                    marginBottom: "0.5rem",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "0.7rem",
                  }}
                >
                  <button
                    onClick={toggleTheme}
                    className="btn btn-ghost"
                    style={{
                      justifyContent: "space-between",
                      padding: "0.7rem 1rem",
                    }}
                  >
                    Theme{" "}
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                </li>

                {user ? (
                  <>
                    <li>
                      <Link
                        to="/dashboard"
                        className="btn btn-ghost"
                        style={{ padding: "0.7rem 1rem" }}
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="btn btn-primary"
                        style={{
                          padding: "0.8rem 1rem",
                          justifyContent: "center",
                        }}
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </li>
                  </>
                ) : admin ? (
                  <>
                    <li>
                      <Link
                        to="/admin/dashboard"
                        className="btn btn-ghost"
                        style={{ padding: "0.7rem 1rem" }}
                        onClick={() => setIsOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="btn btn-primary"
                        style={{
                          padding: "0.8rem 1rem",
                          justifyContent: "center",
                        }}
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        className="btn btn-ghost"
                        style={{ padding: "0.7rem 1rem" }}
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin"
                        className="btn btn-ghost"
                        style={{ padding: "0.7rem 1rem" }}
                        onClick={() => setIsOpen(false)}
                      >
                        Admin Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/signup"
                        className="btn btn-primary"
                        style={{ justifyContent: "center" }}
                        onClick={() => setIsOpen(false)}
                      >
                        Join Free
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
