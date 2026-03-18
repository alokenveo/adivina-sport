import Link from 'next/link'

export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#0E0E0F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Helvetica Neue, Arial, sans-serif',
      gap: '32px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64,
          background: '#E8212A',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 18, color: '#fff',
          margin: '0 auto 16px'
        }}>AS</div>
        <h1 style={{
          color: '#F0EFE8', fontSize: 13,
          fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', opacity: 0.75
        }}>Adivina Sports</h1>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/tienda" style={{
          background: '#E8212A', color: '#fff',
          padding: '13px 32px', borderRadius: 9,
          fontWeight: 700, fontSize: 14,
          textDecoration: 'none', letterSpacing: '0.04em'
        }}>Tienda</Link>

        <Link href="/login" style={{
          background: 'transparent', color: '#F0EFE8',
          padding: '13px 32px', borderRadius: 9,
          fontWeight: 700, fontSize: 14,
          textDecoration: 'none', letterSpacing: '0.04em',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>Club Miembro</Link>
      </div>
    </main>
  )
}