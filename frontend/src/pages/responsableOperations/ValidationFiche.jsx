import { useEffect, useRef, useState } from 'react'
import TableauFiche from '../../components/chefMagasinier/TableauFiche'

const API_URL = 'http://127.0.0.1:8000/api'

function ValidationFiche({
  ficheId,
  onNavigate,
  onDeconnexion,
}) {
  const [fiche, setFiche] = useState(null)
  const [fichesDuJour, setFichesDuJour] = useState([])
  const [detailsDuJour, setDetailsDuJour] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [motifRefus, setMotifRefus] = useState('')
  const [afficherRefus, setAfficherRefus] = useState(false)
  const [traitement, setTraitement] = useState(false)
  const [messageSucces, setMessageSucces] = useState(null)
  const timerRedirection = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRedirection.current) {
        clearTimeout(timerRedirection.current)
      }
    }
  }, [])

  const afficherMessageEtRetour = (texte, type) => {
    setMessageSucces({ texte, type })

    timerRedirection.current = setTimeout(() => {
      onNavigate('suiviDechargement')
    }, 2000)
  }

  const creerTableauFiche = (ficheCourante) => {
    const produits = (ficheCourante?.produits || []).map((produit) => ({
      key: String(produit.produit_navire),
      label: produit.designation,
    }))

    const creerEtatShift = () => ({
      nbrEquipes: 0,
      quantite: {},
      tonnage: {},
    })

    const shifts = {
      matin: creerEtatShift(),
      soir: creerEtatShift(),
      nuit: creerEtatShift(),
      nuit2: creerEtatShift(),
    }

    produits.forEach((produit) => {
      Object.keys(shifts).forEach((shiftKey) => {
        shifts[shiftKey].quantite[produit.key] = 0
        shifts[shiftKey].tonnage[produit.key] = 0
      })
    })

    const detailsFiche = detailsDuJour.filter(
      (detail) =>
        Number(detail.fiche) === Number(ficheCourante.id)
    )

    const correspondanceShifts = {
      MATIN: 'matin',
      SOIR: 'soir',
      NUIT: 'nuit',
      NUIT2: 'nuit2',
    }

    detailsFiche.forEach((detail) => {
      const shiftKey =
        correspondanceShifts[detail.shift]

      if (!shiftKey) {
        return
      }

      const produitKey = String(
        detail.produit_navire
      )

      if (
        shifts[shiftKey].quantite[produitKey] ===
        undefined
      ) {
        return
      }

      shifts[shiftKey].quantite[produitKey] =
        Number(detail.quantite_dechargee || 0)

      shifts[shiftKey].tonnage[produitKey] =
        Number(detail.tonnage_decharge || 0)

      shifts[shiftKey].nbrEquipes =
        Number(detail.nombre_equipes || 0)
    })

    const totalJour = {
      quantite: {},
      tonnage: {},
    }

    produits.forEach((produit) => {
      totalJour.quantite[produit.key] = 0
      totalJour.tonnage[produit.key] = 0

      Object.keys(shifts).forEach((shiftKey) => {
        totalJour.quantite[produit.key] +=
          Number(
            shifts[shiftKey].quantite[
              produit.key
            ] || 0
          )

        totalJour.tonnage[produit.key] +=
          Number(
            shifts[shiftKey].tonnage[
              produit.key
            ] || 0
          )
      })
    })

    const totalDech = {
      quantite: {},
      tonnage: {},
    }

    const resteABord = {
      quantite: {},
      tonnage: {},
    }

    produits.forEach((produit) => {
      const produitFiche =
        ficheCourante.produits?.find(
          (element) =>
            String(element.produit_navire) ===
            produit.key
        )

      totalDech.quantite[produit.key] =
        Number(
          produitFiche?.total_decharge_quantite ||
            0
        )

      totalDech.tonnage[produit.key] =
        Number(
          produitFiche?.total_decharge_tonnage ||
            0
        )

      resteABord.quantite[produit.key] =
        Number(
          produitFiche?.reste_a_bord_quantite ||
            0
        )

      resteABord.tonnage[produit.key] =
        Number(
          produitFiche?.reste_a_bord_tonnage ||
            0
        )
    })

    const listeShifts = [
      {
        key: 'matin',
        label: 'MATIN',
        nbrEquipes: shifts.matin.nbrEquipes,
      },
      {
        key: 'soir',
        label: 'SOIR',
        nbrEquipes: shifts.soir.nbrEquipes,
      },
      {
        key: 'nuit',
        label: 'NUIT',
        nbrEquipes: shifts.nuit.nbrEquipes,
      },
      {
        key: 'nuit2',
        label: 'NUIT 2',
        nbrEquipes: shifts.nuit2.nbrEquipes,
      },
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

  const chargerFiche = async () => {
    const token = sessionStorage.getItem('token')

    if (!token) {
      setErreur('Aucun token de connexion trouvé.')
      setChargement(false)
      return
    }

    try {
      const headers = {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      }

      const ficheResponse = await fetch(
        `${API_URL}/fiches-journalieres/${ficheId}/`,
        {
          method: 'GET',
          headers,
        }
      )

      const ficheData =
        await ficheResponse.json()

      if (!ficheResponse.ok) {
        setErreur(
          ficheData.detail ||
            'Impossible de charger la fiche journalière.'
        )
        setChargement(false)
        return
      }

      setFiche(ficheData)

      const [fichesResponse, detailsResponse] =
        await Promise.all([
          fetch(
            `${API_URL}/fiches-journalieres/`,
            {
              method: 'GET',
              headers,
            }
          ),
          fetch(
            `${API_URL}/details-dechargement/`,
            {
              method: 'GET',
              headers,
            }
          ),
        ])

      const fichesData =
        await fichesResponse.json()

      const detailsData =
        await detailsResponse.json()

      if (!fichesResponse.ok) {
        setErreur(
          fichesData.detail ||
            'Impossible de charger les fiches de la journée.'
        )
        setChargement(false)
        return
      }

      if (!detailsResponse.ok) {
        setErreur(
          detailsData.detail ||
            'Impossible de charger les détails de déchargement.'
        )
        setChargement(false)
        return
      }

      const listeFiches = Array.isArray(
        fichesData
      )
        ? fichesData
        : fichesData.results || []

      const listeDetails = Array.isArray(
        detailsData
      )
        ? detailsData
        : detailsData.results || []

      const fichesMemeJour =
        listeFiches.filter(
          (element) =>
            element.date_fiche ===
            ficheData.date_fiche
        )

      setFichesDuJour(fichesMemeJour)
      setDetailsDuJour(listeDetails)
      setErreur('')
    } catch (error) {
      console.error(
        'Erreur lors du chargement de la fiche :',
        error
      )

      setErreur(
        'Erreur de connexion au serveur.'
      )
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    if (!ficheId) {
      setErreur(
        'Aucune fiche journalière sélectionnée.'
      )
      setChargement(false)
      return
    }

    setChargement(true)
    chargerFiche()
  }, [ficheId])

  const validerFiche = async () => {
    const token = sessionStorage.getItem('token')

    if (!token) {
      return
    }

    setTraitement(true)
    setErreur('')

    try {
      const response = await fetch(
        `${API_URL}/fiches-journalieres/${ficheId}/valider/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setErreur(
          data.detail ||
            'Impossible de valider la fiche.'
        )
        setTraitement(false)
        return
      }

      const ficheValideeMiseAJour =
        data.fiches?.find(
          (element) =>
            Number(element.id) === Number(ficheId)
        )

      if (ficheValideeMiseAJour) {
        setFiche(ficheValideeMiseAJour)
      }

      afficherMessageEtRetour(
        'La fiche a été validée avec succès.',
        'success'
      )
    } catch (error) {
      console.error(
        'Erreur lors de la validation de la fiche :',
        error
      )

      setErreur(
        'Erreur de connexion au serveur.'
      )
    } finally {
      setTraitement(false)
    }
  }

  const refuserFiche = async () => {
    const motif = motifRefus.trim()

    if (!motif) {
      setErreur(
        'Le motif du refus est obligatoire.'
      )
      return
    }

    const token = sessionStorage.getItem('token')

    if (!token) {
      return
    }

    setTraitement(true)
    setErreur('')

    try {
      const response = await fetch(
        `${API_URL}/fiches-journalieres/${ficheId}/refuser/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            motif_refus: motif,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setErreur(
          data.motif_refus ||
            data.detail ||
            'Impossible de refuser la fiche.'
        )
        setTraitement(false)
        return
      }

      const ficheRefuseeMiseAJour =
        data.fiches?.find(
          (element) =>
            Number(element.id) === Number(ficheId)
        )

      if (ficheRefuseeMiseAJour) {
        setFiche(ficheRefuseeMiseAJour)
      }

      setMotifRefus('')
      setAfficherRefus(false)

      afficherMessageEtRetour(
        'La fiche a été refusée avec succès.',
        'refus'
      )
    } catch (error) {
      console.error(
        'Erreur lors du refus de la fiche :',
        error
      )

      setErreur(
        'Erreur de connexion au serveur.'
      )
    } finally {
      setTraitement(false)
    }
  }

  if (chargement) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: '#667085',
        }}
      >
        Chargement de la fiche journalière...
      </div>
    )
  }

  if (erreur && !fiche) {
    return (
      <div>
        <button
          type="button"
          onClick={() =>
            onNavigate('suiviDechargement')
          }
          style={{
            border: 'none',
            background: 'transparent',
            color: '#344D66',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          ← Retour
        </button>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '24px',
            color: '#B42318',
            boxShadow:
              '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
          }}
        >
          {erreur}
        </div>
      </div>
    )
  }

  const ficheValidee =
    fiche?.statut === 'VALIDEE'

  const ficheSoumise =
    fiche?.statut === 'SOUMISE'

  const ficheRefusee =
    fiche?.statut === 'REFUSEE'

  return (
    <div>
      {messageSucces && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 3000,
            minWidth: '280px',
            maxWidth: '420px',
            padding: '14px 18px',
            borderRadius: '10px',
            background:
              messageSucces.type === 'success'
                ? '#ECFDF3'
                : '#FEF3F2',
            border: `1px solid ${
              messageSucces.type === 'success'
                ? '#ABEFC6'
                : '#FECDCA'
            }`,
            borderLeft: `5px solid ${
              messageSucces.type === 'success'
                ? '#027A48'
                : '#B42318'
            }`,
            color:
              messageSucces.type === 'success'
                ? '#027A48'
                : '#B42318',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow:
              '0 8px 30px rgba(0, 0, 0, 0.15)',
          }}
        >
          {messageSucces.texte}
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          onNavigate('suiviDechargement')
        }
        style={{
          border: 'none',
          background: 'transparent',
          color: '#344D66',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        ← Retour au suivi du déchargement
      </button>

      {/* En-tête de la page */}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '620px',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background:
                'linear-gradient(135deg, #1F3548 0%, #172F43 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
              boxShadow:
                '0 4px 10px rgba(23,47,67,0.25)',
            }}
          >
            🚢
          </div>

          <div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: '700',
                color: '#101828',
                margin: '0 0 6px 0',
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              Fiche journalière
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: '#667085',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Vérification et validation de la fiche soumise.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            background:
              ficheValidee
                ? '#ECFDF3'
                : ficheRefusee
                  ? '#FEF3F2'
                  : '#FFF7E6',
            color:
              ficheValidee
                ? '#027A48'
                : ficheRefusee
                  ? '#B42318'
                  : '#B54708',
          }}
        >
          {ficheValidee
            ? 'VALIDÉE'
            : ficheRefusee
              ? 'REFUSÉE'
              : ficheSoumise
                ? 'EN ATTENTE DE VALIDATION'
                : fiche?.statut || ''}
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

      {/* Informations de la fiche journalière */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          padding: '24px 28px',
          marginBottom: '24px',
          boxShadow:
            '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        }}
      >
        <h2
          style={{
            margin: '0 0 18px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#344054',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          Informations de la fiche journalière
        </h2>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              background: '#F8F9FB',
              borderRadius: '10px',
              padding: '12px 18px',
              minWidth: '150px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#667085',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Date
            </div>

            <div
              style={{
                fontWeight: '700',
                fontSize: '15px',
                color: '#172F43',
              }}
            >
              {fiche?.date_fiche || '-'}
            </div>
          </div>

          <div
            style={{
              background: '#F8F9FB',
              borderRadius: '10px',
              padding: '12px 18px',
              minWidth: '150px',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                color: '#667085',
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}
            >
              Nombre de navires
            </div>

            <div
              style={{
                fontWeight: '700',
                fontSize: '15px',
                color: '#172F43',
              }}
            >
              {fichesDuJour.length}
            </div>
          </div>
        </div>
      </div>

      {fichesDuJour.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '30px',
            textAlign: 'center',
            color: '#667085',
            marginBottom: '20px',
            boxShadow:
              '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
          }}
        >
          Aucun navire trouvé pour cette journée.
        </div>
      ) : (
        <div>
          {fichesDuJour.map(
            (ficheCourante, indexFiche) => {
              const tableau =
                creerTableauFiche(
                  ficheCourante
                )

              return (
                <div
                  key={ficheCourante.id}
                  style={{
                    marginBottom: '30px',
                  }}
                >
                  {/* Carte du navire */}
                  <div
                    style={{
                      padding: '24px 28px',
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E5E7EB',
                      borderLeft: '5px solid #172F43',
                      boxShadow:
                        '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
                      marginBottom: '20px',
                    }}
                  >
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom: '20px',
                        fontSize: '21px',
                        fontWeight: '700',
                        color: '#101828',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>
                        🚢
                      </span>
                      NAVIRE :{' '}
                      {ficheCourante.navire_nom || '-'}
                    </h2>

                    <div
                      style={{
                        display: 'flex',
                        gap: '16px',
                        flexWrap: 'wrap',
                        marginBottom: '22px',
                      }}
                    >
                      <div
                        style={{
                          background: '#F8F9FB',
                          borderRadius: '10px',
                          padding: '12px 18px',
                          minWidth: '150px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#667085',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          Date
                        </div>

                        <div
                          style={{
                            fontWeight: '700',
                            fontSize: '15px',
                            color: '#172F43',
                          }}
                        >
                          {ficheCourante.date_fiche || '-'}
                        </div>
                      </div>

                      <div
                        style={{
                          background: '#F8F9FB',
                          borderRadius: '10px',
                          padding: '12px 18px',
                          minWidth: '150px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#667085',
                            marginBottom: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          Numéro d'escale
                        </div>

                        <div
                          style={{
                            fontWeight: '700',
                            fontSize: '15px',
                            color: '#172F43',
                          }}
                        >
                          {ficheCourante.numero_escale || '-'}
                        </div>
                      </div>
                    </div>

                    {tableau.produits.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#344054',
                            marginBottom: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          Produits sélectionnés
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                          }}
                        >
                          {tableau.produits.map(
                            (produit) => {
                              const produitFiche =
                                ficheCourante.produits?.find(
                                  (element) =>
                                    String(
                                      element.produit_navire
                                    ) === produit.key
                                )

                              return (
                                <div
                                  key={produit.key}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    flexWrap: 'wrap',
                                    padding: '12px 16px',
                                    background: '#F8F9FA',
                                    borderRadius: '9px',
                                    border:
                                      '1px solid #EEF1F4',
                                  }}
                                >
                                  <strong
                                    style={{
                                      color: '#101828',
                                      minWidth: '110px',
                                    }}
                                  >
                                    {produit.label}
                                  </strong>

                                  <span
                                    style={{
                                      background: '#EAF1FF',
                                      color: '#172F43',
                                      padding: '4px 12px',
                                      borderRadius: '999px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Quantité manifeste:{' '}
                                    {
                                      produitFiche?.quantite_manifeste
                                    }
                                  </span>

                                  <span
                                    style={{
                                      background: '#EAF9EF',
                                      color: '#16803A',
                                      padding: '4px 12px',
                                      borderRadius: '999px',
                                      fontSize: '13px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    Tonnage manifeste:{' '}
                                    {
                                      produitFiche?.tonnage_manifeste
                                    }
                                  </span>
                                </div>
                              )
                            }
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {tableau.produits.length ===
                  0 ? (
                    <div
                      style={{
                        background: '#FFFFFF',
                        border:
                          '1px solid #E5E7EB',
                        borderRadius: '14px',
                        padding: '30px',
                        textAlign: 'center',
                        color: '#667085',
                        boxShadow:
                          '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
                      }}
                    >
                      Aucun produit dans cette fiche.
                    </div>
                  ) : (
                    <TableauFiche
                      merchandises={
                        tableau.produits
                      }
                      listeShifts={
                        tableau.listeShifts
                      }
                      shifts={tableau.shifts}
                      modifierValeur={() => {}}
                      totalJour={{
                        label: 'TOTAL JOUR',
                        quantite:
                          tableau.totalJour
                            .quantite,
                        tonnage:
                          tableau.totalJour
                            .tonnage,
                      }}
                      totalDech={{
                        label: 'TOTAL DECH',
                        quantite:
                          tableau.totalDech
                            .quantite,
                        tonnage:
                          tableau.totalDech
                            .tonnage,
                      }}
                      resteABord={{
                        label:
                          'RESTE À BORD',
                        quantite:
                          tableau.resteABord
                            .quantite,
                        tonnage:
                          tableau.resteABord
                            .tonnage,
                      }}
                      modifiable={false}
                    />
                  )}

                  {fichesDuJour.length - 1 >
                    indexFiche && (
                    <div
                      style={{
                        height: '1px',
                        background:
                          'linear-gradient(90deg, transparent, #D0D5DD 15%, #D0D5DD 85%, transparent)',
                        marginTop: '30px',
                      }}
                    />
                  )}
                </div>
              )
            }
          )}
        </div>
      )}

      {fiche?.motif_refus && (
        <div
          style={{
            background: '#FEF3F2',
            border: '1px solid #FDA29B',
            borderLeft: '5px solid #D92D20',
            borderRadius: '14px',
            padding: '18px 22px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#B42318',
              marginBottom: '7px',
              letterSpacing: '0.03em',
            }}
          >
            MOTIF DU REFUS
          </div>

          <div
            style={{
              fontSize: '13px',
              color: '#7A271A',
            }}
          >
            {fiche.motif_refus}
          </div>
        </div>
      )}

      {ficheSoumise && (
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '22px 28px',
            boxShadow:
              '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
          }}
        >
          {!afficherRefus ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setAfficherRefus(true)
                }
                disabled={traitement}
                style={{
                  padding: '12px 26px',
                  border: '1px solid #D92D20',
                  borderRadius: '9px',
                  background: '#FFFFFF',
                  color: '#D92D20',
                  cursor: traitement
                    ? 'not-allowed'
                    : 'pointer',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Refuser
              </button>

              <button
                type="button"
                onClick={validerFiche}
                disabled={traitement}
                style={{
                  padding: '12px 26px',
                  border: 'none',
                  borderRadius: '9px',
                  background: '#172F43',
                  color: '#FFFFFF',
                  cursor: traitement
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: traitement ? 0.7 : 1,
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow:
                    '0 1px 3px rgba(16,24,40,0.15)',
                }}
              >
                {traitement
                  ? 'Traitement...'
                  : 'Valider'}
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#344054',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                Motif du refus
              </div>

              <textarea
                value={motifRefus}
                onChange={(event) =>
                  setMotifRefus(event.target.value)
                }
                placeholder="Saisissez le motif du refus..."
                rows={4}
                disabled={traitement}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  border: '1px solid #D0D5DD',
                  borderRadius: '7px',
                  padding: '10px 12px',
                  fontSize: '13px',
                  outline: 'none',
                  marginBottom: '14px',
                  fontFamily: 'inherit',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAfficherRefus(false)
                    setMotifRefus('')
                    setErreur('')
                  }}
                  disabled={traitement}
                  style={{
                    padding: '12px 26px',
                    border: '1px solid #D0D5DD',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    color: '#344054',
                    cursor: traitement
                      ? 'not-allowed'
                      : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={refuserFiche}
                  disabled={traitement}
                  style={{
                    padding: '12px 26px',
                    border: 'none',
                    borderRadius: '9px',
                    background: '#D92D20',
                    color: '#FFFFFF',
                    cursor: traitement
                      ? 'not-allowed'
                      : 'pointer',
                    opacity: traitement ? 0.7 : 1,
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {traitement
                    ? 'Traitement...'
                    : 'Confirmer le refus'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ValidationFiche
