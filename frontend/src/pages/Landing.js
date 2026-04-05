import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";

// ── URLs de recursos en Supabase Storage ──────────────────────────────────────
// Sube estos archivos al bucket "recursos" en Supabase y reemplaza las URLs:
const SUPABASE_RECURSOS_URL = process.env.REACT_APP_SUPABASE_RECURSOS_URL || "";
// Ejemplo: "https://xxxx.supabase.co/storage/v1/object/public/recursos"
const VIDEO_1_URL    = SUPABASE_RECURSOS_URL ? `${SUPABASE_RECURSOS_URL}/v_f_1.mp4`      : "/v_f_1.mp4";
const VIDEO_2_URL    = SUPABASE_RECURSOS_URL ? `${SUPABASE_RECURSOS_URL}/v_f_2.mp4`      : "/v_f_2.mp4";
const FONDO_GYM_URL  = SUPABASE_RECURSOS_URL ? `${SUPABASE_RECURSOS_URL}/fondo_gym.jpg`  : "/fondo_gym.jpg";
const LOGO_URL       = SUPABASE_RECURSOS_URL ? `${SUPABASE_RECURSOS_URL}/logo_adivina.png` : "https://customer-assets.emergentagent.com/job_adivina-portal/artifacts/rexq8hh7_A56B5578-48F3-41C0-A247-75CAB5930CA5.png";
// ─────────────────────────────────────────────────────────────────────────────

const Landing = () => {
  const navigate = useNavigate();
  const { user, admin, authLoaded } = useAuth();
  const vid1Ref = useRef(null);
  const vid2Ref = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Si el auth ya cargó y hay sesión activa, el botón lleva directo al destino
  const handlePortalClick = () => {
    if (!authLoaded) { navigate("/member-club"); return; }
    if (admin)       { navigate("/admin/dashboard");  return; }
    if (user)        { navigate("/club/dashboard");   return; }
    navigate("/member-club");
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          width: 100%; height: 100%;
          overflow: hidden;
        }

        .home-root {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050505;
          font-family: 'Barlow Condensed', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        /* FONDO */
        .bg-gym {
          position: absolute;
          inset: 0;
          background-image: url('${FONDO_GYM_URL}');
          background-size: cover;
          background-position: center;
          z-index: 0;
          transform: ${loaded ? 'scale(1)' : 'scale(1.04)'};
          transition: transform 1.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(223,255,0,0.03) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(223,255,0,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          z-index: 0;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
        .bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 20%, rgba(5,5,5,0.85) 100%);
          z-index: 1;
        }

        /* CUADRO CENTRAL */
        .box {
          position: relative;
          z-index: 10;
          display: flex;
          width: min(760px, calc(100vw - 32px));
          height: min(470px, calc(100vh - 80px));
          overflow: hidden;
          border-radius: 6px;
          box-shadow:
            0 0 0 1px rgba(223,255,0,0.12),
            0 50px 140px rgba(0,0,0,0.9),
            0 0 80px rgba(223,255,0,0.04);
          opacity: ${loaded ? "1" : "0"};
          transform: ${loaded ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)"};
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ── IZQUIERDA — VIDEO ── */
        .box-left {
          width: 50%;
          position: relative;
          overflow: hidden;
          background: #080808;
          flex-shrink: 0;
        }
        .box-left video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          opacity: 0.75;
        }
        .box-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(5,5,5,0.1) 0%,
            transparent 40%,
            rgba(5,5,5,0.6) 100%
          );
          z-index: 2;
        }

        /* label live */
        .live-tag {
          position: absolute;
          bottom: 18px;
          left: 18px;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #DFFF00;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 0 0 rgba(223,255,0,0.4); }
          50% { opacity: 0.6; transform: scale(0.85); box-shadow: 0 0 0 4px rgba(223,255,0,0); }
        }
        .live-text {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
        }

        /* ── DIVISOR ── */
        .divider {
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 1px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(223,255,0,0.5) 20%,
            rgba(223,255,0,0.8) 50%,
            rgba(223,255,0,0.5) 80%,
            transparent
          );
          z-index: 20;
        }

        /* ── DERECHA ── */
        .box-right {
          width: 50%;
          position: relative;
          overflow: hidden;
          background: #060606;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .box-right video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.08;
          z-index: 0;
        }
        .box-right-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to left,
            rgba(5,5,5,0.15) 0%,
            rgba(5,5,5,0.72) 100%
          );
          z-index: 1;
        }

        /* Watermark slogan */
        .slogan-mask {
          position: absolute;
          bottom: 14px;
          left: 0; right: 0;
          z-index: 2;
          overflow: hidden;
          pointer-events: none;
          text-align: center;
        }
        .slogan-mask span {
          font-family: 'Barlow Condensed', Impact, 'Arial Black', sans-serif;
          font-size: 42px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(223,255,0,0.12);
          white-space: nowrap;
          display: inline-block;
        }

        /* Contenido derecha */
        .box-content {
          position: relative;
          z-index: 5;
          padding: 40px 38px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #DFFF00;
          margin-bottom: 14px;
          opacity: ${loaded ? "1" : "0"};
          transition: opacity 0.6s 0.5s;
        }

        .headline {
          font-family: 'Barlow Condensed', 'Helvetica Neue', Arial, sans-serif;
          font-size: clamp(26px, 4.5vw, 42px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.3px;
          color: #F0EFE8;
          margin-bottom: 12px;
          text-transform: uppercase;
          opacity: ${loaded ? "1" : "0"};
          transition: opacity 0.6s 0.6s;
        }
        .headline em {
          font-style: normal;
          color: #DFFF00;
        }

        .subline {
          font-family: 'Manrope', 'Helvetica Neue', Arial, sans-serif;
          font-size: 11px;
          color: rgba(240,239,232,0.35);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1.7;
          margin-bottom: 38px;
          opacity: ${loaded ? "1" : "0"};
          transition: opacity 0.6s 0.7s;
        }

        /* BOTONES */
        .btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          opacity: ${loaded ? "1" : "0"};
          transition: opacity 0.6s 0.85s;
        }

        .btn-primary {
          background: #DFFF00;
          color: #050505;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
          font-family: 'Barlow Condensed', inherit;
        }
        .btn-primary:hover {
          background: #f0ff33;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(223,255,0,0.25);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-arrow {
          font-size: 16px;
          line-height: 1;
          margin-top: -1px;
        }

        /* ESQUINAS */
        .corner {
          position: absolute;
          width: 18px; height: 18px;
          z-index: 25;
        }
        .corner-tl { top: 0; left: 0; border-top: 2px solid rgba(223,255,0,0.4); border-left: 2px solid rgba(223,255,0,0.4); }
        .corner-tr { top: 0; right: 0; border-top: 2px solid rgba(223,255,0,0.4); border-right: 2px solid rgba(223,255,0,0.4); }
        .corner-bl { bottom: 0; left: 0; border-bottom: 2px solid rgba(223,255,0,0.4); border-left: 2px solid rgba(223,255,0,0.4); }
        .corner-br { bottom: 0; right: 0; border-bottom: 2px solid rgba(223,255,0,0.4); border-right: 2px solid rgba(223,255,0,0.4); }

        /* RESPONSIVE — móvil */
        @media (max-width: 540px) {
          html, body { overflow: auto; }
          .home-root { position: relative; min-height: 100dvh; align-items: flex-start; padding: 0; }
          .box {
            flex-direction: column;
            width: 100vw;
            height: auto;
            min-height: 100dvh;
            border-radius: 0;
            box-shadow: none;
          }
          .box-left {
            width: 100%;
            height: 240px;
            flex-shrink: 0;
          }
          .box-left video { object-position: center 20%; }
          .divider {
            left: 0; right: 0; top: 240px;
            width: 100%; height: 1px;
            background: linear-gradient(to right, transparent, rgba(223,255,0,0.7) 50%, transparent);
            transform: none;
          }
          .box-right {
            width: 100%;
            flex: 1;
          }
          .box-content { padding: 32px 24px 48px; }
          .headline { font-size: 32px; }
          .btns { flex-direction: column; }
          .btn-primary { justify-content: center; padding: 14px 24px; }
          .corner-tl, .corner-tr, .corner-bl, .corner-br { display: none; }
          .slogan-mask span { font-size: 30px; }
        }

        /* RESPONSIVE — tablet */
        @media (min-width: 541px) and (max-width: 860px) {
          .box {
            width: calc(100vw - 48px);
            height: min(420px, calc(100vh - 80px));
          }
          .box-content { padding: 30px 28px; }
          .headline { font-size: 30px; }
          .subline { margin-bottom: 28px; }
        }
      `}</style>

      <div className="home-root">
        {/* Fondo */}
        <div className="bg-gym" />
        <div className="bg-grid" />
        <div className="bg-vignette" />

        {/* Cuadro central */}
        <div className="box">
          {/* Esquinas */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* ── IZQUIERDA ── */}
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

          {/* Divisor */}
          <div className="divider" />

          {/* ── DERECHA ── */}
          <div className="box-right">
            <video ref={vid2Ref} autoPlay muted loop playsInline preload="auto">
              <source src={VIDEO_2_URL} type="video/mp4" />
            </video>
            <div className="box-right-overlay" />

            <div className="slogan-mask">
              <span>ELITE SPORTS</span>
            </div>

            <div className="box-content">
              <div className="eyebrow">Página oficial</div>
              <div className="headline">
                de Adivina<br /><em>sport</em>
              </div>
              <div className="subline">
                Suplementación deportiva<br />
                para clubes e instituciones
              </div>
              <div className="btns">
                <button className="btn-primary" onClick={handlePortalClick}>
                  ACCEDER AL PORTAL DE CLUBES
                  <span className="btn-arrow">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
