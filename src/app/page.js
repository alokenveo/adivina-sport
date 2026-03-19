'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const vid1Ref = useRef(null)
  const vid2Ref = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Pequeño delay para que la animación de entrada se vea limpia
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

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
          background: #0a0606;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        /* FONDO GIMNASIO */
        .bg-gym {
          position: absolute;
          inset: 0;
          background-image: url('/fondo_gym.jpg');
          background-size: cover;
          background-position: center;
          z-index: 0;
          transform: ${loaded ? 'scale(1)' : 'scale(1.04)'};
          transition: transform 1.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bg-gym-overlay {
          position: absolute;
          inset: 0;
          background: rgba(6, 3, 3, 0.58);
          z-index: 1;
        }
        /* vignette */
        .bg-gym-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%);
          z-index: 2;
        }

        /* CUADRO CENTRAL */
        .box {
          position: relative;
          z-index: 10;
          display: flex;
          width: min(700px, calc(100vw - 32px));
          height: min(450px, calc(100vh - 80px));
          overflow: hidden;
          border-radius: 6px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.07),
            0 50px 140px rgba(0,0,0,0.85),
            0 0 60px rgba(232,33,42,0.08);
          opacity: ${loaded ? '1' : '0'};
          transform: ${loaded ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)'};
          transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* ---- LADO IZQUIERDO — VIDEO ---- */
        .box-left {
          width: 50%;
          position: relative;
          overflow: hidden;
          background: #080404;
          flex-shrink: 0;
        }
        .box-left video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          opacity: 0.85;
        }
        /* overlay izquierdo */
        .box-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(8,3,3,0.1) 0%,
            transparent 40%,
            rgba(8,3,3,0.55) 100%
          );
          z-index: 2;
        }
        /* label CAF */
        .caf-tag {
          position: absolute;
          bottom: 18px;
          left: 18px;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .caf-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #E8212A;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .caf-text {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
        }

        /* ---- DIVISOR CENTRAL ---- */
        .divider {
          position: absolute;
          left: 50%;
          top: 0; bottom: 0;
          width: 1px;
          transform: translateX(-50%);
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(232,33,42,0.6) 20%,
            rgba(232,33,42,0.8) 50%,
            rgba(232,33,42,0.6) 80%,
            transparent
          );
          z-index: 20;
        }

        /* ---- LADO DERECHO ---- */
        .box-right {
          width: 50%;
          position: relative;
          overflow: hidden;
          background: #060303;
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
          opacity: 0.18;
          z-index: 0;
        }
        .box-right-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to left,
            rgba(8,3,3,0.2) 0%,
            rgba(8,3,3,0.7) 100%
          );
          z-index: 1;
        }

        /* SLOGAN watermark en la derecha */
        .slogan-mask {
          position: absolute;
          bottom: 18px;
          left: 0; right: 0;
          z-index: 2;
          overflow: hidden;
          pointer-events: none;
          text-align: center;
        }
        .slogan-mask span {
          font-family: Impact, 'Arial Black', sans-serif;
          font-size: 38px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(232,33,42,0.2);
          white-space: nowrap;
          display: inline-block;
        }

        /* Contenido texto derecha */
        .box-content {
          position: relative;
          z-index: 5;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #E8212A;
          margin-bottom: 14px;
          opacity: ${loaded ? '1' : '0'};
          transition: opacity 0.6s 0.5s;
        }

        .headline {
          font-size: clamp(24px, 4.5vw, 38px);
          font-weight: 800;
          line-height: 1.06;
          letter-spacing: -0.5px;
          color: #F0EFE8;
          margin-bottom: 12px;
          opacity: ${loaded ? '1' : '0'};
          transition: opacity 0.6s 0.6s;
        }
        .headline em {
          font-style: normal;
          color: #E8212A;
        }

        .subline {
          font-size: 11px;
          color: rgba(240,239,232,0.32);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          line-height: 1.7;
          margin-bottom: 38px;
          opacity: ${loaded ? '1' : '0'};
          transition: opacity 0.6s 0.7s;
        }

        /* BOTONES */
        .btns {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          opacity: ${loaded ? '1' : '0'};
          transition: opacity 0.6s 0.85s;
        }

        .btn-primary {
          background: #E8212A;
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
        }
        .btn-primary:hover {
          background: #c71c24;
          transform: translateY(-1px);
        }
        .btn-primary:active { transform: translateY(0); }

        .btn-secondary {
          background: transparent;
          color: #F0EFE8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 11px 22px;
          border: 1.5px solid rgba(240,239,232,0.22);
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: border-color 0.15s, background 0.15s, transform 0.1s;
        }
        .btn-secondary:hover {
          border-color: rgba(240,239,232,0.55);
          background: rgba(240,239,232,0.05);
          transform: translateY(-1px);
        }
        .btn-secondary:active { transform: translateY(0); }

        .btn-arrow {
          font-size: 16px;
          line-height: 1;
          margin-top: -1px;
        }

        /* ESQUINAS DECORATIVAS del cuadro */
        .corner {
          position: absolute;
          width: 18px; height: 18px;
          z-index: 25;
        }
        .corner-tl { top: 0; left: 0; border-top: 2px solid rgba(232,33,42,0.45); border-left: 2px solid rgba(232,33,42,0.45); }
        .corner-tr { top: 0; right: 0; border-top: 2px solid rgba(232,33,42,0.45); border-right: 2px solid rgba(232,33,42,0.45); }
        .corner-bl { bottom: 0; left: 0; border-bottom: 2px solid rgba(232,33,42,0.45); border-left: 2px solid rgba(232,33,42,0.45); }
        .corner-br { bottom: 0; right: 0; border-bottom: 2px solid rgba(232,33,42,0.45); border-right: 2px solid rgba(232,33,42,0.45); }

  

        /* RESPONSIVE — móvil: cuadro vertical */
        @media (max-width: 540px) {
          html, body { overflow: auto; }
          .home-root { position: relative; min-height: 100dvh; align-items: flex-start; padding: 0; }
          .bg-gym { position: fixed; }
          .bg-gym-overlay { position: fixed; }
          .bg-gym-vignette { position: fixed; }
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
            height: 260px;
            flex-shrink: 0;
          }
          .box-left video { object-position: center 20%; }
          .divider {
            left: 0; right: 0; top: 260px;
            width: 100%; height: 1px;
            background: linear-gradient(to right, transparent, rgba(232,33,42,0.7) 50%, transparent);
            transform: none;
          }
          .box-right {
            width: 100%;
            flex: 1;
          }
          .box-content { padding: 32px 24px 48px; }
          .headline { font-size: 30px; }
          .btns { flex-direction: column; }
          .btn-primary, .btn-secondary { justify-content: center; padding: 14px 24px; }
          .corner-tl, .corner-tr, .corner-bl, .corner-br { display: none; }
          .slogan-mask span { font-size: 28px; }
        }

        /* RESPONSIVE — tablet */
        @media (min-width: 541px) and (max-width: 860px) {
          .box {
            width: calc(100vw - 48px);
            height: min(400px, calc(100vh - 80px));
          }
          .box-content { padding: 30px 28px; }
          .headline { font-size: 28px; }
          .subline { margin-bottom: 28px; }
        }
      `}</style>

      <div className="home-root">
        {/* Fondo gimnasio */}
        <div className="bg-gym" />
        <div className="bg-gym-overlay" />
        <div className="bg-gym-vignette" />

        {/* Cuadro central */}
        <div className="box">
          {/* Esquinas */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* ── IZQUIERDA ── */}
          <div className="box-left">
            <video
              ref={vid1Ref}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="/v_f_1.MP4" type="video/mp4" />
            </video>
            <div className="box-left-overlay" />
            <div className="caf-tag">
              <div className="caf-dot" />
              <span className="caf-text">Adivina Sport</span>
            </div>
          </div>

          {/* Divisor */}
          <div className="divider" />

          {/* ── DERECHA ── */}
          <div className="box-right">
            <video
              ref={vid2Ref}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src="/v_f_2.mp4" type="video/mp4" />
            </video>
            <div className="box-right-overlay" />

            {/* Slogan watermark */}
            <div className="slogan-mask">
              <span>WE CAN DO IT</span>
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
                <button
                  className="btn-primary"
                  onClick={() => router.push('/tienda')}
                >
                  Tienda
                  <span className="btn-arrow">›</span>
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => router.push('/login')}
                >
                  Club Miembro
                  <span className="btn-arrow">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
