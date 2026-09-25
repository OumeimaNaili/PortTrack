function Icone({ type, active = false }) {
  const couleur = active ? '#344D66' : '#738DA9'

  const icones = {
    tableauDeBord: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),

    utilisateurs: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),

    navires: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7" />
      </svg>
    ),

    marchandises: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <rect x="4" y="7" width="16" height="13" rx="1" />
        <path d="M4 11h16" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),

    notifications: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    ),

    profil: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="10" r="3" />
        <path d="M6.5 19a6 6 0 0 1 11 0" />
      </svg>
    ),

    parametres: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),

    deconnexion: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#738DA9"
        strokeWidth="1.8"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
  }

  return icones[type]
}

function AdminSidebar({
  pageActive = 'tableauDeBord',
  onNavigate,
  onDeconnexion,
}) {
  const elementsMenu = [
    {
      id: 'tableauDeBord',
      libelle: 'Tableau de bord',
      icone: 'tableauDeBord',
    },
    {
      id: 'utilisateurs',
      libelle: 'Utilisateurs',
      icone: 'utilisateurs',
    },
    {
      id: 'navires',
      libelle: 'Navires',
      icone: 'navires',
    },
    {
      id: 'marchandises',
      libelle: 'Produits',
      icone: 'marchandises',
    },
    {
      id: 'profil',
      libelle: 'Mon profil',
      icone: 'profil',
    },
    {
      id: 'parametres',
      libelle: 'Paramètres',
      icone: 'parametres',
    },
  ]

  return (
    <aside
      style={{
        width: '220px',
        minWidth: '220px',
        minHeight: '100vh',
        backgroundColor: '#0F2942',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: '100%',
          height: '64px',
          backgroundColor: '#001428',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          flexShrink: 0,
          boxSizing: 'border-box',
        }}
      >
        <img
          src="/porttrack-logo.png"
          alt="PortTrack"
          style={{
            width: '150px',
            height: 'auto',
            display: 'block',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Navigation */}
      <div
        style={{
          padding: '0 12px',
          marginTop: '24px',
        }}
      >
        {elementsMenu.map((element) => {
          const actif = pageActive === element.id

          return (
            <button
              key={element.id}
              type="button"
              onClick={() => {
                if (onNavigate) {
                  onNavigate(element.id)
                }
              }}
              style={{
                width: '100%',
                height: '40px',
                border: 'none',
                borderRadius: '5px',
                backgroundColor: actif
                  ? '#C8DFFE'
                  : 'transparent',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                marginBottom: '4px',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  width: '17px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '11px',
                  flexShrink: 0,
                }}
              >
                <Icone
                  type={element.icone}
                  active={actif}
                />
              </span>

              <span
                style={{
                  fontSize: '13px',
                  color: actif
                    ? '#344D66'
                    : '#738DA9',
                  fontWeight: actif ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {element.libelle}
              </span>
            </button>
          )
        })}
      </div>

      {/* Déconnexion */}
      <div
        style={{
          marginTop: 'auto',
          padding: '0 12px 20px 12px',
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (onDeconnexion) {
              onDeconnexion()
            }
          }}
          style={{
            width: '100%',
            height: '40px',
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 12px',
            cursor: 'pointer',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              width: '17px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '11px',
              flexShrink: 0,
            }}
          >
            <Icone type="deconnexion" />
          </span>

          <span
            style={{
              fontSize: '13px',
              color: '#738DA9',
              whiteSpace: 'nowrap',
            }}
          >
            Déconnexion
          </span>
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar