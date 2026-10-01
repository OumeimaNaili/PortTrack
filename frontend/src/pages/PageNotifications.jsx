import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function PageNotifications({ onNotificationClick }) {
  const [notifications, setNotifications] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [notificationASupprimer, setNotificationASupprimer] =
    useState(null)
  const [suppressionEnCours, setSuppressionEnCours] =
    useState(false)

  const chargerNotifications = async () => {
    const token = sessionStorage.getItem('token')

    if (!token) {
      setErreur('Aucun token de connexion trouvé.')
      setChargement(false)
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
        setErreur('Impossible de charger les notifications.')
        setChargement(false)
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

      setErreur('')
    } catch (error) {
      setErreur('Erreur de connexion au serveur.')
    } finally {
      setChargement(false)
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

  const marquerCommeLue = async (notification) => {
    const token = sessionStorage.getItem('token')

    if (!token || notification.lue) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/notifications/${notification.id}/lire/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        return
      }

      setNotifications((actuelles) =>
        actuelles.map((item) =>
          item.id === notification.id
            ? { ...item, lue: true }
            : item
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const ouvrirNotification = async (notification) => {
    await marquerCommeLue(notification)

    if (onNotificationClick) {
      onNotificationClick(notification)
    }
  }

  const demanderSuppression = (event, notification) => {
    event.stopPropagation()
    setNotificationASupprimer(notification)
  }

  const annulerSuppression = () => {
    if (suppressionEnCours) {
      return
    }

    setNotificationASupprimer(null)
  }

  const supprimerNotification = async () => {
    if (!notificationASupprimer) {
      return
    }

    const token = sessionStorage.getItem('token')

    if (!token) {
      setErreur('Aucun token de connexion trouvé.')
      return
    }

    setSuppressionEnCours(true)
    setErreur('')

    try {
      const response = await fetch(
        `${API_URL}/notifications/${notificationASupprimer.id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        let data = {}

        try {
          data = await response.json()
        } catch (error) {
          console.error(
            'Impossible de lire la réponse du serveur :',
            error
          )
        }

        setErreur(
          data.detail ||
            'Impossible de supprimer la notification.'
        )

        return
      }

      setNotifications((actuelles) =>
        actuelles.filter(
          (notification) =>
            notification.id !== notificationASupprimer.id
        )
      )

      setNotificationASupprimer(null)
    } catch (error) {
      console.error(
        'Erreur lors de la suppression de la notification :',
        error
      )

      setErreur(
        'Erreur de connexion au serveur.'
      )
    } finally {
      setSuppressionEnCours(false)
    }
  }

  const formaterDate = (date) => {
    if (!date) {
      return ''
    }

    const dateObj = new Date(date)

    if (Number.isNaN(dateObj.getTime())) {
      return ''
    }

    return dateObj.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const nombreNonLues = notifications.filter(
    (notification) => !notification.lue
  ).length

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
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
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#101828',
              margin: '0 0 6px 0',
            }}
          >
            Notifications
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#667085',
              margin: 0,
            }}
          >
            Toutes vos notifications, lues et non lues.
          </p>
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            background:
              nombreNonLues > 0
                ? '#FEF3F2'
                : '#ECFDF3',
            color:
              nombreNonLues > 0
                ? '#B42318'
                : '#027A48',
          }}
        >
          {nombreNonLues} non lue
          {nombreNonLues > 1 ? 's' : ''}
        </div>
      </div>

      {erreur && (
        <div
          style={{
            background: '#FDECEC',
            border: '1px solid #F5C2C0',
            color: '#B42318',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
          }}
        >
          {erreur}
        </div>
      )}

      {chargement ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#667085',
          }}
        >
          Chargement des notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '40px',
            textAlign: 'center',
            color: '#667085',
          }}
        >
          Aucune notification.
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                width: '100%',
                background:
                  notification.lue
                    ? '#FFFFFF'
                    : '#F5F8FC',
                border: '1px solid #E5E7EB',
                borderLeft:
                  notification.lue
                    ? '5px solid #D0D5DD'
                    : '5px solid #E4483F',
                borderRadius: '14px',
                padding: '16px 22px',
                boxShadow:
                  '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  ouvrirNotification(notification)
                }
                style={{
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '16px',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight:
                        notification.lue
                          ? 600
                          : 700,
                      color: '#101828',
                    }}
                  >
                    {notification.titre}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      whiteSpace: 'nowrap',
                      background:
                        notification.lue
                          ? '#F2F4F7'
                          : '#FEF3F2',
                      color:
                        notification.lue
                          ? '#667085'
                          : '#B42318',
                    }}
                  >
                    {notification.lue
                      ? 'Lue'
                      : 'Non lue'}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: '#667085',
                  }}
                >
                  {notification.message}
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: '#98A2B3',
                    marginTop: '8px',
                  }}
                >
                  {formaterDate(
                    notification.date_creation
                  )}
                </div>
              </button>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginTop: '12px',
                  paddingTop: '10px',
                  borderTop: '1px solid #EEF0F2',
                }}
              >
                <button
                  type="button"
                  onClick={(event) =>
                    demanderSuppression(
                      event,
                      notification
                    )
                  }
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#B42318',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '5px 8px',
                    borderRadius: '5px',
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {notificationASupprimer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div
            style={{
              width: '360px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '24px',
              boxShadow:
                '0 8px 30px rgba(0, 0, 0, 0.15)',
            }}
          >
            <h2
              style={{
                margin: '0 0 10px',
                fontSize: '18px',
                color: '#172F43',
              }}
            >
              Supprimer la notification
            </h2>

            <p
              style={{
                margin: '0 0 22px',
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#6A7C92',
              }}
            >
              Voulez-vous vraiment supprimer cette
              notification ?
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={annulerSuppression}
                disabled={suppressionEnCours}
                style={{
                  padding: '9px 16px',
                  border: '1px solid #D9E1E8',
                  borderRadius: '5px',
                  backgroundColor: '#FFFFFF',
                  color: '#5F7388',
                  cursor: suppressionEnCours
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={supprimerNotification}
                disabled={suppressionEnCours}
                style={{
                  padding: '9px 16px',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: '#B42318',
                  color: '#FFFFFF',
                  cursor: suppressionEnCours
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                {suppressionEnCours
                  ? 'Suppression...'
                  : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PageNotifications