'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
    const router = useRouter()
    const [instituciones, setInstituciones] = useState([])
    const [selectedInst, setSelectedInst] = useState(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [adminModal, setAdminModal] = useState(false)
    const [adminUser, setAdminUser] = useState('')
    const [adminPass, setAdminPass] = useState('')
    const [adminError, setAdminError] = useState('')
    const [adminSuccess, setAdminSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/instituciones')
            .then(r => r.json())
            .then(data => setInstituciones(data))
    }, [])

    async function doLogin() {
        if (!selectedInst || !password) {
            setLoginError('Selecciona una institución e introduce la contraseña.')
            return
        }
        setLoading(true)
        setLoginError('')
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ institucionId: selectedInst.id, contrasena: password })
        })
        setLoading(false)
        if (res.ok) {
            const { club } = await res.json()
            sessionStorage.setItem('clubId', club.id)
            sessionStorage.setItem('clubNombre', club.nombre)
            router.push('/portal')
        } else {
            setLoginError('Institución o contraseña incorrecta.')
        }
    }

    async function doAdminLogin() {
        if (!adminUser || !adminPass) {
            setAdminError('Rellena usuario y contraseña.')
            return
        }
        const res = await fetch('/api/admin-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario: adminUser, contrasena: adminPass })
        })
        if (res.ok) {
            setAdminSuccess(true)
            setTimeout(() => router.push('/admin'), 1800)
        } else {
            setAdminError('Credenciales incorrectas.')
            setAdminPass('')
        }
    }

    return (
        <>
            <style>{styles}</style>

            {/* TOPBAR */}
            <div className="topbar">
                <button className="btn-back" onClick={() => router.push('/')}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Volver
                </button>
                <button className="btn-admin" onClick={() => { setAdminModal(true); setAdminSuccess(false); setAdminError(''); setAdminUser(''); setAdminPass('') }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" /><path d="M2 14c0-3 2.686-4.5 6-4.5s6 1.5 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                    Acceso admin
                </button>
            </div>

            {/* MAIN */}
            <div className="main">
                <div className="brand">
                    <div className="logo-box">AS</div>
                    <span className="brand-name">Adivina Sports</span>
                </div>

                <div className="card">
                    <div className="card-title">Iniciar sesión</div>
                    <div className="card-sub">Selecciona la entidad e introduce la contraseña</div>

                    <div className="field">
                        <label className="field-label">Institución deportiva</label>
                        <div className="select-wrap">
                            <div className={`select-btn ${selectedInst ? 'has-value' : ''} ${dropdownOpen ? 'open' : ''}`}
                                onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <span>{selectedInst ? selectedInst.nombre : 'Selecciona una institución'}</span>
                                <svg className="select-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            {dropdownOpen && (
                                <div className="dropdown open">
                                    {instituciones.map(inst => (
                                        <div key={inst.id}
                                            className={`dropdown-item ${selectedInst?.id === inst.id ? 'selected' : ''}`}
                                            onClick={() => { setSelectedInst(inst); setDropdownOpen(false) }}>
                                            {inst.nombre}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="field">
                        <label className="field-label">Contraseña <span style={{ color: 'var(--red)' }}>*</span></label>
                        <input className="input" type="password" placeholder="Contraseña..."
                            value={password} onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && doLogin()} />
                    </div>

                    {loginError && <div className="error-msg show">{loginError}</div>}

                    <button className="btn-login" onClick={doLogin} disabled={loading}>
                        {loading ? 'Comprobando...' : 'Iniciar sesión'}
                    </button>
                    <div className="forgot">¿Olvidaste la contraseña?</div>
                </div>
            </div>

            {/* ADMIN MODAL */}
            {adminModal && (
                <div className="overlay open" onClick={e => { if (e.target.classList.contains('overlay')) setAdminModal(false) }}>
                    <div className="modal">
                        <div className="modal-close" onClick={() => setAdminModal(false)}>✕</div>
                        {!adminSuccess ? (
                            <>
                                <div className="modal-icon">
                                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="#E8212A" strokeWidth="1.4" /><path d="M5 7V5a3 3 0 016 0v2" stroke="#E8212A" strokeWidth="1.4" strokeLinecap="round" /></svg>
                                </div>
                                <div className="modal-title">Acceso de administrador</div>
                                <div className="modal-sub">Introduce tus credenciales para acceder al panel de gestión.</div>
                                <div className="modal-field">
                                    <label className="field-label">Usuario</label>
                                    <input className="input" type="text" placeholder="admin@adivinasports.com"
                                        value={adminUser} onChange={e => setAdminUser(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doAdminLogin()} />
                                </div>
                                <div className="modal-field">
                                    <label className="field-label">Contraseña</label>
                                    <input className="input" type="password" placeholder="Contraseña..."
                                        value={adminPass} onChange={e => setAdminPass(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && doAdminLogin()} />
                                </div>
                                {adminError && <div className="modal-error show">{adminError}</div>}
                                <button className="btn-modal-login" onClick={doAdminLogin}>Entrar al panel</button>
                            </>
                        ) : (
                            <div className="modal-success show">
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
        </>
    )
}

const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --red: #E8212A; --red-dark: #B8191F;
  --bg: #0E0E0F; --surface: #161618; --surface2: #1E1E21; --surface3: #252528;
  --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.14);
  --text: #F0EFE8; --text2: #9A9990; --text3: #5A5955;
}
body { background: var(--bg); color: var(--text); font-family: 'Helvetica Neue', Arial, sans-serif; min-height: 100vh; display: flex; flex-direction: column; }
.topbar { height: 52px; display: flex; align-items: center; padding: 0 24px; flex-shrink: 0; }
.btn-back { display: flex; align-items: center; gap: 7px; background: var(--red); color: #fff; font-size: 13px; font-weight: 600; padding: 7px 16px; border-radius: 20px; border: none; cursor: pointer; }
.btn-back:hover { background: var(--red-dark); }
.btn-admin { margin-left: auto; display: flex; align-items: center; gap: 7px; background: transparent; color: var(--text2); font-size: 12px; font-weight: 500; padding: 7px 14px; border-radius: 20px; border: 1px solid var(--border2); cursor: pointer; }
.btn-admin:hover { color: var(--text); background: var(--surface2); }
.main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 24px 48px; }
.brand { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 32px; }
.logo-box { width: 56px; height: 56px; background: var(--red); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #fff; }
.brand-name { font-size: 12px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text); opacity: 0.75; }
.card { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 32px 32px 28px; width: 100%; max-width: 380px; }
.card-title { font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.card-sub { font-size: 13px; color: var(--text2); margin-bottom: 28px; line-height: 1.5; }
.field { margin-bottom: 20px; }
.field-label { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text3); margin-bottom: 8px; display: block; }
.select-wrap { position: relative; }
.select-btn { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 9px; padding: 11px 14px; color: var(--text2); font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; user-select: none; }
.select-btn.has-value { color: var(--text); }
.select-btn.open, .select-btn:hover { border-color: var(--red); }
.select-chevron { transition: transform 0.2s; color: var(--text3); }
.select-btn.open .select-chevron { transform: rotate(180deg); }
.dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: var(--surface2); border: 1px solid var(--border2); border-radius: 10px; overflow-y: auto; max-height: 220px; z-index: 10; }
.dropdown-item { padding: 10px 14px; font-size: 13px; color: var(--text2); cursor: pointer; border-bottom: 1px solid var(--border); }
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:hover { background: var(--surface3); color: var(--text); }
.dropdown-item.selected { color: var(--text); background: rgba(232,33,42,0.08); }
.input { width: 100%; background: var(--surface2); border: 1px solid var(--border2); border-radius: 9px; padding: 11px 14px; color: var(--text); font-size: 14px; font-family: inherit; outline: none; }
.input:focus { border-color: var(--red); }
.input::placeholder { color: var(--text3); }
.btn-login { width: 100%; background: var(--red); color: #fff; font-size: 14px; font-weight: 700; padding: 13px; border: none; border-radius: 9px; cursor: pointer; margin-top: 8px; }
.btn-login:hover { background: #C8181F; }
.btn-login:disabled { opacity: 0.4; cursor: not-allowed; }
.forgot { text-align: center; margin-top: 18px; font-size: 12px; color: var(--red); cursor: pointer; text-decoration: underline; }
.error-msg { background: rgba(232,33,42,0.1); border: 1px solid rgba(232,33,42,0.25); border-radius: 7px; color: #ff6b70; font-size: 13px; padding: 10px 14px; margin-top: 14px; display: none; }
.error-msg.show { display: block; }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px; }
.modal { background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 28px; width: 100%; max-width: 340px; position: relative; }
.modal-close { position: absolute; top: 16px; right: 16px; background: var(--surface3); border: 1px solid var(--border); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text2); font-size: 14px; }
.modal-icon { width: 40px; height: 40px; background: rgba(232,33,42,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.modal-title { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
.modal-sub { font-size: 13px; color: var(--text2); margin-bottom: 22px; line-height: 1.5; }
.modal-field { margin-bottom: 14px; }
.btn-modal-login { width: 100%; background: var(--red); color: #fff; font-size: 13px; font-weight: 700; padding: 11px; border: none; border-radius: 8px; cursor: pointer; margin-top: 4px; }
.btn-modal-login:hover { background: #C8181F; }
.modal-error { background: rgba(232,33,42,0.1); border: 1px solid rgba(232,33,42,0.25); border-radius: 7px; color: #ff6b70; font-size: 12px; padding: 8px 12px; margin-top: 10px; display: none; }
.modal-error.show { display: block; }
.modal-success { text-align: center; padding: 16px 0 8px; }
.success-icon { width: 48px; height: 48px; background: rgba(74,222,128,0.12); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 22px; }
.success-text { font-size: 14px; color: var(--text2); }
.success-text strong { color: var(--text); display: block; margin-bottom: 4px; font-size: 16px; }
`