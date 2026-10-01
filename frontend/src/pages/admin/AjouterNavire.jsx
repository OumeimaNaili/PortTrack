import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

function IconeRetour() {
  return (
    <svg
      width="14px"
      height="14px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#526C84"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconeIdentification() {
  return (
    <svg
      width="13px"
      height="13px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#526C84"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24L3 3v6.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.59z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </svg>
  )
}

function IconeNavire() {
  return (
    <svg
      width="14px"
      height="14px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8997A2"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18l2 2h14l-2-2" />
      <path d="M5 18l1.5-7h11L19 18" />
      <path d="M8 11V7h8v4" />
      <path d="M10 7V4h4v3" />
    </svg>
  )
}

function IconeNumero() {
  return (
    <svg
      width="13px"
      height="13px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8997A2"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  )
}

function AjouterNavire({ onNavigate, onDeconnexion }) {
  const [nomNavire, setNomNavire] = useState('')
  const [numeroNavire, setNumeroNavire] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [navireCree, setNavireCree] = useState(false)
  const [numeroCree, setNumeroCree] = useState('')

  useEffect(() => {
    const genererNumeroNavire = async () => {
      if (!nomNavire.trim()) {
        setNumeroNavire('')
        return
      }

      try {
        const token = sessionStorage.getItem('token')

        const response = await fetch(
          '${import.meta.env.VITE_API_URL}/navires/',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Impossible de récupérer les navires.')
        }

        const data = await response.json()

        const navires = Array.isArray(data)
          ? data
          : data.results || []

        const nomFormate = nomNavire
          .trim()
          .replace(/\s+/g, '-')

        const numerosExistants = navires
          .map((navire) => {
            const match = navire.numero_navire?.match(/-(\d+)$/)
            return match ? parseInt(match[1], 10) : null
          })
          .filter((numero) => numero !== null)

        let numero = 1

        while (numerosExistants.includes(numero)) {
          numero++
        }

        setNumeroNavire(
          `${nomFormate}-${String(numero).padStart(5, '0')}`
        )
      } catch (error) {
        console.error(
          'Erreur lors de la génération du numéro du navire :',
          error
        )

        setNumeroNavire('')
        setMessage(
          'Impossible de générer automatiquement le numéro du navire.'
        )
        setMessageType('error')
      }
    }

    genererNumeroNavire()
  }, [nomNavire])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setMessageType('')

    const token = sessionStorage.getItem('token')

    try {
      const response = await fetch(
        '${import.meta.env.VITE_API_URL}/navires/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            nom_navire: nomNavire,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        let messageErreur =
          "Une erreur est survenue lors de la création du navire."

        if (data.detail) {
          messageErreur = data.detail
        } else if (data.nom_navire) {
          messageErreur = `Nom du navire : ${
            Array.isArray(data.nom_navire)
              ? data.nom_navire.join(' ')
              : data.nom_navire
          }`
        }

        setMessage(messageErreur)
        setMessageType('error')
        return
      }

      setNumeroNavire(data.numero_navire)
      setNumeroCree(data.numero_navire)
      setNavireCree(true)
    } catch (error) {
      setMessage(
        'Une erreur est survenue lors de la création du navire.'
      )
      setMessageType('error')
    }
  }

  return (
    <AdminLayout
      pageActive="navires"
      nomAdministrateur="Nom admin"
      onNavigate={onNavigate}
      onDeconnexion={onDeconnexion}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1120px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate('navires')
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: 'none',
            background: 'none',
            padding: 0,
            fontSize: '12px',
            color: '#526C84',
            cursor: 'pointer',
            marginBottom: '18px',
          }}
        >
          <IconeRetour />
          Retour à la gestion des navires
        </button>

        <div
          style={{
            marginBottom: '26px',
          }}
        >
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#171D22',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
            }}
          >
            Ajouter un navire
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: '#7189A1',
              margin: '6px 0 0',
            }}
          >
            Enregistrez un nouveau navire dans le registre de la plateforme PortTrack.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: '900px',
            backgroundColor: '#FFFFFF',
            borderRadius: '7px',
            padding: '30px 34px',
            boxSizing: 'border-box',
            boxShadow: '0 1px 5px rgba(15, 41, 66, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              marginBottom: '18px',
            }}
          >
            <IconeIdentification />

            <span
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#263D4E',
              }}
            >
              Identification du navire
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '18px',
              marginBottom: '26px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '7px',
                }}
              >
                Nom du navire <span style={{ color: '#D63C3C' }}>*</span>
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#F0F2F4',
                }}
              >
                <span
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 11px',
                  }}
                >
                  <IconeNavire />
                </span>

                <input
                  type="text"
                  value={nomNavire}
                  onChange={(e) => setNomNavire(e.target.value)}
                  placeholder="Saisir le nom du navire..."
                  required
                  style={{
                    flex: 1,
                    height: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '0 12px 0 0',
                    fontSize: '11px',
                    color: '#374957',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '7px',
                }}
              >
                Numéro du navire
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  height: '40px',
                  backgroundColor: '#F0F2F4',
                }}
              >
                <span
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 11px',
                  }}
                >
                  <IconeNumero />
                </span>

                <input
                  type="text"
                  value={numeroNavire}
                  readOnly
                  placeholder="Génération automatique..."
                  style={{
                    flex: 1,
                    height: '100%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '0 12px 0 0',
                    fontSize: '11px',
                    color: '#374957',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: '9px',
                  color: '#8997A2',
                  margin: '7px 0 0',
                }}
              >
                Numéro généré automatiquement et attribué de manière unique.
              </p>
            </div>
          </div>

          {message && (
            <div
              style={{
                marginBottom: '20px',
                padding: '11px 14px',
                borderRadius: '4px',
                backgroundColor: '#FDECEC',
                color: '#B83232',
                border: '1px solid #F3CACA',
                fontSize: '10px',
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('navires')
                }
              }}
              style={{
                height: '34px',
                border: 'none',
                backgroundColor: '#F0F2F4',
                color: '#526C84',
                padding: '0 14px',
                fontSize: '9px',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '34px',
                border: 'none',
                borderRadius: '2px',
                backgroundColor: '#0F2942',
                color: '#FFFFFF',
                padding: '0 18px',
                fontSize: '9px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {navireCree && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 41, 66, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: '360px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px 30px',
              boxSizing: 'border-box',
              boxShadow: '0 8px 30px rgba(15, 41, 66, 0.18)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#EAF6EE',
                color: '#267A45',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              ✓
            </div>

            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '17px',
                fontWeight: 700,
                color: '#171D22',
              }}
            >
              Navire créé avec succès
            </h2>

            <p
              style={{
                margin: '0 0 22px',
                fontSize: '10px',
                color: '#526C84',
                lineHeight: 1.5,
              }}
            >
              Le navire a été ajouté avec succès.
              <br />
              Numéro : {numeroCree}
            </p>

            <button
              type="button"
              onClick={() => {
                setNavireCree(false)

                if (onNavigate) {
                  onNavigate('navires')
                }
              }}
              style={{
                height: '34px',
                border: 'none',
                borderRadius: '3px',
                backgroundColor: '#0F2942',
                color: '#FFFFFF',
                padding: '0 24px',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AjouterNavire