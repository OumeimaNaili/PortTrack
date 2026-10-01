import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function IconeNotification() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}

function ChefMagasinierHeader({
  nom = 'Naili',
  prenom = 'Oumeima',
  initiales = 'ON',
  onNavigate,
}) {
  const [notifications, setNotifications] = useState([])

  const chargerNotifications = async () => {
    const token = sessionStorage.getItem('token')

    if (!token) {
      console.error('Aucun token trouvé pour charger les notifications.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/notifications/`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error(
          `Erreur notifications Chef Magasinier : ${response.status} ${response.statusText}`
        )
        return
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        setNotifications(data)
      } else if (Array.isArray(data.results)) {
        setNotifications(data.results)
      } else {
        setNotifications([])
      }
    } catch (error) {
      console.error(
        'Erreur lors du chargement des notifications :',
        error
      )
    }
  }

  useEffect(() => {
    chargerNotifications()

    const interval = setInterval(() => {
      chargerNotifications()
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const ouvrirPageNotifications = () => {
    if (onNavigate) {
      onNavigate('notifications')
    }
  }

  const nombreNonLues = notifications.filter(
    (notification) => !notification.lue
  ).length

  return (
    <header
      style={{
        height: '64px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E9EDF1',
        boxShadow: '0 1px 3px rgba(15, 41, 66, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        flexShrink: 0,
        boxSizing: 'border-box',
        gap: '20px',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {/* Notification */}
        <div
          style={{
            position: 'relative',
          }}
        >
          <button
            type="button"
            className="hdr-notif-btn"
            onClick={ouvrirPageNotifications}
            style={{
              border: 'none',
              background: '#F5F7FA',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              marginRight: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              color: '#6B7075',
            }}
          >
            <IconeNotification />

            {nombreNonLues > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 3px',
                  boxSizing: 'border-box',
                  borderRadius: '999px',
                  background: '#E4483F',
                  border: '1.5px solid #FFFFFF',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {nombreNonLues > 99 ? '99+' : nombreNonLues}
              </span>
            )}
          </button>
        </div>

        {/* Séparateur */}
        <div
          style={{
            width: '1px',
            height: '28px',
            backgroundColor: '#E2E5EA',
            marginRight: '16px',
          }}
        />

        {/* Nom et prénom */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '14px',
            lineHeight: '1.2',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#101828',
              whiteSpace: 'nowrap',
            }}
          >
            {prenom} {nom}
          </span>

          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#344D66',
              whiteSpace: 'nowrap',
              marginTop: '4px',
              letterSpacing: '0.06em',
              background: '#EEF3F9',
              padding: '3px 9px',
              borderRadius: '999px',
            }}
          >
            CHEF MAGASINIER
          </span>
        </div>

        {/* Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
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
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            {initiales}
          </span>
        </div>
      </div>

      <style>{`
        .hdr-notif-btn {
          transition: background 0.15s ease, color 0.15s ease;
        }

        .hdr-notif-btn:hover {
          background: #E9EEF5 !important;
          color: #344D66 !important;
        }
      `}</style>
    </header>
  )
}

export default ChefMagasinierHeader