'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const router = useRouter()
  const [seccion, setSeccion] = useState('instituciones')

  // Data
  const [instituciones, setInstituciones] = useState([])
  const [contratos, setContratos] = useState([])
  const [anuncios, setAnuncios] = useState([])

  // Modal estados
  const [modalInst, setModalInst] = useState(false)
  const [modalCont, setModalCont] = useState(false)
  const [modalAnun, setModalAnun] = useState(false)
  const [modalConfirm, setModalConfirm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Form institución
  const [instNombre, setInstNombre] = useState('')
  const [instPass, setInstPass] = useState('')
  const [instDesc, setInstDesc] = useState('')
  const [instEstado, setInstEstado] = useState('activo')

  // Form contrato
  const [contTitulo, setContTitulo] = useState('')
  const [contInstId, setContInstId] = useState('')
  const [contFecha, setContFecha] = useState(today())
  const [contEstado, setContEstado] = useState('activo')
  const [contFile, setContFile] = useState(null)
  const [contFileName, setContFileName] = useState('Haz clic para subir PDF')
  const contFileRef = useRef()
  const logoFileRef = useRef()
  const [logoFile, setLogoFile] = useState(null)
  const [logoFileName, setLogoFileName] = useState('Haz clic para subir logo')
  const [logoPreview, setLogoPreview] = useState(null)

  // Form anuncio
  const [anunTitulo, setAnunTitulo] = useState('')
  const [anunContenido, setAnunContenido] = useState('')
  const [anunFecha, setAnunFecha] = useState(today())
  const [anunInstId, setAnunInstId] = useState('')

  const [saving, setSaving] = useState(false)

  function today() {
    return new Date().toISOString().split('T')[0]
  }

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [ri, rc, ra] = await Promise.all([
      fetch('/api/admin/instituciones').then(r => r.json()),
      fetch('/api/admin/contratos').then(r => r.json()),
      fetch('/api/admin/anuncios').then(r => r.json()),
    ])
    setInstituciones(ri)
    setContratos(rc)
    setAnuncios(ra)
  }

  function fmtFecha(d) {
    if (!d) return '—'
    const p = d.split('-')
    return `${p[2]}/${p[1]}/${p[0]}`
  }

  function initials(n) {
    return n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : ''
  }

  function instNombreById(id) {
    const i = instituciones.find(x => x.id === id)
    return i ? i.nombre : '—'
  }

  function instContratosCount(id) {
    return contratos.filter(c => c.institucion_id === id).length
  }

  const tagClass = { activo: 'tag-active', pendiente: 'tag-pending', archivado: 'tag-archived', inactivo: 'tag-inactive' }

  // ---- INSTITUCIÓN ----
  function openNewInst() {
    setEditingId(null)
    setInstNombre(''); setInstPass(''); setInstDesc(''); setInstEstado('activo')
    setLogoFile(null); setLogoFileName('Haz clic para subir logo'); setLogoPreview(null)
    setModalInst(true)
  }

  function openEditInst(inst) {
    setEditingId(inst.id)
    setInstNombre(inst.nombre); setInstPass(''); setInstDesc(inst.descripcion || ''); setInstEstado(inst.activo ? 'activo' : 'inactivo')
    setLogoFile(null); setLogoPreview(inst.logo_url || null)
    setLogoFileName(inst.logo_url ? '✓ Logo actual' : 'Haz clic para subir logo')
    setModalInst(true)
  }

  async function saveInst() {
    if (!instNombre) return
    setSaving(true)

    let logoUrl = undefined
    if (logoFile) {
      const formData = new FormData()
      formData.append('file', logoFile)
      formData.append('institucionId', editingId || 'new-' + Date.now())
      const res = await fetch('/api/admin/upload-logo', { method: 'POST', body: formData })
      const data = await res.json()
      logoUrl = data.url
    }

    await fetch('/api/admin/instituciones', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        nombre: instNombre,
        contrasena: instPass || undefined,
        descripcion: instDesc,
        activo: instEstado === 'activo',
        ...(logoUrl && { logo_url: logoUrl })
      })
    })
    setSaving(false)
    setModalInst(false)
    loadAll()
  }

  // ---- CONTRATO ----
  function openNewCont() {
    setEditingId(null)
    setContTitulo(''); setContInstId(instituciones[0]?.id || ''); setContFecha(today()); setContEstado('activo'); setContFile(null); setContFileName('Haz clic para subir PDF')
    setModalCont(true)
  }

  function openEditCont(cont) {
    setEditingId(cont.id)
    setContTitulo(cont.titulo); setContInstId(cont.institucion_id); setContFecha(cont.fecha_subida || today()); setContEstado(cont.estado); setContFile(null); setContFileName('Haz clic para cambiar PDF')
    setModalCont(true)
  }

  async function saveCont() {
    if (!contTitulo || !contInstId) return
    setSaving(true)

    let pdfUrl = null
    if (contFile) {
      const formData = new FormData()
      formData.append('file', contFile)
      formData.append('institucionId', contInstId)
      const uploadRes = await fetch('/api/admin/upload-pdf', { method: 'POST', body: formData })
      const uploadData = await uploadRes.json()
      pdfUrl = uploadData.url
    }

    await fetch('/api/admin/contratos', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        titulo: contTitulo,
        institucion_id: contInstId,
        fecha_subida: contFecha,
        estado: contEstado,
        ...(pdfUrl && { pdf_url: pdfUrl })
      })
    })
    setSaving(false)
    setModalCont(false)
    loadAll()
  }

  // ---- ANUNCIO ----
  function openNewAnun() {
    setEditingId(null)
    setAnunTitulo(''); setAnunContenido(''); setAnunFecha(today()); setAnunInstId('')
    setModalAnun(true)
  }

  function openEditAnun(anun) {
    setEditingId(anun.id)
    setAnunTitulo(anun.titulo); setAnunContenido(anun.contenido || ''); setAnunFecha(anun.fecha_creacion || today()); setAnunInstId(anun.institucion_id || '')
    setModalAnun(true)
  }

  async function saveAnun() {
    if (!anunTitulo) return
    setSaving(true)
    await fetch('/api/admin/anuncios', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingId,
        titulo: anunTitulo,
        contenido: anunContenido,
        fecha_creacion: anunFecha,
        institucion_id: anunInstId || null
      })
    })
    setSaving(false)
    setModalAnun(false)
    loadAll()
  }

  // ---- DELETE ----
  function askDelete(type, id, nombre) {
    setDeleteTarget({ type, id, nombre })
    setModalConfirm(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const endpoints = { inst: '/api/admin/instituciones', cont: '/api/admin/contratos', anun: '/api/admin/anuncios' }
    await fetch(endpoints[deleteTarget.type], {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget.id })
    })
    setModalConfirm(false)
    setDeleteTarget(null)
    loadAll()
  }

  const instActivas = instituciones.filter(i => i.activo).length

  return (
    <>
      <style>{styles}</style>

      {/* TOPBAR */}
      <div className="topbar">
        <div className="logo-mark">AS</div>
        <span className="topbar-brand">Adivina Sports</span>
        <div className="topbar-sep" />
        <span className="admin-badge">Panel Admin</span>
        <div className="topbar-right">
          <span style={{ fontSize: '12px', color: 'var(--text2)' }}>admin@adivinasports.com</span>
          <button className="btn-out" onClick={() => {
            document.cookie = 'isAdmin=; path=/; max-age=0'
            router.push('/login')
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Salir
          </button>
        </div>
      </div>

      <div className="layout">
        {/* SIDEBAR */}
        <nav className="sidebar">
          <div className="sidebar-label">Gestión</div>
          <div className={`nav-item ${seccion === 'instituciones' ? 'active' : ''}`} onClick={() => setSeccion('instituciones')}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" /><path d="M2 14c0-3 2.686-4.5 6-4.5s6 1.5 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            Instituciones
            <span className="nav-count">{instituciones.length}</span>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Contenido</div>
            <div className={`nav-item ${seccion === 'contratos' ? 'active' : ''}`} onClick={() => setSeccion('contratos')}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5l-4-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M10 1v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
              Contratos
              <span className="nav-count">{contratos.length}</span>
            </div>
            <div className={`nav-item ${seccion === 'anuncios' ? 'active' : ''}`} onClick={() => setSeccion('anuncios')}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 3H3a1 1 0 00-1 1v6a1 1 0 001 1h2v2.5l3-2.5h5a1 1 0 001-1V4a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
              Anuncios
              <span className="nav-count">{anuncios.length}</span>
            </div>
          </div>
        </nav>

        {/* MAIN */}
        <main className="main">

          {/* INSTITUCIONES */}
          {seccion === 'instituciones' && (
            <div>
              <div className="page-header">
                <div className="page-title">Instituciones</div>
                <button className="btn-primary" onClick={openNewInst}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Nueva institución
                </button>
              </div>
              <div className="stats-row">
                <div className="stat-card"><div className="stat-label">Total</div><div className="stat-value red">{instituciones.length}</div></div>
                <div className="stat-card"><div className="stat-label">Activas</div><div className="stat-value">{instActivas}</div></div>
                <div className="stat-card"><div className="stat-label">Inactivas</div><div className="stat-value">{instituciones.length - instActivas}</div></div>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Institución</th><th>Estado</th><th>Contratos</th><th></th></tr></thead>
                  <tbody>
                    {instituciones.map(i => (
                      <tr key={i.id}>
                        <td className="primary">
                          <div className="cell-with-avatar">
                            <div className="avatar-sm">{initials(i.nombre)}</div>
                            {i.nombre}
                          </div>
                        </td>
                        <td><span className={`tag ${i.activo ? 'tag-active' : 'tag-inactive'}`}>{i.activo ? 'activo' : 'inactivo'}</span></td>
                        <td style={{ color: 'var(--text3)' }}>{instContratosCount(i.id)}</td>
                        <td>
                          <div className="row-actions">
                            <button className="btn-icon" onClick={() => openEditInst(i)}>
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-9 9H2v-3L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                              Editar
                            </button>
                            <button className="btn-icon danger" onClick={() => askDelete('inst', i.id, i.nombre)}>
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONTRATOS */}
          {seccion === 'contratos' && (
            <div>
              <div className="page-header">
                <div className="page-title">Contratos</div>
                <button className="btn-primary" onClick={openNewCont}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Subir contrato
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Título</th><th>Institución</th><th>Fecha subida</th><th>Estado</th><th></th></tr></thead>
                  <tbody>
                    {contratos.map(c => (
                      <tr key={c.id}>
                        <td className="primary">{c.titulo}</td>
                        <td>{instNombreById(c.institucion_id)}</td>
                        <td style={{ color: 'var(--text3)' }}>{fmtFecha(c.fecha_subida)}</td>
                        <td><span className={`tag ${tagClass[c.estado] || ''}`}>{c.estado}</span></td>
                        <td>
                          <div className="row-actions">
                            <button className="btn-icon" onClick={() => openEditCont(c)}>
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-9 9H2v-3L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                              Editar
                            </button>
                            <button className="btn-icon danger" onClick={() => askDelete('cont', c.id, c.titulo)}>
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ANUNCIOS */}
          {seccion === 'anuncios' && (
            <div>
              <div className="page-header">
                <div className="page-title">Anuncios</div>
                <button className="btn-primary" onClick={openNewAnun}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                  Nuevo anuncio
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Título</th><th>Institución</th><th>Fecha</th><th></th></tr></thead>
                  <tbody>
                    {anuncios.map(a => (
                      <tr key={a.id}>
                        <td className="primary">{a.titulo}</td>
                        <td>{a.institucion_id ? instNombreById(a.institucion_id) : <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Todas</span>}</td>
                        <td style={{ color: 'var(--text3)' }}>{fmtFecha(a.fecha_creacion)}</td>
                        <td>
                          <div className="row-actions">
                            <button className="btn-icon" onClick={() => openEditAnun(a)}>
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M11 2l3 3-9 9H2v-3L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                              Editar
                            </button>
                            <button className="btn-icon danger" onClick={() => askDelete('anun', a.id, a.titulo)}>
                              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL INSTITUCIÓN */}
      {modalInst && (
        <div className="overlay open" onClick={e => { if (e.target.classList.contains('overlay')) setModalInst(false) }}>
          <div className="modal">
            <div className="modal-close" onClick={() => setModalInst(false)}>✕</div>
            <div className="modal-title">{editingId ? 'Editar institución' : 'Nueva institución'}</div>
            <div className="modal-sub">Rellena los datos de la institución deportiva</div>
            <div className="form-field"><label className="form-label">Nombre</label><input className="form-input" value={instNombre} onChange={e => setInstNombre(e.target.value)} placeholder="Ej: Nueva Era C.B" /></div>
            <div className="form-field"><label className="form-label">Contraseña de acceso{editingId && ' (dejar vacío para no cambiar)'}</label><input className="form-input" type="password" value={instPass} onChange={e => setInstPass(e.target.value)} placeholder="Contraseña para el portal" /></div>
            <div className="form-field"><label className="form-label">Descripción</label><input className="form-input" value={instDesc} onChange={e => setInstDesc(e.target.value)} placeholder="Ej: Club de baloncesto" /></div>
            <div className="form-field">
              <label className="form-label">Logo del club</label>
              {logoPreview && (
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={logoPreview} alt="Logo actual" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border2)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Logo actual</span>
                </div>
              )}
              <div className="upload-zone" onClick={() => logoFileRef.current.click()}>
                <div className="upload-zone-icon">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M8 10V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                </div>
                <div className="upload-zone-text">{logoFileName}</div>
              </div>
              <input ref={logoFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const f = e.target.files[0]
                if (!f) return
                setLogoFile(f)
                setLogoFileName('✓ ' + f.name)
                setLogoPreview(URL.createObjectURL(f))
              }} />
            </div>
            <div className="form-field"><label className="form-label">Estado</label>
              <select className="form-input" value={instEstado} onChange={e => setInstEstado(e.target.value)}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <button className="btn-modal-submit" onClick={saveInst} disabled={saving}>{saving ? 'Guardando...' : 'Guardar institución'}</button>
          </div>
        </div>
      )}

      {/* MODAL CONTRATO */}
      {modalCont && (
        <div className="overlay open" onClick={e => { if (e.target.classList.contains('overlay')) setModalCont(false) }}>
          <div className="modal">
            <div className="modal-close" onClick={() => setModalCont(false)}>✕</div>
            <div className="modal-title">{editingId ? 'Editar contrato' : 'Subir contrato'}</div>
            <div className="modal-sub">Asocia el contrato a una institución</div>
            <div className="form-field"><label className="form-label">Título</label><input className="form-input" value={contTitulo} onChange={e => setContTitulo(e.target.value)} placeholder="Ej: Acuerdo de patrocinio 2025" /></div>
            <div className="form-field"><label className="form-label">Institución</label>
              <select className="form-input" value={contInstId} onChange={e => setContInstId(e.target.value)}>
                {instituciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-field"><label className="form-label">Fecha de subida</label><input className="form-input" type="date" value={contFecha} onChange={e => setContFecha(e.target.value)} /></div>
              <div className="form-field"><label className="form-label">Estado</label>
                <select className="form-input" value={contEstado} onChange={e => setContEstado(e.target.value)}>
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="archivado">Archivado</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Archivo PDF</label>
              <div className="upload-zone" onClick={() => contFileRef.current.click()}>
                <div className="upload-zone-icon">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M10 1H3a1 1 0 00-1 1v12a1 1 0 001 1h10a1 1 0 001-1V5l-4-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M10 1v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
                </div>
                <div className="upload-zone-text">{contFileName}</div>
              </div>
              <input ref={contFileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { setContFile(e.target.files[0]); setContFileName('✓ ' + e.target.files[0]?.name) }} />
            </div>
            <button className="btn-modal-submit" onClick={saveCont} disabled={saving}>{saving ? 'Guardando...' : 'Guardar contrato'}</button>
          </div>
        </div>
      )}

      {/* MODAL ANUNCIO */}
      {modalAnun && (
        <div className="overlay open" onClick={e => { if (e.target.classList.contains('overlay')) setModalAnun(false) }}>
          <div className="modal">
            <div className="modal-close" onClick={() => setModalAnun(false)}>✕</div>
            <div className="modal-title">{editingId ? 'Editar anuncio' : 'Nuevo anuncio'}</div>
            <div className="modal-sub">Publica un comunicado para una institución o para todas</div>
            <div className="form-field"><label className="form-label">Título</label><input className="form-input" value={anunTitulo} onChange={e => setAnunTitulo(e.target.value)} placeholder="Ej: Convocatoria torneo primavera" /></div>
            <div className="form-field"><label className="form-label">Institución destinataria</label>
              <select className="form-input" value={anunInstId} onChange={e => setAnunInstId(e.target.value)}>
                <option value="">— Todas las instituciones —</option>
                {instituciones.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </div>
            <div className="form-field"><label className="form-label">Contenido</label><textarea className="form-input" rows="4" value={anunContenido} onChange={e => setAnunContenido(e.target.value)} placeholder="Escribe el contenido del anuncio..." style={{ resize: 'vertical' }} /></div>
            <div className="form-field"><label className="form-label">Fecha</label><input className="form-input" type="date" value={anunFecha} onChange={e => setAnunFecha(e.target.value)} /></div>
            <button className="btn-modal-submit" onClick={saveAnun} disabled={saving}>{saving ? 'Publicando...' : 'Publicar anuncio'}</button>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR BORRADO */}
      {modalConfirm && (
        <div className="overlay open" onClick={e => { if (e.target.classList.contains('overlay')) setModalConfirm(false) }}>
          <div className="modal confirm-modal">
            <div className="modal-close" onClick={() => setModalConfirm(false)}>✕</div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(232,33,42,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M5 4V2h6v2M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="#E8212A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
            </div>
            <div className="modal-title">¿Eliminar elemento?</div>
            <div className="modal-sub">Se eliminará &quot;{deleteTarget?.nombre}&quot;. Esta acción no se puede deshacer.</div>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setModalConfirm(false)}>Cancelar</button>
              <button className="btn-delete" onClick={confirmDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root { --red: #E8212A; --red-dark: #B8191F; --bg: #0E0E0F; --surface: #161618; --surface2: #1E1E21; --surface3: #252528; --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13); --text: #F0EFE8; --text2: #9A9990; --text3: #5A5955; }
body { background: var(--bg); color: var(--text); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; min-height: 100vh; display: flex; flex-direction: column; }
.topbar { height: 50px; background: var(--surface); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; gap: 10px; flex-shrink: 0; }
.logo-mark { width: 26px; height: 26px; background: var(--red); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 10px; color: #fff; flex-shrink: 0; }
.topbar-brand { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.8; }
.topbar-sep { width: 1px; height: 18px; background: var(--border2); margin: 0 4px; }
.admin-badge { font-size: 11px; color: var(--red); font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.btn-out { background: transparent; border: 1px solid var(--border2); color: var(--text2); font-size: 12px; padding: 5px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.btn-out:hover { border-color: var(--red); color: var(--red); }
.layout { display: flex; flex: 1; min-height: calc(100vh - 50px); overflow: hidden; }
.sidebar { width: 190px; background: var(--surface); border-right: 1px solid var(--border); padding: 14px 0; flex-shrink: 0; display: flex; flex-direction: column; }
.sidebar-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text3); padding: 0 14px; margin-bottom: 6px; }
.nav-item { display: flex; align-items: center; gap: 9px; padding: 8px 14px; font-size: 13px; color: var(--text2); cursor: pointer; border-left: 2px solid transparent; transition: color .15s, background .15s; user-select: none; }
.nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text); }
.nav-item.active { color: var(--text); background: rgba(232,33,42,0.08); border-left-color: var(--red); }
.nav-count { margin-left: auto; font-size: 11px; color: var(--text3); background: var(--surface3); padding: 1px 7px; border-radius: 10px; }
.sidebar-section { margin-top: 20px; }
.main { flex: 1; overflow-y: auto; background: var(--bg); padding: 24px 28px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.page-title { font-size: 20px; font-weight: 700; letter-spacing: -0.2px; }
.btn-primary { background: var(--red); color: #fff; font-size: 12px; font-weight: 600; padding: 8px 16px; border: none; border-radius: 7px; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap; }
.btn-primary:hover { background: var(--red-dark); }
.table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 20px; }
table { width: 100%; border-collapse: collapse; }
thead th { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); padding: 11px 16px; text-align: left; border-bottom: 1px solid var(--border); background: var(--surface2); }
tbody tr { border-bottom: 1px solid var(--border); transition: background .1s; cursor: pointer; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: var(--surface2); }
td { padding: 11px 16px; font-size: 13px; color: var(--text2); vertical-align: middle; }
td.primary { color: var(--text); font-weight: 500; }
.tag { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
.tag-active { background: rgba(74,222,128,0.1); color: #4ade80; }
.tag-inactive { background: rgba(255,255,255,0.05); color: var(--text3); }
.tag-pending { background: rgba(251,191,36,0.1); color: #fbbf24; }
.tag-archived { background: rgba(255,255,255,0.05); color: var(--text3); }
.row-actions { display: flex; gap: 6px; justify-content: flex-end; }
.btn-icon { background: var(--surface3); border: 1px solid var(--border); color: var(--text2); padding: 5px 9px; border-radius: 6px; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
.btn-icon:hover { background: var(--surface2); border-color: var(--border2); color: var(--text); }
.btn-icon.danger:hover { border-color: var(--red); color: var(--red); }
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 22px; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 14px 16px; }
.stat-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--text); line-height: 1; }
.stat-value.red { color: var(--red); }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.72); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 14px; padding: 26px; width: 100%; max-width: 420px; position: relative; max-height: 90vh; overflow-y: auto; }
.modal-close { position: absolute; top: 14px; right: 14px; background: var(--surface3); border: 1px solid var(--border); border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text2); font-size: 13px; }
.modal-close:hover { color: var(--text); }
.modal-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--text); }
.modal-sub { font-size: 13px; color: var(--text2); margin-bottom: 20px; }
.form-field { margin-bottom: 14px; }
.form-label { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text3); display: block; margin-bottom: 6px; }
.form-input { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 8px; padding: 10px 12px; color: var(--text); font-size: 13px; font-family: inherit; outline: none; transition: border-color .15s; }
.form-input:focus { border-color: var(--red); }
.form-input::placeholder { color: var(--text3); }
select.form-input { cursor: pointer; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.btn-modal-submit { width: 100%; background: var(--red); color: #fff; font-size: 13px; font-weight: 700; padding: 11px; border: none; border-radius: 8px; cursor: pointer; margin-top: 6px; }
.btn-modal-submit:hover { background: var(--red-dark); }
.btn-modal-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.upload-zone { background: var(--surface2); border: 1px dashed var(--border2); border-radius: 8px; padding: 18px; text-align: center; cursor: pointer; }
.upload-zone:hover { border-color: var(--red); }
.upload-zone-text { font-size: 12px; color: var(--text3); margin-top: 6px; }
.upload-zone-icon { color: var(--text3); margin-bottom: 4px; }
.confirm-modal { max-width: 340px; }
.confirm-actions { display: flex; gap: 8px; margin-top: 20px; }
.btn-cancel { flex: 1; background: var(--surface3); border: 1px solid var(--border2); color: var(--text2); font-size: 13px; padding: 10px; border-radius: 8px; cursor: pointer; }
.btn-cancel:hover { background: var(--surface2); }
.btn-delete { flex: 1; background: var(--red); color: #fff; border: none; font-size: 13px; font-weight: 700; padding: 10px; border-radius: 8px; cursor: pointer; }
.btn-delete:hover { background: var(--red-dark); }
.avatar-sm { width: 28px; height: 28px; background: var(--surface3); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: var(--text2); border: 1px solid var(--border); flex-shrink: 0; }
.cell-with-avatar { display: flex; align-items: center; gap: 9px; }
.empty { text-align: center; padding: 40px 20px; color: var(--text3); font-size: 13px; }
@media (max-width: 768px) {
  .layout { flex-direction: column; }
  .sidebar { width: 100%; flex-direction: row; padding: 8px 0; border-right: none; border-bottom: 1px solid var(--border); overflow-x: auto; flex-shrink: 0; }
  .sidebar-label { display: none; }
  .sidebar-section { margin-top: 0; }
  .nav-item { padding: 8px 12px; border-left: none; border-bottom: 2px solid transparent; white-space: nowrap; font-size: 12px; }
  .nav-item.active { border-left: none; border-bottom-color: var(--red); }
  .main { padding: 16px; }
  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stat-value { font-size: 20px; }
  .page-header { flex-wrap: wrap; gap: 10px; }
  .table-wrap { overflow-x: auto; }
  table { min-width: 500px; }
  .form-row { grid-template-columns: 1fr; }
  .topbar-brand, .topbar-sep, .admin-badge { font-size: 11px; }
}

@media (max-width: 480px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .stat-label { font-size: 9px; }
}
`
