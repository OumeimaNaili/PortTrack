import { useEffect, useMemo, useState } from 'react'
import TableauFiche from '../../components/chefMagasinier/TableauFiche'

const API_URL = import.meta.env.VITE_API_URL

const construireTableau = (fiche, details, toutesFiches) => {
  const produits = (fiche.produits || []).map((produit) => ({
    key: String(produit.produit_navire),
    label: produit.designation,
  }))

  const shifts = {}
  ;['matin', 'soir', 'nuit', 'nuit2'].forEach((cle) => {
    shifts[cle] = { nbrEquipes: 0, quantite: {}, tonnage: {} }
    produits.forEach((produit) => {
      shifts[cle].quantite[produit.key] = 0
      shifts[cle].tonnage[produit.key] = 0
    })
  })

  const correspondance = {
    MATIN: 'matin',
    SOIR: 'soir',
    NUIT: 'nuit',
    NUIT2: 'nuit2',
  }

  details
    .filter((detail) => Number(detail.fiche) === Number(fiche.id))
    .forEach((detail) => {
      const cle = correspondance[detail.shift]
      const produitKey = String(detail.produit_navire)

      if (!cle || shifts[cle].quantite[produitKey] === undefined) {
        return
      }

      shifts[cle].quantite[produitKey] = Number(detail.quantite_dechargee || 0)
      shifts[cle].tonnage[produitKey] = Number(detail.tonnage_decharge || 0)
      shifts[cle].nbrEquipes = Number(detail.nombre_equipes || 0)
    })

  // Fiches de la même escale, jusqu'à la date de cette fiche (incluse).
  // Les fiches des jours suivants ne sont pas comptées : les valeurs
  // de l'historique restent donc figées.
  const fichesJusquaCetteDate = toutesFiches.filter(
    (element) =>
      Number(element.navire) === Number(fiche.navire) &&
      String(element.numero_escale || '').trim() ===
        String(fiche.numero_escale || '').trim() &&
      element.date_fiche <= fiche.date_fiche
  )

  const totalJour = { quantite: {}, tonnage: {} }
  const totalDech = { quantite: {}, tonnage: {} }
  const resteABord = { quantite: {}, tonnage: {} }

  produits.forEach((produit) => {
    totalJour.quantite[produit.key] = 0
    totalJour.tonnage[produit.key] = 0

    Object.keys(shifts).forEach((cle) => {
      totalJour.quantite[produit.key] += shifts[cle].quantite[produit.key]
      totalJour.tonnage[produit.key] += shifts[cle].tonnage[produit.key]
    })

    const produitFiche = (fiche.produits || []).find(
      (element) => String(element.produit_navire) === produit.key
    )

    let cumulQuantite = 0
    let cumulTonnage = 0

    fichesJusquaCetteDate.forEach((ficheEscale) => {
      const produitEscale = (ficheEscale.produits || []).find(
        (element) =>
          Number(element.produit_id) === Number(produitFiche?.produit_id)
      )

      if (!produitEscale) {
        return
      }

      details
        .filter(
          (detail) =>
            Number(detail.fiche) === Number(ficheEscale.id) &&
            Number(detail.produit_navire) ===
              Number(produitEscale.produit_navire)
        )
        .forEach((detail) => {
          cumulQuantite += Number(detail.quantite_dechargee || 0)
          cumulTonnage += Number(detail.tonnage_decharge || 0)
        })
    })

    const manifesteQuantite = Number(produitFiche?.quantite_manifeste || 0)
    const manifesteTonnage = Number(produitFiche?.tonnage_manifeste || 0)

    totalDech.quantite[produit.key] = cumulQuantite
    totalDech.tonnage[produit.key] = cumulTonnage
    resteABord.quantite[produit.key] = Math.max(
      0,
      manifesteQuantite - cumulQuantite
    )
    resteABord.tonnage[produit.key] = Math.max(
      0,
      manifesteTonnage - cumulTonnage
    )
  })

  const listeShifts = [
    { key: 'matin', label: 'MATIN', nbrEquipes: shifts.matin.nbrEquipes },
    { key: 'soir', label: 'SOIR', nbrEquipes: shifts.soir.nbrEquipes },
    { key: 'nuit', label: 'NUIT', nbrEquipes: shifts.nuit.nbrEquipes },
    { key: 'nuit2', label: 'NUIT 2', nbrEquipes: shifts.nuit2.nbrEquipes },
  ]

  return {
    produits,
    shifts,
    listeShifts,
    totalJour,
    totalDech,
    resteABord,
  }
}

const formaterDate = (dateIso) => {
  if (!dateIso) {
    return '-'
  }

  const [annee, mois, jour] = dateIso.split('-')

  return `${jour}/${mois}/${annee}`
}

function CarteStatut({ validee }) {
  return (
    <span
      style={{
        padding: '6px 12px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        background: validee ? '#ECFDF3' : '#FFF7E6',
        color: validee ? '#027A48' : '#B54708',
      }}
    >
      {validee ? 'VALIDÉE' : 'EN ATTENTE DE VALIDATION'}
    </span>
  )
}

function HistoriqueSaisies() {
  const [fiches, setFiches] = useState([])
  const [details, setDetails] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('TOUS')
  const [joursOuverts, setJoursOuverts] = useState({})

  useEffect(() => {
    const charger = async () => {
      const token = sessionStorage.getItem('token')

      if (!token) {
        setErreur('Aucun token de connexion trouvé.')
        setChargement(false)
        return
      }

      const headers = {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      }

      try {
        const [reponseFiches, reponseDetails] = await Promise.all([
          fetch(`${API_URL}/fiches-journalieres/`, { headers }),
          fetch(`${API_URL}/details-dechargement/`, { headers }),
        ])

        if (!reponseFiches.ok || !reponseDetails.ok) {
          throw new Error("Impossible de charger l'historique des saisies.")
        }

        const donneesFiches = await reponseFiches.json()
        const donneesDetails = await reponseDetails.json()

        setFiches(
          Array.isArray(donneesFiches)
            ? donneesFiches
            : donneesFiches.results || []
        )

        setDetails(
          Array.isArray(donneesDetails)
            ? donneesDetails
            : donneesDetails.results || []
        )

        setErreur('')
      } catch (error) {
        setErreur(error.message || 'Erreur de connexion au serveur.')
      } finally {
        setChargement(false)
      }
    }

    charger()
  }, [])

  const jours = useMemo(() => {
    const groupes = {}

    fiches
      .filter(
        (fiche) =>
          fiche.statut === 'SOUMISE' || fiche.statut === 'VALIDEE'
      )
      .forEach((fiche) => {
        if (!groupes[fiche.date_fiche]) {
          groupes[fiche.date_fiche] = []
        }

        groupes[fiche.date_fiche].push(fiche)
      })

    return Object.keys(groupes)
      .sort((a, b) => (a < b ? 1 : -1))
      .map((date) => ({
        date,
        fiches: groupes[date].sort((a, b) =>
          (a.navire_nom || '').localeCompare(b.navire_nom || '')
        ),
        validee: groupes[date].every((fiche) => fiche.statut === 'VALIDEE'),
      }))
  }, [fiches])

  const joursFiltres = jours.filter((jour) => {
    if (filtreStatut === 'VALIDEE' && !jour.validee) {
      return false
    }

    if (filtreStatut === 'SOUMISE' && jour.validee) {
      return false
    }

    const texte = recherche.trim().toLowerCase()

    if (!texte) {
      return true
    }

    return (
      jour.date.includes(texte) ||
      formaterDate(jour.date).includes(texte) ||
      jour.fiches.some(
        (fiche) =>
          (fiche.navire_nom || '').toLowerCase().includes(texte) ||
          String(fiche.numero_escale || '').toLowerCase().includes(texte)
      )
    )
  })

  const basculerJour = (date) => {
    setJoursOuverts((precedent) => ({
      ...precedent,
      [date]: !precedent[date],
    }))
  }

  const styleCarte = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderLeft: '5px solid #172F43',
    borderRadius: '14px',
    boxShadow:
      '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
  }

  return (
    <div>
      {/* En-tête */}
      <div
        style={{
          ...styleCarte,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          padding: '22px 28px',
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
            Historique des saisies
          </h1>

          <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
            Fiches journalières soumises et validées.
          </p>
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            background: '#EAF1FF',
            color: '#172F43',
          }}
        >
          {joursFiltres.length} journée{joursFiltres.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Filtres */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <input
          type="text"
          placeholder="Rechercher un navire, une escale ou une date..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{
            flex: 1,
            minWidth: '260px',
            padding: '10px 12px',
            border: '1px solid #D0D5DD',
            borderRadius: '8px',
            fontSize: '14px',
            background: '#FFFFFF',
            boxSizing: 'border-box',
          }}
        />

        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #D0D5DD',
            borderRadius: '8px',
            fontSize: '14px',
            background: '#FFFFFF',
          }}
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="VALIDEE">Validées</option>
          <option value="SOUMISE">En attente de validation</option>
        </select>
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
        <div style={{ padding: '40px', textAlign: 'center', color: '#667085' }}>
          Chargement de l'historique...
        </div>
      ) : joursFiltres.length === 0 ? (
        <div
          style={{
            ...styleCarte,
            borderLeft: '1px solid #E5E7EB',
            padding: '40px',
            textAlign: 'center',
            color: '#667085',
          }}
        >
          Aucune fiche soumise ou validée.
        </div>
      ) : (
        joursFiltres.map((jour) => {
          const ouvert = Boolean(joursOuverts[jour.date])

          return (
            <div
              key={jour.date}
              style={{
                ...styleCarte,
                padding: '20px 28px',
                marginBottom: '18px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#101828',
                      marginBottom: '4px',
                    }}
                  >
                    {formaterDate(jour.date)}
                  </div>

                  <div style={{ fontSize: '13px', color: '#667085' }}>
                    {jour.fiches.length} navire
                    {jour.fiches.length > 1 ? 's' : ''} :{' '}
                    {jour.fiches
                      .map((fiche) => fiche.navire_nom)
                      .join(', ')}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <CarteStatut validee={jour.validee} />

                  <button
                    type="button"
                    onClick={() => basculerJour(jour.date)}
                    style={{
                      padding: '9px 18px',
                      border: 'none',
                      borderRadius: '8px',
                      background: '#172F43',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    {ouvert ? 'Masquer' : 'Voir le détail'}
                  </button>
                </div>
              </div>

              {ouvert && (
                <div style={{ marginTop: '22px' }}>
                  {jour.fiches.map((fiche, index) => {
                    const tableau = construireTableau(fiche, details, fiches)

                    return (
                      <div key={fiche.id} style={{ marginBottom: '26px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            flexWrap: 'wrap',
                            marginBottom: '14px',
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '17px',
                              fontWeight: 700,
                              color: '#101828',
                            }}
                          >
                            🚢 {fiche.navire_nom}
                          </h3>

                          <span
                            style={{
                              background: '#EAF1FF',
                              color: '#172F43',
                              padding: '4px 12px',
                              borderRadius: '999px',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            Escale : {fiche.numero_escale || '-'}
                          </span>
                        </div>

                        {tableau.produits.length === 0 ? (
                          <div style={{ color: '#667085', fontSize: '13px' }}>
                            Aucun produit dans cette fiche.
                          </div>
                        ) : (
                          <TableauFiche
                            merchandises={tableau.produits}
                            listeShifts={tableau.listeShifts}
                            shifts={tableau.shifts}
                            modifierValeur={() => {}}
                            totalJour={{
                              label: 'TOTAL JOUR',
                              quantite: tableau.totalJour.quantite,
                              tonnage: tableau.totalJour.tonnage,
                            }}
                            totalDech={{
                              label: 'TOTAL DECH',
                              quantite: tableau.totalDech.quantite,
                              tonnage: tableau.totalDech.tonnage,
                            }}
                            resteABord={{
                              label: 'RESTE À BORD',
                              quantite: tableau.resteABord.quantite,
                              tonnage: tableau.resteABord.tonnage,
                            }}
                            modifiable={false}
                          />
                        )}

                        {index < jour.fiches.length - 1 && (
                          <div
                            style={{
                              height: '1px',
                              background:
                                'linear-gradient(90deg, transparent, #D0D5DD 15%, #D0D5DD 85%, transparent)',
                              marginTop: '26px',
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}

export default HistoriqueSaisies