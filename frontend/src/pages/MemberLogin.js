import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/App";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MemberLogin = () => {
  const navigate = useNavigate();
  const { login, adminLogin } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Admin modal
  const [adminModal, setAdminModal] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  useEffect(() => { fetchClubs(); }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".select-wrap")) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClubs = async () => {
    try {
      // Usamos el endpoint de clubs completo para filtrar las federaciones
      const response = await axios.get(`${BACKEND_URL}/api/clubs`);
      // Excluir federaciones del dropdown de login de clubes
      const clubNames = response.data
        .filter(c => c.status === "active" && c.institution_type !== "federation")
        .map(c => c.name)
        .sort();
      setClubs(clubNames);
    } catch {
      // Fallback: usar el endpoint simple de nombres
      try {
        const res = await axios.get(`${BACKEND_URL}/api/clubs/names`);
        setClubs(res.data);
      } catch {
        toast.error("Error al cargar clubs");
      }
    }
  };

  const doLogin = async () => {
    if (!selectedClub || !password) {
      setLoginError("Selecciona un club e introduce la contraseña.");
      return;
    }
    setLoading(true);
    setLoginError("");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        club_name: selectedClub,
        password,
      });
      login(response.data);
      toast.success(`¡Bienvenido, ${response.data.club_name}!`);

      if (response.data.institution_type === "federation") {
        navigate("/federation/dashboard");
      } else {
        navigate("/club/dashboard");
      }
    } catch {
      setLoginError("Club o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  const doAdminLogin = async () => {
    if (!adminUser || !adminPass) { setAdminError("Rellena usuario y contraseña."); return; }
    setAdminLoading(true);
    setAdminError("");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/admin/login`, {
        username: adminUser, password: adminPass,
      });
      adminLogin(response.data);
      setAdminSuccess(true);
      setTimeout(() => navigate("/admin/dashboard"), 1600);
    } catch {
      setAdminError("Credenciales incorrectas.");
      setAdminPass("");
    } finally {
      setAdminLoading(false);
    }
  };

  const openAdminModal = () => {
    setAdminModal(true);
    setAdminSuccess(false);
    setAdminError("");
    setAdminUser("");
    setAdminPass("");
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --accent: #DFFF00;
          --accent-dim: rgba(223,255,0,0.12);
          --accent-border: rgba(223,255,0,0.25);
          --bg: #050505;
          --surface: #0f0f0f;
          --surface2: #181818;
          --surface3: #202020;
          --border: rgba(255,255,255,0.06);
          --border2: rgba(255,255,255,0.12);
          --text: #F0EFE8;
          --text2: #8A8980;
          --text3: #4A4945;
        }

        .login-root {
          min-height: 100dvh;
          background: var(--bg);
          color: var(--text);
          font-family: 'Manrope', 'Helvetica Neue', Arial, sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at 70% 30%, rgba(223,255,0,0.05) 0%, transparent 55%);
          pointer-events: none;
          z-index: 0;
        }
        .login-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: linear-gradient(rgba(223,255,0,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(223,255,0,0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(ellipse at 70% 30%, black 30%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 70% 30%, black 30%, transparent 70%);
        }

        .topbar {
          height: 56px;
          display: flex;
          align-items: center;
          padding: 0 24px;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          border-bottom: 1px solid var(--border);
        }

        .btn-back {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: var(--text2);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 14px;
          border-radius: 20px;
          border: 1px solid var(--border2);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .btn-back:hover { color: var(--text); border-color: rgba(223,255,0,0.35); background: var(--accent-dim); }

        .btn-admin {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          color: var(--text3);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 7px 14px;
          border-radius: 20px;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
        }
        .btn-admin:hover { color: var(--text2); background: var(--surface2); border-color: var(--border2); }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px 24px 48px;
          position: relative;
          z-index: 10;
        }

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 36px;
        }
        .brand-logo { height: 44px; filter: brightness(0) invert(1); opacity: 0.9; }
        .brand-name { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--text3); }

        .card {
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 16px;
          padding: 36px 36px 32px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(223,255,0,0.04);
        }
        .card-title { font-family: 'Barlow Condensed', 'Helvetica Neue', Arial, sans-serif; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: var(--text); margin-bottom: 6px; }
        .card-sub { font-size: 13px; color: var(--text2); margin-bottom: 32px; line-height: 1.5; }

        .field { margin-bottom: 20px; }
        .field-label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text3); margin-bottom: 8px; display: block; }

        .select-wrap { position: relative; }
        .select-btn {
          width: 100%; background: var(--surface2); border: 1px solid var(--border2);
          border-radius: 9px; padding: 12px 14px; color: var(--text2); font-size: 14px;
          cursor: pointer; display: flex; align-items: center; justify-content: space-between;
          user-select: none; transition: border-color 0.15s; font-family: inherit;
        }
        .select-btn.has-value { color: var(--text); }
        .select-btn.open, .select-btn:hover { border-color: var(--accent-border); }
        .select-chevron { transition: transform 0.2s; color: var(--text3); flex-shrink: 0; }
        .select-btn.open .select-chevron { transform: rotate(180deg); }

        .dropdown {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: var(--surface2); border: 1px solid var(--border2);
          border-radius: 10px; overflow-y: auto; max-height: 210px; z-index: 50;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }
        .dropdown-item {
          padding: 11px 14px; font-size: 13px; color: var(--text2); cursor: pointer;
          border-bottom: 1px solid var(--border); transition: background 0.1s, color 0.1s;
        }
        .dropdown-item:last-child { border-bottom: none; }
        .dropdown-item:hover { background: var(--surface3); color: var(--text); }
        .dropdown-item.selected { color: var(--accent); background: var(--accent-dim); }

        .input {
          width: 100%; background: var(--surface2); border: 1px solid var(--border2);
          border-radius: 9px; padding: 12px 14px; color: var(--text); font-size: 14px;
          font-family: inherit; outline: none; transition: border-color 0.15s;
        }
        .input:focus { border-color: rgba(223,255,0,0.45); }
        .input::placeholder { color: var(--text3); }

        .btn-login {
          width: 100%; background: var(--accent); color: #050505;
          font-family: 'Barlow Condensed', inherit; font-size: 13px; font-weight: 800;
          letter-spacing: 0.12em; text-transform: uppercase; padding: 13px; border: none;
          border-radius: 9px; cursor: pointer; margin-top: 10px;
          transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
        }
        .btn-login:hover:not(:disabled) { background: #f0ff33; box-shadow: 0 8px 24px rgba(223,255,0,0.2); transform: translateY(-1px); }
        .btn-login:active:not(:disabled) { transform: translateY(0); }
        .btn-login:disabled { opacity: 0.4; cursor: not-allowed; }

        .error-msg { background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.2); border-radius: 7px; color: #ff7070; font-size: 13px; padding: 10px 14px; margin-top: 12px; }

        .card-footer {
          margin-top: 20px; text-align: center; font-size: 12px; color: var(--text3);
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .card-footer::before, .card-footer::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; backdrop-filter: blur(4px); }
        .modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 32px; width: 100%; max-width: 360px; position: relative; box-shadow: 0 40px 100px rgba(0,0,0,0.7); }
        .modal-close { position: absolute; top: 14px; right: 14px; background: var(--surface3); border: 1px solid var(--border); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text2); font-size: 13px; transition: background 0.15s, color 0.15s; }
        .modal-close:hover { background: rgba(255,80,80,0.1); color: #ff7070; }
        .modal-icon { width: 40px; height: 40px; background: var(--accent-dim); border: 1px solid var(--accent-border); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .modal-title { font-family: 'Barlow Condensed', inherit; font-size: 22px; font-weight: 800; text-transform: uppercase; color: var(--text); margin-bottom: 5px; }
        .modal-sub { font-size: 13px; color: var(--text2); margin-bottom: 24px; line-height: 1.5; }
        .modal-field { margin-bottom: 14px; }
        .btn-modal-login { width: 100%; background: var(--accent); color: #050505; font-family: 'Barlow Condensed', inherit; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 12px; border: none; border-radius: 8px; cursor: pointer; margin-top: 6px; transition: background 0.15s, box-shadow 0.15s; }
        .btn-modal-login:hover:not(:disabled) { background: #f0ff33; box-shadow: 0 6px 20px rgba(223,255,0,0.2); }
        .btn-modal-login:disabled { opacity: 0.4; cursor: not-allowed; }
        .modal-error { background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.2); border-radius: 7px; color: #ff7070; font-size: 12px; padding: 8px 12px; margin-top: 10px; }
        .modal-success { text-align: center; padding: 16px 0 8px; }
        .success-icon { width: 52px; height: 52px; background: rgba(223,255,0,0.1); border: 1px solid rgba(223,255,0,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 22px; color: var(--accent); }
        .success-text { font-size: 14px; color: var(--text2); }
        .success-text strong { color: var(--text); display: block; margin-bottom: 4px; font-size: 16px; }

        @media (max-width: 480px) { .card { padding: 28px 22px 24px; } .topbar { padding: 0 16px; } }
      `}</style>

      <div className="login-root">
        <div className="topbar">
          <button className="btn-back" onClick={() => navigate("/")}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Volver
          </button>
          <button className="btn-admin" onClick={openAdminModal}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2 14c0-3 2.686-4.5 6-4.5s6 1.5 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Acceso admin
          </button>
        </div>

        <div className="main">
          <div className="brand">
            <img className="brand-logo"
              src="https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png"
              alt="ADIVINA" />
            <span className="brand-name">Portal Privado · Clubes</span>
          </div>

          <div className="card">
            <div className="card-title">Iniciar sesión</div>
            <div className="card-sub">Acceso exclusivo para clubes deportivos</div>

            <div className="field">
              <label className="field-label">Club</label>
              <div className="select-wrap">
                <div
                  className={`select-btn ${selectedClub ? "has-value" : ""} ${dropdownOpen ? "open" : ""}`}
                  onClick={() => setDropdownOpen(o => !o)}
                >
                  <span>{selectedClub || "Selecciona tu club"}</span>
                  <svg className="select-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                {dropdownOpen && (
                  <div className="dropdown">
                    {clubs.map(club => (
                      <div key={club}
                        className={`dropdown-item ${selectedClub === club ? "selected" : ""}`}
                        onClick={() => { setSelectedClub(club); setDropdownOpen(false); }}>
                        {club}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="field">
              <label className="field-label">Contraseña</label>
              <input className="input" type="password" placeholder="Contraseña..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && doLogin()} />
            </div>

            {loginError && <div className="error-msg">{loginError}</div>}

            <button className="btn-login" onClick={doLogin} disabled={loading}>
              {loading ? "Comprobando..." : "Ingresar"}
            </button>

            <div className="card-footer">Acceso exclusivo para miembros</div>
          </div>
        </div>

        {/* Modal Admin */}
        {adminModal && (
          <div className="overlay" onClick={e => { if (e.target.classList.contains("overlay")) setAdminModal(false); }}>
            <div className="modal">
              <button className="modal-close" onClick={() => setAdminModal(false)}>✕</button>
              {!adminSuccess ? (
                <>
                  <div className="modal-icon">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#DFFF00" strokeWidth="1.4" />
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="#DFFF00" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="modal-title">Acceso administrador</div>
                  <div className="modal-sub">Introduce tus credenciales para acceder al panel de gestión.</div>
                  <div className="modal-field">
                    <label className="field-label">Usuario</label>
                    <input className="input" type="text" placeholder="admin" value={adminUser} onChange={e => setAdminUser(e.target.value)} onKeyDown={e => e.key === "Enter" && doAdminLogin()} />
                  </div>
                  <div className="modal-field">
                    <label className="field-label">Contraseña</label>
                    <input className="input" type="password" placeholder="Contraseña..." value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doAdminLogin()} />
                  </div>
                  {adminError && <div className="modal-error">{adminError}</div>}
                  <button className="btn-modal-login" onClick={doAdminLogin} disabled={adminLoading}>
                    {adminLoading ? "Comprobando..." : "Entrar al panel"}
                  </button>
                </>
              ) : (
                <div className="modal-success">
                  <div className="success-icon">✓</div>
                  <div className="success-text">
                    <strong>Acceso concedido</strong>
                    Redirigiendo al panel de administración...
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MemberLogin;