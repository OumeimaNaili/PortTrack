import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

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

function IconeUtilisateur({ initiales, index }) {
  const couleurAvatar =
    COULEURS_AVATAR[index % COULEURS_AVATAR.length]

  return (
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
      {initiales}
    </div>
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
      stroke="#263D4E"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconeModifier() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
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

function GestionUtilisateurs({
  onNavigate,
  onConsulter,
  onModifier,
  onSupprimer,
  actualisation,
  onDeconnexion,
}) {
  const [recherche, setRecherche] = useState('')
  const [utilisateurs, setUtilisateurs] = useState([])

  useEffect(() => {
    const chargerUtilisateurs = async () => {
      try {
        const token = sessionStorage.getItem('token')

        const url =
          recherche.trim() === ''
            ? 'http://127.0.0.1:8000/api/utilisateurs/'
            : `http://127.0.0.1:8000/api/utilisateurs/?search=${encodeURIComponent(
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
            'Erreur lors du chargement des utilisateurs :',
            data
          )
          return
        }

        const utilisateursFormates = data.map((utilisateur) => {
          const nomComplet = `${utilisateur.prenom} ${utilisateur.nom}`

          const initiales =
            `${utilisateur.prenom?.charAt(0) ?? ''}${utilisateur.nom?.charAt(0) ?? ''}`.toUpperCase()

          return {
            id: utilisateur.id,
            initiales,
            nom: nomComplet,
            email: utilisateur.email,
            identifiant: utilisateur.identifiant,
            profil: utilisateur.profil_nom,
            profilId: utilisateur.profil,
            statut: utilisateur.actif ? 'Actif' : 'Inactif',
          }
        })

        setUtilisateurs(utilisateursFormates)
      } catch (error) {
        console.error(
          'Erreur de connexion au serveur :',
          error
        )
      }
    }

    chargerUtilisateurs()

    const actualiserApresSuppression = () => {
      chargerUtilisateurs()
    }

    window.addEventListener(
      'utilisateurSupprime',
      actualiserApresSuppression
    )

    return () => {
      window.removeEventListener(
        'utilisateurSupprime',
        actualiserApresSuppression
      )
    }
  }, [actualisation, recherche])

  return (
    <AdminLayout
      pageActive="utilisateurs"
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
              Gestion des utilisateurs
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
              Gérez les comptes et les profils des utilisateurs de PortTrack.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('ajouterUtilisateur')
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
            Ajouter un utilisateur
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
                placeholder="Rechercher un utilisateur"
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

            <span
              style={{
                fontSize: '11px',
                color: '#7890A7',
                marginLeft: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {utilisateurs.length} comptes utilisateurs enregistrés
            </span>
          </div>

          {/* En-têtes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '2.4fr 0.9fr 1.65fr 0.85fr 1.55fr',
              alignItems: 'center',
              backgroundColor: '#F5F7FA',
              borderBottom: '1px solid #E5EBF0',
              padding: '11px 16px',
              minHeight: '42px',
              boxSizing: 'border-box',
            }}
          >
            {[
              'Nom & prénom',
              'Identifiant',
              'Profil',
              'Statut du compte',
              'Actions',
            ].map((titre) => (
              <span
                key={titre}
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.35px',
                  color: '#526C84',
                }}
              >
                {titre}
              </span>
            ))}
          </div>

          {/* Utilisateurs */}
          {utilisateurs.length > 0 ? (
            utilisateurs.map((utilisateur, index) => (
              <div
                key={utilisateur.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '2.4fr 0.9fr 1.65fr 0.85fr 1.55fr',
                  alignItems: 'center',
                  padding: '10px 16px',
                  minHeight: '59px',
                  borderBottom:
                    index === utilisateurs.length - 1
                      ? 'none'
                      : '1px solid #EDF1F4',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Nom & prénom */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0,
                    paddingRight: '12px',
                  }}
                >
                  <IconeUtilisateur
                    initiales={utilisateur.initiales}
                    index={index}
                  />

                  <div
                    style={{
                      minWidth: 0,
                      marginLeft: '0px',
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
                      {utilisateur.nom}
                    </div>

                    <div
                      style={{
                        fontSize: '9px',
                        color: '#7D91A3',
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
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#344D66',
                    whiteSpace: 'nowrap',
                  }}
                >
                  #{utilisateur.identifiant}
                </span>

                {/* Profil */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '9px',
                      fontWeight: 500,
                      color:
                        COULEURS_PROFIL[
                          utilisateur.profil ===
                          'Responsable des Statistiques'
                            ? 'Responsable des statistiques'
                            : utilisateur.profil
                        ]?.texte ?? '#526573',
                      backgroundColor:
                        COULEURS_PROFIL[
                          utilisateur.profil ===
                          'Responsable des Statistiques'
                            ? 'Responsable des statistiques'
                            : utilisateur.profil
                        ]?.fond ?? '#F0F3F6',
                      border:
                        COULEURS_PROFIL[
                          utilisateur.profil ===
                          'Responsable des Statistiques'
                            ? 'Responsable des statistiques'
                            : utilisateur.profil
                        ]?.bordure ?? '1px solid #E5E9ED',
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
                      gap: '6px',
                      backgroundColor: '#EAF8F2',
                      color: '#16945E',
                      border: '1px solid #D8F1E6',
                      borderRadius: '10px',
                      padding: '5px 9px',
                      fontSize: '9px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#20B878',
                      }}
                    />

                    {utilisateur.statut}
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
                      if (onConsulter) {
                        onConsulter(utilisateur)
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
                      color: '#263D4E',
                      cursor: 'pointer',
                    }}
                  >
                    <IconeConsulter />
                    Consulter
                  </button>

                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (onModifier) {
                          onModifier(utilisateur)
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
                      <IconeModifier />
                      Modifier
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSupprimer) {
                          onSupprimer(utilisateur)
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
                  </>
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
              Aucun utilisateur trouvé.
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

export default GestionUtilisateurs