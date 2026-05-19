import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import { Shield } from "lucide-react";
import axios from "axios";
import { LeagueContent } from "./LeaguePublic";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SUPABASE_RECURSOS_URL = process.env.REACT_APP_SUPABASE_RECURSOS_URL || "";
const VIDEO_1_URL   = SUPABASE_RECURSOS_URL ? `${SUPABASE_RECURSOS_URL}/v_f_1.mp4`     : "/v_f_1.mp4";
const VIDEO_2_URL   = SUPABASE_RECURSOS_URL ? `${SUPABASE_RECURSOS_URL}/v_f_2.mp4`     : "/v_f_2.mp4";
const FONDO_GYM_URL = SUPABASE_RECURSOS_URL ? `${SUPABASE_RECURSOS_URL}/fondo_gym.jpg` : "/fondo_gym.jpg";

const Landing = () => {
  const navigate = useNavigate();
  const { user, admin, authLoaded } = useAuth();
  const vid1Ref = useRef(null);
  const vid2Ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const [fedModal, setFedModal]     = useState(false);
  const [fedUser, setFedUser]       = useState("");
  const [fedPass, setFedPass]       = useState("");
  const [fedError, setFedError]     = useState("");
  const [fedLoading, setFedLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handlePortalClick = () => {
    if (!authLoaded) { navigate("/member-club"); return; }
    if (admin) { navigate("/admin/dashboard"); return; }
    if (user) {
      navigate(user.institution_type === "federation" ? "/federation/dashboard" : "/club/dashboard");
      return;
    }
    navigate("/member-club");
  };

  // Login federación directamente desde la landing, sin pasar por /member-club
  const handleFedLogin = async () => {
    if (!fedUser || !fedPass) { setFedError("Rellena usuario y contraseña"); return; }
    setFedLoading(true);
    setFedError("");
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        club_name: fedUser,
        password: fedPass,
      });
      localStorage.setItem("club_user", JSON.stringify(res.data));
      window.location.href = res.data.institution_type === "federation"
        ? "/federation/dashboard"
        : "/club/dashboard";
    } catch {
      setFedError("Credenciales incorrectas");
      setFedPass("");
    } finally {
      setFedLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .landing-root {
          background: #050505;
          color: #F0EFE8;
          font-family: 'Barlow Condensed', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          min-height: 100dvh;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .landing-root::-webkit-scrollbar { display: none; }

        .hero-section {
          position: relative; width: 100%; height: 100dvh;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .bg-gym {
          position: absolute; inset: 0;
          background-image: url('${FONDO_GYM_URL}');
          background-size: cover; background-position: center; z-index: 0;
          transform: ${loaded ? "scale(1)" : "scale(1.04)"};
          transition: transform 1.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bg-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(223,255,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(223,255,0,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
        .bg-vignette {
          position: absolute; inset: 0; z-index: 1;
          background: radial-gradient(ellipse at center, transparent 20%, rgba(5,5,5,0.85) 100%);
        }
        .hero-bottom-fade {
          position: absolute; bottom: 0; left: 0; right: 0; height: 120px; z-index: 2;
          background: linear-gradient(to bottom, transparent, #050505); pointer-events: none;
        }

        .box {
          position: relative; z-index: 10;
          display: flex; width: min(760px, calc(100vw - 32px)); height: min(470px, calc(100vh - 80px));
          overflow: hidden; border-radius: 6px;
          box-shadow: 0 0 0 1px rgba(223,255,0,0.12), 0 50px 140px rgba(0,0,0,0.9), 0 0 80px rgba(223,255,0,0.04);
          opacity: ${loaded ? "1" : "0"};
          transform: ${loaded ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)"};
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .box-left { width: 50%; position: relative; overflow: hidden; background: #080808; flex-shrink: 0; }
        .box-left video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; opacity: 0.75; }
        .box-left-overlay { position: absolute; inset: 0; z-index: 2; background: linear-gradient(to right, rgba(5,5,5,0.1) 0%, transparent 40%, rgba(5,5,5,0.6) 100%); }
        .live-tag { position: absolute; bottom: 18px; left: 18px; z-index: 5; display: flex; align-items: center; gap: 7px; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #DFFF00; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(223,255,0,0.4); } 50% { opacity: 0.6; transform: scale(0.85); box-shadow: 0 0 0 4px rgba(223,255,0,0); } }
        .live-text { font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(255,255,255,0.4); }

        .divider {
          position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; transform: translateX(-50%); z-index: 20;
          background: linear-gradient(to bottom, transparent, rgba(223,255,0,0.5) 20%, rgba(223,255,0,0.8) 50%, rgba(223,255,0,0.5) 80%, transparent);
        }
        .box-right { width: 50%; position: relative; overflow: hidden; background: #060606; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; }
        .box-right video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.08; z-index: 0; }
        .box-right-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to left, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.72) 100%); }
        .slogan-mask { position: absolute; bottom: 14px; left: 0; right: 0; z-index: 2; overflow: hidden; pointer-events: none; text-align: center; }
        .slogan-mask span { font-family: 'Barlow Condensed', Impact, 'Arial Black', sans-serif; font-size: 42px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: transparent; -webkit-text-stroke: 1.5px rgba(223,255,0,0.12); white-space: nowrap; display: inline-block; }
        .box-content { position: relative; z-index: 5; padding: 40px 38px; display: flex; flex-direction: column; gap: 0; }
        .eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #DFFF00; margin-bottom: 14px; opacity: ${loaded ? "1" : "0"}; transition: opacity 0.6s 0.5s; }
        .headline { font-family: 'Barlow Condensed', 'Helvetica Neue', Arial, sans-serif; font-size: clamp(26px, 4.5vw, 42px); font-weight: 800; line-height: 1.0; letter-spacing: -0.3px; color: #F0EFE8; margin-bottom: 12px; text-transform: uppercase; opacity: ${loaded ? "1" : "0"}; transition: opacity 0.6s 0.6s; }
        .headline em { font-style: normal; color: #DFFF00; }
        .subline { font-family: 'Manrope', 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: rgba(240,239,232,0.35); letter-spacing: 0.1em; text-transform: uppercase; line-height: 1.7; margin-bottom: 38px; opacity: ${loaded ? "1" : "0"}; transition: opacity 0.6s 0.7s; }
        .btns { display: flex; gap: 10px; flex-wrap: wrap; opacity: ${loaded ? "1" : "0"}; transition: opacity 0.6s 0.85s; }
        .btn-primary { background: #DFFF00; color: #050505; font-size: 11px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; font-family: 'Barlow Condensed', inherit; }
        .btn-primary:hover { background: #f0ff33; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(223,255,0,0.25); }
        .btn-primary:active { transform: translateY(0); }
        .btn-arrow { font-size: 16px; line-height: 1; margin-top: -1px; }

        .corner { position: absolute; width: 18px; height: 18px; z-index: 25; }
        .corner-tl { top: 0; left: 0; border-top: 2px solid rgba(223,255,0,0.4); border-left: 2px solid rgba(223,255,0,0.4); }
        .corner-tr { top: 0; right: 0; border-top: 2px solid rgba(223,255,0,0.4); border-right: 2px solid rgba(223,255,0,0.4); }
        .corner-bl { bottom: 0; left: 0; border-bottom: 2px solid rgba(223,255,0,0.4); border-left: 2px solid rgba(223,255,0,0.4); }
        .corner-br { bottom: 0; right: 0; border-bottom: 2px solid rgba(223,255,0,0.4); border-right: 2px solid rgba(223,255,0,0.4); }

        .league-section { background: #050505; position: relative; z-index: 10; }
        .league-section-inner { max-width: 900px; margin: 0 auto; padding: 60px 16px 80px; }
        .league-section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
        .league-section-title { font-family: 'Barlow Condensed', sans-serif; font-size: clamp(28px, 5vw, 48px); font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; color: #F0EFE8; }
        .league-section-title em { font-style: normal; color: #DFFF00; }
        .league-section-sub { font-size: 13px; color: rgba(240,239,232,0.3); margin-top: 4px; font-family: 'Manrope', sans-serif; }

        .btn-federation {
          display: flex; align-items: center; gap: 7px;
          background: rgba(223,255,0,0.08); color: rgba(223,255,0,0.75);
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          padding: 9px 16px; border-radius: 8px; border: 1px solid rgba(223,255,0,0.2);
          cursor: pointer; font-family: 'Manrope', inherit; transition: all 0.15s;
          white-space: nowrap; margin-top: 4px; flex-shrink: 0;
        }
        .btn-federation:hover { background: rgba(223,255,0,0.14); border-color: rgba(223,255,0,0.45); color: #DFFF00; }

        .section-divider { width: 100%; height: 1px; background: linear-gradient(to right, transparent, rgba(223,255,0,0.15) 50%, transparent); }

        /* Modal federación */
        .fed-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; backdrop-filter: blur(4px); }
        .fed-modal { background: #0f0f0f; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 28px 24px; width: 100%; max-width: 340px; position: relative; }
        .fed-modal-close { position: absolute; top: 12px; right: 12px; background: rgba(255,255,255,0.05); border: none; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: rgba(240,239,232,0.4); font-size: 13px; }
        .fed-modal-close:hover { color: #ff7070; }
        .fed-input { width: 100%; background: #181818; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 11px 13px; color: #F0EFE8; font-size: 14px; font-family: inherit; outline: none; margin-top: 6px; box-sizing: border-box; transition: border-color 0.15s; }
        .fed-input:focus { border-color: rgba(223,255,0,0.4); }
        .fed-label { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(240,239,232,0.3); display: block; margin-top: 14px; }
        .fed-btn { width: 100%; background: #DFFF00; color: #050505; font-family: 'Barlow Condensed', inherit; font-size: 13px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 12px; border: none; border-radius: 8px; cursor: pointer; margin-top: 18px; transition: background 0.15s; }
        .fed-btn:hover:not(:disabled) { background: #f0ff33; }
        .fed-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .fed-error { background: rgba(255,80,80,0.08); border: 1px solid rgba(255,80,80,0.2); border-radius: 6px; color: #ff7070; font-size: 12px; padding: 8px 12px; margin-top: 10px; }

        @media (max-width: 540px) {
          .hero-section { height: 100dvh; }
          .box { flex-direction: column; width: 100vw; height: auto; min-height: calc(100dvh - 0px); border-radius: 0; box-shadow: none; }
          .box-left { width: 100%; height: 220px; flex-shrink: 0; }
          .box-left video { object-position: center 20%; }
          .divider { left: 0; right: 0; top: 220px; width: 100%; height: 1px; background: linear-gradient(to right, transparent, rgba(223,255,0,0.7) 50%, transparent); transform: none; }
          .box-right { width: 100%; flex: 1; }
          .box-content { padding: 32px 24px 48px; }
          .headline { font-size: 32px; }
          .btns { flex-direction: column; }
          .btn-primary { justify-content: center; padding: 14px 24px; }
          .corner-tl, .corner-tr, .corner-bl, .corner-br { display: none; }
          .slogan-mask span { font-size: 30px; }
          .league-section-inner { padding: 40px 16px 60px; }
          .league-section-header { flex-direction: column; }
        }
        @media (min-width: 541px) and (max-width: 860px) {
          .box { width: calc(100vw - 48px); height: min(420px, calc(100vh - 80px)); }
          .box-content { padding: 30px 28px; }
          .headline { font-size: 30px; }
          .subline { margin-bottom: 28px; }
        }
      `}</style>

      <div className="landing-root">
        {/* ═══ HERO ═══ */}
        <section className="hero-section">
          <div className="bg-gym" />
          <div className="bg-grid" />
          <div className="bg-vignette" />

          <div className="box">
            <div className="corner corner-tl" /><div className="corner corner-tr" />
            <div className="corner corner-bl" /><div className="corner corner-br" />

            <div className="box-left">
              <video ref={vid1Ref} autoPlay muted loop playsInline preload="auto">
                <source src={VIDEO_1_URL} type="video/mp4" />
              </video>
              <div className="box-left-overlay" />
              <div className="live-tag">
                <div className="live-dot" />
                <span className="live-text">Adivina Sport</span>
              </div>
            </div>

            <div className="divider" />

            <div className="box-right">
              <video ref={vid2Ref} autoPlay muted loop playsInline preload="auto">
                <source src={VIDEO_2_URL} type="video/mp4" />
              </video>
              <div className="box-right-overlay" />
              <div className="slogan-mask"><span>ELITE SPORTS</span></div>
              <div className="box-content">
                <div className="eyebrow">Página oficial</div>
                <div className="headline">de Adivina<br /><em>sport</em></div>
                <div className="subline">Suplementación deportiva<br />para clubes e instituciones</div>
                <div className="btns">
                  <button className="btn-primary" onClick={handlePortalClick}>
                    ACCEDER AL PORTAL DE CLUBES
                    <span className="btn-arrow">›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-bottom-fade" />
        </section>

        {/* ═══ LIGA ═══ */}
        <div className="section-divider" />

        <section className="league-section">
          <div className="league-section-inner">
            <div className="league-section-header">
              <div>
                <h2 className="league-section-title">Liga <em>Ecuatoguineana</em></h2>
                <p className="league-section-sub">Resultados, clasificación y estadísticas en tiempo real</p>
              </div>
              {/* Botón federación → abre modal directamente, sin redirigir a /member-club */}
              <button className="btn-federation" onClick={() => setFedModal(true)}>
                <Shield size={13} />
                Portal Federación
              </button>
            </div>

            <LeagueContent isEmbedded={true} />
          </div>
        </section>
      </div>

      {/* ── Modal federación ── */}
      {fedModal && (
        <div className="fed-overlay" onClick={e => { if (e.target.classList.contains("fed-overlay")) setFedModal(false); }}>
          <div className="fed-modal">
            <button className="fed-modal-close" onClick={() => setFedModal(false)}>✕</button>
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Shield size={18} color="#DFFF00" />
                <span style={{ fontWeight: 800, fontSize: "18px", fontFamily: "Barlow Condensed, sans-serif", textTransform: "uppercase" }}>
                  Acceso Federación
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "rgba(240,239,232,0.35)" }}>Portal exclusivo de gestión federativa</p>
            </div>
            <label className="fed-label">Nombre de usuario / federación</label>
            <input className="fed-input" type="text" value={fedUser}
              onChange={e => setFedUser(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFedLogin()} />
            <label className="fed-label">Contraseña</label>
            <input className="fed-input" type="password" value={fedPass}
              onChange={e => setFedPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleFedLogin()} />
            {fedError && <div className="fed-error">{fedError}</div>}
            <button className="fed-btn" onClick={handleFedLogin} disabled={fedLoading}>
              {fedLoading ? "Comprobando..." : "Entrar al portal federativo"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Landing;