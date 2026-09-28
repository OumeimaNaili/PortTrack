function Icone({ type, active = false }) {
  const couleur = active ? '#0F2942' : '#8FA6BF'

  const icones = {
    suiviDechargement: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <path d="M3 18h18" />
        <path d="M5 18V9l7-5 7 5v9" />
        <path d="M9 18v-5h6v5" />
      </svg>
    ),

    fichesJournalieres: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <path d="M6 3h9l3 3v15H6V3Z" />
        <path d="M14 3v4h4" />
        <path d="M9 11h6" />
        <path d="M9 15h6" />
        <path d="M9 19h4" />
      </svg>
    ),

    historique: (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke={couleur}
        strokeWidth="1.8"
      >
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 5v5h5" />
        <path d="M12 7v5l3 2" />
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
        stroke="#8FA6BF"
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

function ChefMagasinierSidebar({
  pageActive = 'tableauDeBord',
  onNavigate,
  onDeconnexion,
}) {
  const elementsMenu = [
    {
      id: 'suiviDechargement',
      libelle: 'Suivi du déchargement',
      icone: 'suiviDechargement',
    },
    {
      id: 'fichesJournalieres',
      libelle: 'Fiche journalière',
      icone: 'fichesJournalieres',
    },
    {
      id: 'historique',
      libelle: 'Historique des saisies',
      icone: 'historique',
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
      className="cms-sidebar"
      style={{
        width: '220px',
        minWidth: '220px',
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #123350 0%, #0F2942 55%, #0B2036 100%)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 12px rgba(0,20,40,0.18)',
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
          borderBottom: '1px solid rgba(255,255,255,0.06)',
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
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#5E7A96',
            padding: '0 12px',
            marginBottom: '10px',
          }}
        >
          Menu
        </div>

        {elementsMenu.map((element) => {
          const actif = pageActive === element.id

          return (
            <button
              key={element.id}
              type="button"
              className={
                actif
                  ? 'cms-menu-btn cms-menu-btn-actif'
                  : 'cms-menu-btn'
              }
              onClick={() => {
                if (onNavigate) {
                  onNavigate(element.id)
                }
              }}
              style={{
                width: '100%',
                height: '42px',
                border: 'none',
                borderRadius: '8px',
                background: actif
                  ? 'linear-gradient(135deg, #D6E7FE 0%, #C8DFFE 100%)'
                  : 'transparent',
                boxShadow: actif
                  ? '0 2px 8px rgba(0,0,0,0.18)'
                  : 'none',
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
                    ? '#0F2942'
                    : '#A9BCD1',
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
          padding: '16px 12px 20px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          type="button"
          className="cms-logout-btn"
          onClick={() => {
            if (onDeconnexion) {
              onDeconnexion()
            }
          }}
          style={{
            width: '100%',
            height: '42px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.03)',
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
              color: '#A9BCD1',
              whiteSpace: 'nowrap',
            }}
          >
            Déconnexion
          </span>
        </button>
      </div>

      <style>{`
        .cms-menu-btn {
          transition: background 0.15s ease, transform 0.15s ease;
        }

        .cms-menu-btn:not(.cms-menu-btn-actif):hover {
          background: rgba(255,255,255,0.07) !important;
          transform: translateX(2px);
        }

        .cms-logout-btn {
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .cms-logout-btn:hover {
          background: rgba(220,38,38,0.12) !important;
          border-color: rgba(248,113,113,0.35) !important;
        }
      `}</style>
    </aside>
  )
}

export default ChefMagasinierSidebar