import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

function IconeProduit() {
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
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

function GestionProduits({
  onNavigate,
  onModifierProduit,
  onSupprimerProduit,
  actualisation,
  onDeconnexion,
}) {
  const [recherche, setRecherche] = useState('')
  const [produits, setProduits] = useState([])

  useEffect(() => {
    const chargerProduits = async () => {
      try {
        const token = sessionStorage.getItem('token')

        const url =
          recherche.trim() === ''
            ? 'http://127.0.0.1:8000/api/produits/'
            : `http://127.0.0.1:8000/api/produits/?search=${encodeURIComponent(
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
            'Erreur lors du chargement des produits :',
            data
          )
          return
        }

        setProduits(data)
      } catch (error) {
        console.error(
          'Erreur de connexion au serveur :',
          error
        )
      }
    }

    chargerProduits()
  }, [recherche, actualisation])

  const couleursType = {
    'Vrac solide': {
      texte: '#B45309',
      point: '#F59E0B',
    },
    Métallurgie: {
      texte: '#1D4ED8',
      point: '#3B82F6',
    },
    Agroalimentaire: {
      texte: '#15803D',
      point: '#22C55E',
    },
    'Matières premières': {
      texte: '#7C3AED',
      point: '#8B5CF6',
    },
    'Marchandise générale': {
      texte: '#BE185D',
      point: '#EC4899',
    },
  }

  return (
    <AdminLayout
      pageActive="marchandises"
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
              Gestion des produits
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
              Consultez et gérez le référentiel des produits enregistrés dans PortTrack.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('ajouterProduit')
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
            Ajouter un produit
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
                placeholder="Rechercher un produit"
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

            {/* Nombre de produits */}
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
              {produits.length} produits affichés
            </span>
          </div>

          {/* En-têtes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2.6fr 1.6fr 1.6fr',
              alignItems: 'center',
              backgroundColor: '#F5F7FA',
              borderBottom: '1px solid #E5EBF0',
              padding: '11px 16px',
              minHeight: '42px',
              boxSizing: 'border-box',
            }}
          >
            {[
              'Désignation',
              'Type de produit',
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

          {/* Produits */}
          {produits.length > 0 ? (
            produits.map((produit, index) => (
              <div
                key={produit.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2.6fr 1.6fr 1.6fr',
                  alignItems: 'center',
                  padding: '10px 16px',
                  minHeight: '59px',
                  borderBottom:
                    index === produits.length - 1
                      ? 'none'
                      : '1px solid #EDF1F4',
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {/* Désignation */}
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
                    <IconeProduit />
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
                      {produit.designation}
                    </div>
                  </div>
                </div>

                {/* Type de produit */}
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color:
                        couleursType[produit.type_produit]?.texte ??
                        '#526573',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor:
                          couleursType[produit.type_produit]?.point ??
                          '#8997A2',
                        flexShrink: 0,
                      }}
                    />
                    {produit.type_produit}
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
                      if (onModifierProduit) {
                        onModifierProduit(produit)
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
                      if (onSupprimerProduit) {
                        onSupprimerProduit(produit)
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
              Aucun produit trouvé.
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}

export default GestionProduits