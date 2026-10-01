import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmationDeconnexion from '../../components/ConfirmationDeconnexion'

const COULEURS_AVATAR = [
  { bg: '#0F2942', texte: '#FFFFFF' },
  { bg: '#4A607A', texte: '#FFFFFF' },
  { bg: '#C8DFFE', texte: '#1F3A56' },
  { bg: '#E0E3E5', texte: '#3A4650' },
]

const COULEURS_PROFIL = {
  'Responsable des statistiques': {
    texte: '#1764B0',
    fond: '#E6F0FC',
    bordure: '1px solid #D5E5F7',
  },
  'Responsable des Opérations': {
    texte: '#B4650B',
    fond: '#FDF1E3',
    bordure: '1px solid #F5DEBF',
  },
  'Chef Magasinier': {
    texte: '#7A4FA3',
    fond: '#F4EEFA',
    bordure: '1px solid #E2D4EF',
  },
  Directeur: {
    texte: '#FFFFFF',
    fond: '#17364F',
    bordure: 'none',
  },
  Administrateur: {
    texte: '#D63C3C',
    fond: '#FDECEC',
    bordure: '1px solid #F5D0D0',
  },
}

function AdminDashboard({
  onNavigate,
  onModifier,
  onDeconnexion,
  deconnexionDemandee,
  onAnnulerDeconnexion,
  onConfirmerDeconnexion,
}) {
  const [utilisateurs, setUtilisateurs] = useState([])
  const [nombreUtilisateurs, setNombreUtilisateurs] = useState(0)
  const [nombreNavires, setNombreNavires] = useState(0)
  const [nombreProduits, setNombreProduits] = useState(0)
  const [nombreComptesActifs, setNombreComptesActifs] = useState(0)

  useEffect(() => {
    const chargerDashboard = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/dashboard/`,
          {
            method: 'GET',
          }
        )

        const data = await response.json()

        if (!response.ok) {
          console.error(
            'Erreur dashboard :',
            data
          )

          return
        }

        setNombreUtilisateurs(
          data.nombre_utilisateurs
        )

        setNombreNavires(
          data.nombre_navires
        )

        setNombreProduits(
          data.nombre_produits
        )

        setNombreComptesActifs(
          data.nombre_comptes_actifs
        )

        setUtilisateurs(
          data.utilisateurs
        )
      } catch (error) {
        console.error(
          'Erreur de connexion au dashboard :',
          error
        )
      }
    }

    chargerDashboard()
  }, [])

  const cartes = [
    {
      label: 'Utilisateurs',
      valeur: nombreUtilisateurs,
      suffixe: null,
      sousTexte: `${nombreUtilisateurs} comptes enregistrés`,
      iconBg: '#EEF4FA',
      icone: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#17364F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: 'Navires',
      valeur: nombreNavires,
      suffixe: null,
      sousTexte: `${nombreNavires} navires enregistrés`,
      iconBg: '#EEF4FA',
      icone: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#17364F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 18l2 2h14l2-2" />
          <path d="M5 18l1.5-7h11L19 18" />
          <path d="M8 11V7h8v4" />
          <path d="M10 7V4h4v3" />
        </svg>
      ),
    },
    {
      label: 'Produits',
      valeur: nombreProduits,
      suffixe: null,
      sousTexte: `${nombreProduits} produits enregistrés`,
      iconBg: '#EEF4FA',
      icone: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#17364F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      label: 'Comptes actifs',
      valeur: nombreComptesActifs,
      suffixe: null,
      sousTexte: `${nombreComptesActifs} comptes actifs`,
      iconBg: '#E9F8F1',
      icone: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#21A36A"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <AdminLayout
        pageActive="tableauDeBord"
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
          {/* Bienvenue */}
          <section
            style={{
              marginBottom: '26px',
            }}
          >
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#172F43',
                lineHeight: 1.2,
                margin: 0,
                letterSpacing: '-0.6px',
              }}
            >
              Bienvenue dans votre espace d’administration
            </h1>

            <p
              style={{
                fontSize: '12px',
                fontWeight: 400,
                color: '#71808D',
                margin: '7px 0 0',
                lineHeight: 1.5,
              }}
            >
              Gérez les utilisateurs, les navires et les produits de PortTrack.
            </p>
          </section>

          {/* Cartes statistiques */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '14px',
              marginBottom: '22px',
            }}
          >
            {cartes.map((carte) => (
              <div
                key={carte.label}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8EE',
                  borderRadius: '8px',
                  padding: '17px 18px',
                  minHeight: '105px',
                  boxSizing: 'border-box',
                  boxShadow: '0 2px 7px rgba(15, 41, 66, 0.04)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.45px',
                      color: '#667784',
                    }}
                  >
                    {carte.label}
                  </span>

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: carte.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {carte.icone}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    marginTop: '11px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: 700,
                      color: '#19344A',
                      lineHeight: 1,
                      letterSpacing: '-0.5px',
                    }}
                  >
                    {carte.valeur}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '10px',
                    color: '#8997A2',
                    marginTop: '6px',
                  }}
                >
                  {carte.sousTexte}
                </div>
              </div>
            ))}
          </section>

          {/* Tableau des utilisateurs */}
          <section
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E1E7EC',
              borderRadius: '8px',
              overflow: 'hidden',
              width: '100%',
              boxShadow: '0 2px 8px rgba(15, 41, 66, 0.035)',
            }}
          >
            {/* En-tête */}
            <div
              style={{
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#19344A',
                    margin: 0,
                    letterSpacing: '-0.15px',
                  }}
                >
                  Comptes utilisateurs
                </h2>

                <p
                  style={{
                    fontSize: '10px',
                    color: '#7C8A95',
                    margin: '5px 0 0',
                  }}
                >
                  Aperçu des utilisateurs du système PortTrack
                </p>
              </div>
            </div>

            {/* En-têtes des colonnes */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '2.3fr 1fr 1.65fr 0.9fr',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E8EDF1',
                borderBottom: '1px solid #E8EDF1',
                padding: '10px 20px',
                minHeight: '38px',
                boxSizing: 'border-box',
              }}
            >
              {[
                'Nom & prénom',
                'Identifiant',
                'Profil',
                'Statut',
              ].map((titre) => (
                <span
                  key={titre}
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    color: '#71808D',
                  }}
                >
                  {titre}
                </span>
              ))}
            </div>

            {/* Lignes */}
            {utilisateurs.map((utilisateur, index) => {
              const couleurAvatar =
                COULEURS_AVATAR[index % COULEURS_AVATAR.length]

              const profil =
                utilisateur.profil ===
                'Responsable des Statistiques'
                  ? 'Responsable des statistiques'
                  : utilisateur.profil

              return (
                <div
                  key={utilisateur.identifiant}
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '2.3fr 1fr 1.65fr 0.9fr',
                    alignItems: 'center',
                    padding: '13px 20px',
                    minHeight: '66px',
                    borderBottom:
                      index === utilisateurs.length - 1
                        ? 'none'
                        : '1px solid #EEF1F3',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Nom */}
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
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: couleurAvatar.bg,
                        color: couleurAvatar.texte,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 700,
                        marginRight: '11px',
                        flexShrink: 0,
                      }}
                    >
                      {utilisateur.initiales}
                    </div>

                    <div
                      style={{
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#263D4E',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {utilisateur.nom}
                      </div>

                      <div
                        style={{
                          fontSize: '9px',
                          color: '#8997A2',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '3px',
                        }}
                      >
                        {utilisateur.email}
                      </div>
                    </div>
                  </div>

                  {/* Identifiant */}
                  <span>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '9px',
                        fontWeight: 500,
                        color: '#627586',
                        backgroundColor: '#F0F3F6',
                        border: '1px solid #E5E9ED',
                        borderRadius: '5px',
                        padding: '4px 7px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {utilisateur.identifiant}
                    </span>
                  </span>

                  {/* Profil */}
                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '9px',
                        fontWeight: 500,
                        color:
                          COULEURS_PROFIL[profil]?.texte ??
                          '#526573',
                        backgroundColor:
                          COULEURS_PROFIL[profil]?.fond ??
                          '#F0F3F6',
                        border:
                          COULEURS_PROFIL[profil]?.bordure ??
                          '1px solid #E5E9ED',
                        borderRadius: '3px',
                        padding: '5px 8px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {utilisateur.profil}
                    </span>
                  </div>

                  {/* Statut */}
                  <div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        backgroundColor: '#EAF8F2',
                        color: '#16945E',
                        border: '1px solid #D8F1E6',
                        borderRadius: '10px',
                        padding: '4px 9px',
                        fontSize: '9px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          backgroundColor: '#20B878',
                        }}
                      />

                      {utilisateur.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              )
            })}
          </section>
        </div>
      </AdminLayout>

      {deconnexionDemandee && (
        <ConfirmationDeconnexion
          onCancel={onAnnulerDeconnexion}
          onConfirm={onConfirmerDeconnexion}
        />
      )}
    </>
  )
}

export default AdminDashboard

