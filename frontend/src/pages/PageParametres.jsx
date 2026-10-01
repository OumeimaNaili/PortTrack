import { useState } from 'react'

function IconeProfil() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

function IconeMotDePasse() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

function CarteOption({ icone, titre, description, onClick }) {
  const [survol, setSurvol] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        width: '100%',
        textAlign: 'left',
        background: '#FFFFFF',
        border: survol
          ? '1px solid #172F43'
          : '1px solid #E5E7EB',
        borderRadius: '14px',
        padding: '24px 26px',
        cursor: 'pointer',
        boxShadow: survol
          ? '0 4px 12px rgba(16,24,40,0.10)'
          : '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background:
            'linear-gradient(135deg, #1F3548 0%, #0F2942 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 6px rgba(15,41,66,0.28)',
        }}
      >
        {icone}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '17px',
            fontWeight: 700,
            color: '#101828',
            marginBottom: '4px',
          }}
        >
          {titre}
        </div>

        <div style={{ fontSize: '13px', color: '#667085' }}>
          {description}
        </div>
      </div>

      <span
        style={{
          fontSize: '20px',
          color: '#8FA6BF',
          flexShrink: 0,
        }}
      >
        ›
      </span>
    </button>
  )
}

function PageParametres({ onNavigate }) {
  const ouvrir = (page) => {
    if (onNavigate) {
      onNavigate(page)
    }
  }

  return (
    <div>
      <div
        style={{
          marginBottom: '24px',
          padding: '22px 28px',
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          borderLeft: '5px solid #172F43',
          boxShadow:
            '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#101828',
            margin: '0 0 6px 0',
          }}
        >
          Paramètres
        </h1>

        <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
          Gérez les informations et la sécurité de votre compte.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        <CarteOption
          icone={<IconeProfil />}
          titre="Modifier le profil"
          description="Mettre à jour vos informations personnelles."
          onClick={() => ouvrir('modifierProfil')}
        />

        <CarteOption
          icone={<IconeMotDePasse />}
          titre="Modifier le mot de passe"
          description="Changer le mot de passe de votre compte."
          onClick={() => ouvrir('modifierMotDePasse')}
        />
      </div>
    </div>
  )
}

export default PageParametres