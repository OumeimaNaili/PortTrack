import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

function IconeNavire() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#344D66"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18l2 2h14l2-2" />
      <path d="M5 18l1.5-7h11L19 18" />
      <path d="M8 11V7h8v4" />
      <path d="M10 7V4h4v3" />
    </svg>
  )
}

function IconeRecherche() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5F7388"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  )
}

function IconePlus() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )
}

function IconeConsulter() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#536879"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconeSupprimer() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D63C3C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function GestionNavires({
  onNavigate,
  onModifierNavire,
  onSupprimerNavire,
  actualisation,
  onDeconnexion,
}) {
  const [recherche, setRecherche] = useState('')
  const [navires, setNavires] = useState([])

  useEffect(() => {
    const chargerNavires = async () => {
      try {
        const token = sessionStorage.getItem('token')

        const url =
          recherche.trim() === ''
            ? 'http://127.0.0.1:8000/api/navires/'
            : `http://127.0.0.1:8000/api/navires/?search=${encodeURIComponent(
                recherche.trim()
              )}`

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Token ${token}`,
          },
        })

        const data = await response.json()

        if (!response.ok) {
          console.error(
            'Erreur lors du chargement des navires :',
            data
          )
          return
        }

        setNavires(data)
      } catch (error) {
        console.error(
          'Erreur de connexion au serveur :',
          error
        )
      }
    }

    chargerNavires()
  }, [recherche, actualisation])

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
        {/* En-tête de la page */}
        <section
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '20px',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#172F43',
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: '-0.4px',
              }}
            >
              Gestion des navires
            </h1>

            <p
              style={{
                fontSize: '13px',
                fontWeight: 400,
                color: '#7189A1',
                margin: '7px 0 0',
                lineHeight: 1.4,
                maxWidth: '500px',
              }}
            >
              Consultez et administrez le registre des navires enregistrés dans PortTrack.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('ajouterNavire')
              }
            }}
            style={{
              height: '38px',
              backgroundColor: '#0F2942',
              border: 'none',
              borderRadius: '4px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '0 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(15, 41, 66, 0.12)',
              whiteSpace: 'nowrap',
            }}
          >
            <IconePlus />
            Ajouter un navire
          </button>
        </section>

        {/* Tableau */}
        <section
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5EBF1',
            borderRadius: '7px',
            overflow: 'hidden',
            width: '100%',
            boxShadow: '0 2px 8px rgba(15, 41, 66, 0.035)',
          }}
        >
          {/* Barre de recherche */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              padding: '14px 16px',
              borderBottom: '1px solid #E8EDF2',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* Recherche */}
            <div
              style={{
                position: 'relative',
                width: '375px',
                height: '36px',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                <IconeRecherche />
              </span>

              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher..."
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid #E3E9EF',
                  borderRadius: '3px',
                  backgroundColor: '#F5F7FA',
                  paddingLeft: '38px',
                  paddingRight: '10px',
                  fontSize: '11px',
                  color: '#536879',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Nombre de navires */}
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '11px',
                color: '#7890A7',
                marginLeft: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {navires.length} navires affichés
            </span>
          </div>

          {/* En-têtes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 170px 170px',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#F5F7FA',
              borderBottom: '1px solid #E5EBF0',
              padding: '11px 16px',
              minHeight: '42px',
              boxSizing: 'border-box',
            }}
          >
            {[
              'Nom du navire',
              'Numéro du navire',
              'Actions',
            ].map((titre, i) => (
              <span
                key={titre}
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.35px',
                  color: '#526C84',
                  textAlign: i === 1 ? 'center' : 'left',
                }}
              >
                {titre}
              </span>
            ))}
          </div>

          {/* Navires */}
          {navires.length > 0 ? (
            navires.map((navire, index) => (
              <div
                key={navire.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 170px 170px',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 16px',
                  minHeight: '59px',
                  borderBottom:
                    index === navires.length - 1
                      ? 'none'
                      : '1px solid #EDF1F4',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Nom du navire */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                    paddingRight: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '5px',
                      backgroundColor: '#EEF2F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconeNavire />
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      marginLeft: '10px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#263D4E',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {navire.nom_navire}
                    </div>
                  </div>
                </div>

                {/* Numéro du navire */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#344D66',
                      backgroundColor: '#F0F3F6',
                      border: '1px solid #E5E9ED',
                      borderRadius: '3px',
                      padding: '3px 7px',
                      whiteSpace: 'nowrap',
                      textAlign: 'center',
                    }}
                  >
                    {navire.numero_navire}
                  </span>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (onModifierNavire) {
                        onModifierNavire(navire)
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      fontSize: '10px',
                      color: '#536879',
                      cursor: 'pointer',
                    }}
                  >
                    <IconeConsulter />
                    Consulter
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSupprimerNavire) {
                        onSupprimerNavire(navire)
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      fontSize: '10px',
                      color: '#D63C3C',
                      cursor: 'pointer',
                    }}
                  >
                    <IconeSupprimer />
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#8997A2',
              }}
            >
              Aucun navire trouvé.
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

export default GestionNavires