'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Portal() {
  const router = useRouter()
  const [clubNombre, setClubNombre] = useState('')
  const [clubId, setClubId] = useState('')
  const [clubData, setClubData] = useState(null)
  const [seccion, setSeccion] = useState('dashboard')
  const [contratos, setContratos] = useState([])
  const [anuncios, setAnuncios] = useState([])

  useEffect(() => {
    const id = sessionStorage.getItem('clubId')
    const nombre = sessionStorage.getItem('clubNombre')
    if (!id) { router.push('/login'); return }
    setClubId(id)
    setClubNombre(nombre)

    fetch(`/api/portal/contratos?clubId=${id}`)
      .then(r => r.json()).then(setContratos)

    fetch(`/api/portal/anuncios?clubId=${id}`)
      .then(r => r.json()).then(setAnuncios)

    fetch(`/api/portal/club?clubId=${id}`)
      .then(r => r.json()).then(setClubData)
  }, [])

  function cerrarSesion() {
    sessionStorage.clear()
    document.cookie = 'clubId=; path=/; max-age=0'
    router.push('/login')
  }

  async function verPdf(pdfPath) {
    const res = await fetch(`/api/portal/signed-url?path=${encodeURIComponent(pdfPath)}`)
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  function fmtFecha(d) {
    if (!d) return '—'
    const p = d.split('-')
    return `${p[2]}/${p[1]}/${p[0]}`
  }

  const tagClass = {
    activo: 'tag-active',
    pendiente: 'tag-pending',
    archivado: 'tag-archived tag-expired'
  }

  const initials = (n) => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : ''

  const contratosActivos = contratos.filter(c => c.estado === 'activo').length
  const contratosPendientes = contratos.filter(c => c.estado === 'pendiente').length
  const anunciosNuevos = anuncios.length

  return (
    <>
      <style>{styles}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="topbar-logo">
          <div className="logo-mark">
            <img src="/logo.png" alt="Logo" />
          </div>
          <span className="topbar-brand">Adivina Sports</span>
        </div>
        <div className="topbar-sep" />
        <span className="topbar-section">Portal Privado de Clubes</span>
        <div className="topbar-right">
          <div className="club-chip">
            <div className="club-avatar">
              {clubData?.logo_url
                ? <img
                  src={clubData.logo_url}
                  alt={clubNombre}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                />
                : initials(clubNombre)
              }
            </div>
            <span className="club-name">{clubNombre}</span>
          </div>
          <button className="btn-signout" onClick={cerrarSesion}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="btn-signout-text">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="layout">

        {/* SIDEBAR */}
        <nav className="sidebar">
          <div className="sidebar-label">Menú</div>
          <div className={`nav-item ${seccion === 'dashboard' ? 'active' : ''}`} onClick={() => setSeccion('dashboard')}>
            <span className="nav-icon">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            Dashboard
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Gestión</div>
            <div className={`nav-item ${seccion === 'contratos' ? 'active' : ''}`} onClick={() => setSeccion('contratos')}>
              <span className="nav-icon">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M10 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5l-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M10 1v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M5 9h6M5 11.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </span>
              Contratos
            </div>
            <div className={`nav-item ${seccion === 'anuncios' ? 'active' : ''}`} onClick={() => setSeccion('anuncios')}>
              <span className="nav-icon">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M13 3H3a1 1 0 00-1 1v6a1 1 0 001 1h2v2.5l3-2.5h5a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              Anuncios
              {/*anunciosNuevos > 0 && <span className="nav-badge">{anunciosNuevos}</span>*/}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Club</div>
            <div className={`nav-item ${seccion === 'datos' ? 'active' : ''}`} onClick={() => setSeccion('datos')}>
              <span className="nav-icon">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 13c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </span>
              Datos del club
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="main">

          {/* DASHBOARD */}
          {seccion === 'dashboard' && (
            <div>
              <div className="page-header">
                <div className="page-title">Bienvenido, {clubNombre}</div>
                <div className="page-sub">Resumen de tu actividad en el portal</div>
              </div>
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-label">Contratos activos</div>
                  <div className="stat-value red">{contratosActivos}</div>
                  <div className="stat-detail">{contratosPendientes} pendiente{contratosPendientes !== 1 ? 's' : ''} de firma</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Anuncios nuevos</div>
                  <div className="stat-value">{anunciosNuevos}</div>
                  <div className="stat-detail">Sin leer</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Temporada</div>
                  <div className="stat-value">2025</div>
                  <div className="stat-detail">En curso</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Estado membresía</div>
                  <div className="stat-value" style={{ fontSize: '14px', paddingTop: '6px', color: '#4ade80' }}>● Activo</div>
                  <div className="stat-detail">Hasta dic. 2025</div>
                </div>
              </div>
              <div className="section">
                <div className="section-header">
                  <span className="section-title">Actividad reciente</span>
                </div>
                <div className="activity-list">
                  {contratos.slice(0, 2).map(c => (
                    <div key={c.id} className="activity-item">
                      <div className="activity-icon ai-red">📄</div>
                      <div>
                        <div className="activity-text"><strong>Contrato disponible</strong> — {c.titulo}</div>
                        <div className="activity-time">{fmtFecha(c.fecha_subida)}</div>
                      </div>
                    </div>
                  ))}
                  {anuncios.slice(0, 2).map(a => (
                    <div key={a.id} className="activity-item">
                      <div className="activity-icon ai-blue">📢</div>
                      <div>
                        <div className="activity-text"><strong>Anuncio publicado</strong> — {a.titulo}</div>
                        <div className="activity-time">{fmtFecha(a.fecha_creacion)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTRATOS */}
          {seccion === 'contratos' && (
            <div>
              <div className="page-header">
                <div className="page-title">Contratos</div>
                <div className="page-sub">Documentos y acuerdos de tu institución</div>
              </div>
              <div className="contrato-list">
                {contratos.length === 0 && <div className="empty">No hay contratos disponibles</div>}
                {contratos.map(c => (
                  <div key={c.id} className="contrato-item">
                    <div className="contrato-icon">
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path d="M10 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5l-4-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M10 1v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="contrato-info">
                      <div className="contrato-name">{c.titulo}</div>
                      <div className="contrato-meta">Añadido el {fmtFecha(c.fecha_subida)}</div>
                    </div>
                    <span className={`contrato-tag ${tagClass[c.estado] || ''}`}>{c.estado}</span>
                    {c.pdf_url && (
                      <button className="btn-pdf" onClick={() => verPdf(c.pdf_url)}>
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                          <path d="M8 10V3M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 13h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        Ver PDF
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANUNCIOS */}
          {seccion === 'anuncios' && (
            <div>
              <div className="page-header">
                <div className="page-title">Anuncios</div>
                <div className="page-sub">Comunicaciones de Adivina Sports para tu club</div>
              </div>
              <div className="anuncio-list">
                {anuncios.length === 0 && <div className="empty">No hay anuncios</div>}
                {anuncios.map(a => (
                  <div key={a.id} className="anuncio-item">
                    <div className="anuncio-dot" />
                    <div>
                      <div className="anuncio-title">{a.titulo}</div>
                      <div className="anuncio-body">{a.contenido}</div>
                      <div className="anuncio-date">{fmtFecha(a.fecha_creacion)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATOS DEL CLUB */}
          {seccion === 'datos' && (
            <div>
              <div className="page-header">
                <div className="page-title">Datos del club</div>
                <div className="page-sub">Información registrada de tu institución</div>
              </div>
              <div className="club-card">
                <div className="club-card-header">
                  <div className="club-logo-big">
                    {clubData?.logo_url
                      ? <img
                        src={clubData.logo_url}
                        alt={clubNombre}
                        style={{
                          display: 'block',
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center'
                        }}
                      />
                      : initials(clubNombre)
                    }
                  </div>
                  <div className="club-info-big">
                    <div className="name">{clubNombre}</div>
                    <div className="category">{clubData?.descripcion || 'Club deportivo'} · Miembro activo</div>
                  </div>
                </div>
                <div className="data-grid">
                  <div className="data-field">
                    <div className="data-key">Institución</div>
                    <div className="data-val">{clubNombre}</div>
                  </div>
                  <div className="data-field">
                    <div className="data-key">Descripción</div>
                    <div className="data-val">{clubData?.descripcion || '—'}</div>
                  </div>
                  <div className="data-field">
                    <div className="data-key">Estado</div>
                    <div className="data-val" style={{ color: '#4ade80' }}>Activo</div>
                  </div>
                  <div className="data-field">
                    <div className="data-key">Temporada</div>
                    <div className="data-val">2025</div>
                  </div>
                  <div className="data-field">
                    <div className="data-key">ID de club</div>
                    <div className="data-val" style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text2)' }}>{clubId?.slice(0, 13)}</div>
                  </div>
                  <div className="data-field">
                    <div className="data-key">Alta en portal</div>
                    <div className="data-val">{clubData ? fmtFecha(clubData.created_at?.split('T')[0]) : '—'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}

const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --red: #E8212A; --red-dark: #B8191F; --red-light: #FF4A52;
  --bg: #0E0E0F; --surface: #161618; --surface2: #1E1E21; --surface3: #252528;
  --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.12);
  --text: #F0EFE8; --text2: #9A9990; --text3: #5A5955;
  --font: 'Helvetica Neue', Arial, sans-serif;
}
body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 14px; min-height: 100vh; display: flex; flex-direction: column; }
.topbar { height: 52px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 12px; flex-shrink: 0; }
.topbar-logo { display: flex; align-items: center; gap: 10px; }
.logo-mark { width: 28px; height: 28px; background: var(--red); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; color: #fff; letter-spacing: -0.3px; flex-shrink: 0; }
.topbar-brand { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text); opacity: 0.85; }
.topbar-sep { width: 1px; height: 20px; background: var(--border2); margin: 0 4px; }
.topbar-section { font-size: 12px; color: var(--text2); letter-spacing: 0.04em; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
.club-chip { display: flex; align-items: center; gap: 8px; background: var(--surface2); border: 1px solid var(--border2); border-radius: 20px; padding: 4px 10px 4px 6px; cursor: pointer; }
.club-avatar { 
  width: 30px; 
  height: 30px; 
  border-radius: 50%; 
  overflow: hidden; 
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface3);
  border: 1px solid var(--border2);
  font-size: 9px;
  font-weight: 700;
  color: var(--text2);
}
.club-name { font-size: 12px; color: var(--text); font-weight: 500; }
.btn-signout { background: transparent; border: 1px solid var(--border2); color: var(--text2); font-size: 12px; padding: 5px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: border-color 0.15s, color 0.15s; }
.btn-signout:hover { border-color: var(--red); color: var(--red); }
.layout { display: flex; flex: 1; overflow: hidden; min-height: calc(100vh - 52px); }
.sidebar { width: 200px; background: var(--surface); border-right: 1px solid var(--border); padding: 16px 0; flex-shrink: 0; display: flex; flex-direction: column; }
.sidebar-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text3); padding: 0 16px; margin-bottom: 8px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; font-size: 13px; color: var(--text2); cursor: pointer; border-left: 2px solid transparent; transition: color 0.15s, background 0.15s; margin: 1px 0; user-select: none; }
.nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text); }
.nav-item.active { color: var(--text); background: rgba(232,33,42,0.08); border-left-color: var(--red); }
.nav-icon { width: 16px; height: 16px; opacity: 0.6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.nav-item.active .nav-icon { opacity: 1; }
.nav-badge { margin-left: auto; background: var(--red); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; line-height: 1.4; }
.sidebar-section { margin-top: 24px; }
.main { flex: 1; overflow-y: auto; background: var(--bg); padding: 28px 32px; }
.page-header { margin-bottom: 28px; }
.page-title { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; color: var(--text); line-height: 1.2; }
.page-sub { font-size: 13px; color: var(--text2); margin-top: 5px; }
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; }
.stat-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.stat-value { font-size: 26px; font-weight: 700; color: var(--text); line-height: 1; }
.stat-value.red { color: var(--red); }
.stat-detail { font-size: 11px; color: var(--text3); margin-top: 5px; }
.section { margin-bottom: 28px; }
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.section-title { font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); }
.activity-list { display: flex; flex-direction: column; gap: 1px; }
.activity-item { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.activity-item:last-child { border-bottom: none; }
.activity-icon { width: 28px; height: 28px; border-radius: 7px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; }
.ai-red { background: rgba(232,33,42,0.12); }
.ai-green { background: rgba(34,197,94,0.1); }
.ai-blue { background: rgba(59,139,212,0.1); }
.activity-text { font-size: 13px; color: var(--text2); line-height: 1.4; }
.activity-text strong { color: var(--text); font-weight: 500; }
.activity-time { font-size: 11px; color: var(--text3); margin-top: 2px; }
.contrato-list { display: flex; flex-direction: column; gap: 8px; }
.contrato-item { display: flex; align-items: center; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; transition: border-color 0.15s, background 0.15s; gap: 14px; }
.contrato-item:hover { border-color: var(--border2); background: var(--surface2); }
.contrato-icon { width: 36px; height: 36px; background: rgba(232,33,42,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--red); }
.contrato-info { flex: 1; }
.contrato-name { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 3px; }
.contrato-meta { font-size: 12px; color: var(--text3); }
.contrato-tag { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 5px; text-transform: uppercase; letter-spacing: 0.06em; margin-right: 10px; }
.tag-active { background: rgba(34,197,94,0.12); color: #4ade80; }
.tag-pending { background: rgba(251,191,36,0.12); color: #fbbf24; }
.tag-archived, .tag-expired { background: rgba(255,255,255,0.06); color: var(--text3); }
.btn-pdf { display: flex; align-items: center; gap: 6px; background: var(--surface3); border: 1px solid var(--border2); color: var(--text); font-size: 12px; font-weight: 500; padding: 7px 14px; border-radius: 7px; cursor: pointer; transition: background 0.15s, border-color 0.15s; white-space: nowrap; text-decoration: none; }
.btn-pdf:hover { background: var(--red); border-color: var(--red); }
.anuncio-list { display: flex; flex-direction: column; gap: 8px; }
.anuncio-item { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; gap: 14px; cursor: pointer; transition: border-color 0.15s; }
.anuncio-item:hover { border-color: var(--border2); }
.anuncio-dot { width: 8px; height: 8px; background: var(--red); border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.anuncio-title { font-size: 14px; font-weight: 500; color: var(--text); margin-bottom: 4px; }
.anuncio-body { font-size: 13px; color: var(--text2); line-height: 1.5; }
.anuncio-date { font-size: 11px; color: var(--text3); margin-top: 6px; }
.club-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
.club-card-header { background: linear-gradient(135deg, #1a0608 0%, #1e1014 100%); border-bottom: 1px solid var(--border); padding: 24px 20px; display: flex; align-items: center; gap: 16px; }
.club-logo-big { 
  width: 60px; 
  height: 60px; 
  border-radius: 12px; 
  overflow: hidden; 
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface3);
  border: 2px solid var(--border2);
  font-size: 18px;
  font-weight: 800;
  color: var(--text2);
}
.club-info-big .name { font-size: 18px; font-weight: 700; color: var(--text); }
.club-info-big .category { font-size: 13px; color: var(--red); font-weight: 500; margin-top: 3px; }
.data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.data-field { padding: 14px 20px; border-bottom: 1px solid var(--border); border-right: 1px solid var(--border); }
.data-field:nth-child(even) { border-right: none; }
.data-field:nth-last-child(-n+2) { border-bottom: none; }
.data-key { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.data-val { font-size: 14px; color: var(--text); font-weight: 500; }
.empty { text-align: center; padding: 40px 20px; color: var(--text3); font-size: 13px; }
@media (max-width: 768px) {
  /* TOPBAR */
  .topbar { padding: 0 12px; gap: 8px; }
  .topbar-brand { display: none; }
  .topbar-sep { display: none; }
  /* .topbar-section { display: none; } */
  .topbar-logo { gap: 0; }
  .club-chip { padding: 4px 6px; }
  /* .club-chip .club-name { display: none; } */
  .btn-signout { padding: 6px 8px; min-width: 32px; justify-content: center; }
  .btn-signout svg { width: 15px; height: 15px; }
  .btn-signout-text { display: none; }

  /* LAYOUT */
  .layout { flex-direction: column; min-height: auto; }

  /* SIDEBAR HORIZONTAL — solo iconos */
  .sidebar {
    width: 100%;
    flex-direction: row;
    padding: 0;
    border-right: none;
    border-bottom: 1px solid var(--border);
    overflow-x: visible;
    flex-wrap: nowrap;
    height: 48px;
    align-items: stretch;
    justify-content: space-around;
  }
  .sidebar-label { display: none; }
  .sidebar-section { margin-top: 0; display: contents; }
  .nav-item {
    flex: 1;
    flex-direction: column;
    padding: 6px 4px;
    border-left: none;
    border-bottom: 2px solid transparent;
    border-top: none;
    white-space: nowrap;
    justify-content: center;
    align-items: center;
    gap: 3px;
    min-width: 0;
    font-size: 9px;
    color: var(--text3);
  }
  .nav-item.active {
    border-left: none;
    border-bottom-color: var(--red);
    background: rgba(232,33,42,0.06);
    color: var(--text);
  }
  .nav-item .nav-icon {
    opacity: 1;
    width: 18px;
    height: 18px;
  }
  .nav-item .nav-icon svg { width: 18px; height: 18px; }
  .nav-badge { margin-left: 0; margin-top: 0; padding: 0px 4px; font-size: 9px; }

  /* MAIN */
  .main { padding: 16px 14px; }
  .stats-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .page-title { font-size: 18px; }
  .data-grid { grid-template-columns: 1fr; }
  .data-field:nth-child(even) { border-right: none; }
  .data-field:nth-last-child(-n+2) { border-bottom: 1px solid var(--border); }
  .data-field:last-child { border-bottom: none; }
  .contrato-tag { display: none; }
  .contrato-item { flex-wrap: wrap; }
}

@media (max-width: 480px) {
  .stats-row { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-value { font-size: 20px; }
}
`
