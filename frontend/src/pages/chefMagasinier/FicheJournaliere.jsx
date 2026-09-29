import { useEffect, useState, useRef, forwardRef, useImperativeHandle, Fragment } from 'react'
import FicheHeader from '../../components/chefMagasinier/FicheHeader'
import TableauFiche from '../../components/chefMagasinier/TableauFiche'
import ConfirmationSuppression from '../../components/chefMagasinier/ConfirmationSuppression'

const API_URL = 'http://127.0.0.1:8000/api'

const getDateAujourdhui = () => {
  const aujourdHui = new Date()
  const annee = aujourdHui.getFullYear()
  const mois = String(aujourdHui.getMonth() + 1).padStart(2, '0')
  const jour = String(aujourdHui.getDate()).padStart(2, '0')

  return `${annee}-${mois}-${jour}`
}

const creerEtatShifts = (produits) => {
  const creerValeurs = () => {
    const valeurs = {}

    produits.forEach((produit) => {
      valeurs[produit.key] = 0
    })

    return valeurs
  }

  return {
    matin: {
      equipes: 1,
      quantite: creerValeurs(),
      tonnage: creerValeurs(),
    },
    soir: {
      equipes: 1,
      quantite: creerValeurs(),
      tonnage: creerValeurs(),
    },
    nuit: {
      equipes: 1,
      quantite: creerValeurs(),
      tonnage: creerValeurs(),
    },
    nuit2: {
      equipes: 1,
      quantite: creerValeurs(),
      tonnage: creerValeurs(),
    },
  }
}

const convertirProduitsFiche = (fiche) => {
  return (fiche.produits || []).map(
    (produit) => ({
      key: String(
        produit.produit_navire
      ),
      label: produit.designation,
      produitNavireId:
        produit.produit_navire,
      produitId:
        produit.produit_id,
      quantiteManifeste:
        Number(
          produit.quantite_manifeste
        ),
      tonnageManifeste:
        Number(
          produit.tonnage_manifeste
        ),
      totalDechargeQuantite: 0,
      totalDechargeTonnage: 0,
      resteABordQuantite: 0,
      resteABordTonnage: 0,
    })
  )
}

const BlocNavire = forwardRef(function BlocNavire({
  fiche,
  onSupprimer,
  onFicheModifiee,
}, ref) {
  const [produitsSelectionnes, setProduitsSelectionnes] =
    useState(
      convertirProduitsFiche(fiche)
    )

  const [shifts, setShifts] = useState(
    creerEtatShifts(
      convertirProduitsFiche(fiche)
    )
  )

  const [details, setDetails] = useState({})

  const [chargementDetails, setChargementDetails] =
    useState(false)

  const [enregistrement, setEnregistrement] =
    useState(false)

  const [suppression, setSuppression] =
    useState(false)

  const [afficherConfirmationSuppression, setAfficherConfirmationSuppression] =
    useState(false)

  const [messageErreurTableau, setMessageErreurTableau] =
    useState('')

  const [messageSuccesTableau, setMessageSuccesTableau] =
    useState('')

  const token = sessionStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  }

  const ficheSoumise =
    Boolean(fiche.soumise)

  useEffect(() => {
    chargerDetails()
  }, [fiche.id])

  const chargerDetails = async () => {
    if (!fiche) {
      return
    }

    try {
      setChargementDetails(true)
      setMessageErreurTableau('')

      const [reponseDetails, reponseFiches] =
        await Promise.all([
          fetch(
            `${API_URL}/details-dechargement/`,
            {
              headers,
            }
          ),
          fetch(
            `${API_URL}/fiches-journalieres/`,
            {
              headers,
            }
          ),
        ])

      if (
        !reponseDetails.ok ||
        !reponseFiches.ok
      ) {
        throw new Error(
          'Impossible de récupérer les données de déchargement.'
        )
      }

      const tousLesDetails =
        await reponseDetails.json()

      const toutesLesFiches =
        await reponseFiches.json()

      const detailsFiche =
        tousLesDetails.filter(
          (detail) =>
            detail.fiche === fiche.id
        )

      const nouveauxDetails = {}

      const produitsFiche =
        convertirProduitsFiche(fiche)

      const nouvelEtatShifts =
        creerEtatShifts(
          produitsFiche
        )

      const quantitesDuJour = {}
      const tonnagesDuJour = {}

      detailsFiche.forEach((detail) => {
        const produitKey = String(
          detail.produit_navire
        )

        let shiftKey = null

        if (detail.shift === 'MATIN') {
          shiftKey = 'matin'
        } else if (detail.shift === 'SOIR') {
          shiftKey = 'soir'
        } else if (detail.shift === 'NUIT') {
          shiftKey = 'nuit'
        } else if (detail.shift === 'NUIT2') {
          shiftKey = 'nuit2'
        }

        if (!shiftKey) {
          return
        }

        const detailKey =
          `${shiftKey}-${produitKey}`

        nouveauxDetails[detailKey] =
          detail.id

        if (
          nouvelEtatShifts[shiftKey] &&
          nouvelEtatShifts[shiftKey].quantite[
            produitKey
          ] !== undefined
        ) {
          const quantite =
            Number(
              detail.quantite_dechargee
            )

          const tonnage =
            Number(
              detail.tonnage_decharge
            )

          nouvelEtatShifts[
            shiftKey
          ].quantite[produitKey] =
            quantite

          nouvelEtatShifts[
            shiftKey
          ].tonnage[produitKey] =
            tonnage

          nouvelEtatShifts[
            shiftKey
          ].equipes =
            Number(
              detail.nombre_equipes
            )

          quantitesDuJour[
            produitKey
          ] =
            (quantitesDuJour[
              produitKey
            ] || 0) + quantite

          tonnagesDuJour[
            produitKey
          ] =
            (tonnagesDuJour[
              produitKey
            ] || 0) + tonnage
        }
      })

      setDetails(nouveauxDetails)
      setShifts(nouvelEtatShifts)

      const fichesMemeEscale =
        toutesLesFiches
          .filter(
            (element) =>
              String(
                element.id
              ) !==
                String(
                  fiche.id
                ) &&
              Number(
                element.navire
              ) ===
                Number(
                  fiche.navire
                ) &&
              String(
                element.numero_escale ||
                  ''
              ).trim() ===
                String(
                  fiche.numero_escale ||
                    ''
                ).trim() &&
              new Date(
                fiche.date_fiche
              ) >
                new Date(
                  element.date_fiche
                )
          )
          .sort(
            (a, b) =>
              new Date(
                a.date_fiche
              ) -
              new Date(
                b.date_fiche
              )
          )

      const historiqueParProduit = {}

      fichesMemeEscale.forEach(
        (ficheHistorique) => {
          ;(
            ficheHistorique.produits ||
            []
          ).forEach(
            (produitHistorique) => {
              const produitId =
                String(
                  produitHistorique.produit_id
                )

              if (
                !historiqueParProduit[
                  produitId
                ]
              ) {
                historiqueParProduit[
                  produitId
                ] = {
                  quantiteManifeste:
                    Number(
                      produitHistorique.quantite_manifeste
                    ),
                  tonnageManifeste:
                    Number(
                      produitHistorique.tonnage_manifeste
                    ),
                  totalDechargeQuantite:
                    0,
                  totalDechargeTonnage:
                    0,
                }
              }

              if (
                String(
                  ficheHistorique.id
                ) ===
                String(fiche.id)
              ) {
                return
              }

              tousLesDetails
                .filter(
                  (detail) =>
                    detail.fiche ===
                      ficheHistorique.id &&
                    Number(
                      detail.produit_navire
                    ) ===
                      Number(
                        produitHistorique.produit_navire
                      )
                )
                .forEach(
                  (detail) => {
                    historiqueParProduit[
                      produitId
                    ].totalDechargeQuantite +=
                      Number(
                        detail.quantite_dechargee
                      )

                    historiqueParProduit[
                      produitId
                    ].totalDechargeTonnage +=
                      Number(
                        detail.tonnage_decharge
                      )
                  }
                )
            }
          )
        }
      )

      const produitsAvecHistorique =
        produitsFiche.map(
          (produit) => {
            const historique =
              historiqueParProduit[
                String(
                  produit.produitId
                )
              ]

            return {
              ...produit,
              quantiteManifeste:
                historique
                  ? historique.quantiteManifeste
                  : produit.quantiteManifeste,
              tonnageManifeste:
                historique
                  ? historique.tonnageManifeste
                  : produit.tonnageManifeste,
              totalDechargeQuantite:
                historique
                  ? historique.totalDechargeQuantite
                  : 0,
              totalDechargeTonnage:
                historique
                  ? historique.totalDechargeTonnage
                  : 0,
            }
          }
        )

      setProduitsSelectionnes(
        produitsAvecHistorique
      )
    } catch (erreur) {
      setMessageErreurTableau(
        erreur.message
      )
    } finally {
      setChargementDetails(false)
    }
  }


    const modifierValeur = (
    cle,
    categorie,
    marchandise,
    valeur
  ) => {
    if (ficheSoumise) {
      return
    }

    const nouvelleValeur =
      valeur === ''
        ? 0
        : Number(valeur)

    if (nouvelleValeur < 0) {
      setMessageErreurTableau(
        'La valeur ne peut pas être négative.'
      )
      return
    }

    if (categorie === 'nbrEquipes') {
      setShifts((precedent) => ({
        ...precedent,
        [cle]: {
          ...precedent[cle],
          equipes: nouvelleValeur,
        },
      }))
      return
    }

    const produit =
      produitsSelectionnes.find(
        (element) =>
          element.key ===
          String(marchandise)
      )

    if (!produit) {
      return
    }

   
   
    let totalJourNouveau = 0

    Object.keys(shifts).forEach(
      (shiftKey) => {
        Object.keys(
          shifts[shiftKey]?.[categorie] || {}
        ).forEach((produitKey) => {
          if (
            produitKey ===
            String(marchandise)
          ) {
            if (shiftKey === cle) {
              totalJourNouveau +=
                nouvelleValeur
            } else {
              totalJourNouveau +=
                Number(
                  shifts[shiftKey]?.[
                    categorie
                  ]?.[produitKey] || 0
                )
            }
          }
        })
      }
    )

    const totalJourActuel = {
      quantite: {},
      tonnage: {},
    }

    produitsSelectionnes.forEach(
      (element) => {
        totalJourActuel.quantite[
          element.key
        ] = 0

        totalJourActuel.tonnage[
          element.key
        ] = 0
      }
    )

    Object.keys(shifts).forEach(
      (shiftKey) => {
        produitsSelectionnes.forEach(
          (element) => {
            totalJourActuel.quantite[
              element.key
            ] +=
              shiftKey === cle &&
              categorie === 'quantite'
                ? element.key ===
                  String(marchandise)
                  ? nouvelleValeur
                  : Number(
                      shifts[shiftKey]?.quantite[
                        element.key
                      ] || 0
                    )
                : Number(
                    shifts[shiftKey]?.quantite[
                      element.key
                    ] || 0
                  )

            totalJourActuel.tonnage[
              element.key
            ] +=
              shiftKey === cle &&
              categorie === 'tonnage'
                ? element.key ===
                  String(marchandise)
                  ? nouvelleValeur
                  : Number(
                      shifts[shiftKey]?.tonnage[
                        element.key
                      ] || 0
                    )
                : Number(
                    shifts[shiftKey]?.tonnage[
                      element.key
                    ] || 0
                  )
          }
        )
      }
    )

    const totalDechargeNouveau =
      produit.totalDechargeQuantite +
      totalJourActuel.quantite[
        produit.key
      ]

    const totalDechargeTonnageNouveau =
      produit.totalDechargeTonnage +
      totalJourActuel.tonnage[
        produit.key
      ]

    if (
      categorie === 'quantite' &&
      totalJourNouveau >
        produit.quantiteManifeste
    ) {
      setMessageErreurTableau(
        `Le total jour de ${produit.label} ne peut pas dépasser la quantité manifeste (${produit.quantiteManifeste}).`
      )
      return
    }

    if (
      categorie === 'tonnage' &&
      totalJourNouveau >
        produit.tonnageManifeste
    ) {
      setMessageErreurTableau(
        `Le total jour de ${produit.label} ne peut pas dépasser le tonnage manifeste (${produit.tonnageManifeste}).`
      )
      return
    }

    if (
      categorie === 'quantite' &&
      totalDechargeNouveau >
        produit.quantiteManifeste
    ) {
      setMessageErreurTableau(
        `Le total déchargé de ${produit.label} ne peut pas dépasser la quantité manifeste (${produit.quantiteManifeste}).`
      )
      return
    }

    if (
      categorie === 'tonnage' &&
      totalDechargeTonnageNouveau >
        produit.tonnageManifeste
    ) {
      setMessageErreurTableau(
        `Le total déchargé de ${produit.label} ne peut pas dépasser le tonnage manifeste (${produit.tonnageManifeste}).`
      )
      return
    }

    setMessageErreurTableau('')

    setShifts((precedent) => ({
      ...precedent,
      [cle]: {
        ...precedent[cle],
        [categorie]: {
          ...precedent[cle][categorie],
          [marchandise]:
            nouvelleValeur,
        },
      },
    }))
  }

  const listeShifts = [
    {
      key: 'matin',
      label: 'MATIN',
      nbrEquipes:
        shifts.matin?.equipes ?? 1,
    },
    {
      key: 'soir',
      label: 'SOIR',
      nbrEquipes:
        shifts.soir?.equipes ?? 1,
    },
    {
      key: 'nuit',
      label: 'NUIT',
      nbrEquipes:
        shifts.nuit?.equipes ?? 1,
    },
    {
      key: 'nuit2',
      label: 'NUIT2',
      nbrEquipes:
        shifts.nuit2?.equipes ?? 1,
    },
  ]

  const merchandises =
    produitsSelectionnes.map(
      (produit) => ({
        key: produit.key,
        label: produit.label,
      })
    )

  const totalJour = {
    quantite: {},
    tonnage: {},
  }

  merchandises.forEach(
    (marchandise) => {
      totalJour.quantite[
        marchandise.key
      ] = 0

      totalJour.tonnage[
        marchandise.key
      ] = 0
    }
  )

  listeShifts.forEach(
    ({ key }) => {
      merchandises.forEach(
        (marchandise) => {
          totalJour.quantite[
            marchandise.key
          ] +=
            Number(
              shifts[key]?.quantite[
                marchandise.key
              ] || 0
            )

          totalJour.tonnage[
            marchandise.key
          ] +=
            Number(
              shifts[key]?.tonnage[
                marchandise.key
              ] || 0
            )
        }
      )
    }
  )

  const totalDech = {
    quantite: {},
    tonnage: {},
  }

  const resteABord = {
    quantite: {},
    tonnage: {},
  }

  produitsSelectionnes.forEach(
    (produit) => {
      totalDech.quantite[
        produit.key
      ] =
        produit.totalDechargeQuantite +
        totalJour.quantite[
          produit.key
        ]

      totalDech.tonnage[
        produit.key
      ] =
        produit.totalDechargeTonnage +
        totalJour.tonnage[
          produit.key
        ]

      resteABord.quantite[
        produit.key
      ] =
        produit.quantiteManifeste -
        totalDech.quantite[
          produit.key
        ]

      resteABord.tonnage[
        produit.key
      ] =
        produit.tonnageManifeste -
        totalDech.tonnage[
          produit.key
        ]
    }
  )

  const enregistrer = async () => {
    if (ficheSoumise) {
      return
    }

    for (
      const produit of produitsSelectionnes
    ) {
      const quantiteJour =
        Number(
          totalJour.quantite[
            produit.key
          ] || 0
        )

      const tonnageJour =
        Number(
          totalJour.tonnage[
            produit.key
          ] || 0
        )

      const totalDechargeQuantite =
        Number(
          totalDech.quantite[
            produit.key
          ] || 0
        )

      const totalDechargeTonnage =
        Number(
          totalDech.tonnage[
            produit.key
          ] || 0
        )

      if (
        quantiteJour >
        Number(
          produit.quantiteManifeste
        )
      ) {
        setMessageErreurTableau(
          `Le total jour de ${produit.label} ne peut pas dépasser la quantité manifeste (${produit.quantiteManifeste}).`
        )
        setMessageSuccesTableau('')
        return
      }

      if (
        tonnageJour >
        Number(
          produit.tonnageManifeste
        )
      ) {
        setMessageErreurTableau(
          `Le total jour de ${produit.label} ne peut pas dépasser le tonnage manifeste (${produit.tonnageManifeste}).`
        )
        setMessageSuccesTableau('')
        return
      }

      if (
        totalDechargeQuantite >
        Number(
          produit.quantiteManifeste
        )
      ) {
        setMessageErreurTableau(
          `Le total déchargé de ${produit.label} ne peut pas dépasser la quantité manifeste (${produit.quantiteManifeste}).`
        )
        setMessageSuccesTableau('')
        return
      }

      if (
        totalDechargeTonnage >
        Number(
          produit.tonnageManifeste
        )
      ) {
        setMessageErreurTableau(
          `Le total déchargé de ${produit.label} ne peut pas dépasser le tonnage manifeste (${produit.tonnageManifeste}).`
        )
        setMessageSuccesTableau('')
        return
      }
    }

    try {
      setEnregistrement(true)
      setMessageErreurTableau('')
      setMessageSuccesTableau('')

      const detailsActuels =
        Object.values(details)

      const nouveauxDetails = {
        ...details,
      }

      for (
        const shift of listeShifts
      ) {
        for (
          const produit of produitsSelectionnes
        ) {
          const quantite =
            Number(
              shifts[shift.key]?.quantite[
                produit.key
              ] || 0
            )

          const tonnage =
            Number(
              shifts[shift.key]?.tonnage[
                produit.key
              ] || 0
            )

          const nombreEquipes =
            Number(
              shifts[shift.key]?.equipes || 1
            )

          const detailKey =
            `${shift.key}-${produit.produitNavireId}`

          const detailId =
            nouveauxDetails[
              detailKey
            ]

          if (
            detailId
          ) {
            const reponse =
              await fetch(
                `${API_URL}/details-dechargement/${detailId}/`,
                {
                  method: 'PATCH',
                  headers,
                  body: JSON.stringify({
                    fiche: fiche.id,
                    produit_navire:
                      produit.produitNavireId,
                    shift:
                      shift.key === 'matin'
                        ? 'MATIN'
                        : shift.key === 'soir'
                        ? 'SOIR'
                        : shift.key === 'nuit'
                        ? 'NUIT'
                        : 'NUIT2',
                    quantite_dechargee:
                      quantite,
                    tonnage_decharge:
                      tonnage,
                    nombre_equipes:
                      nombreEquipes,
                  }),
                }
              )

            const donnees =
              await reponse.json()

            if (!reponse.ok) {
              throw new Error(
                donnees.detail ||
                donnees.produit_navire?.[0] ||
                donnees.quantite_dechargee?.[0] ||
                donnees.tonnage_decharge?.[0] ||
                'Impossible d’enregistrer le déchargement.'
              )
            }
          } else if (
            quantite !== 0 ||
            tonnage !== 0
          ) {
            const reponse =
              await fetch(
                `${API_URL}/details-dechargement/`,
                {
                  method: 'POST',
                  headers,
                  body: JSON.stringify({
                    fiche: fiche.id,
                    produit_navire:
                      produit.produitNavireId,
                    shift:
                      shift.key === 'matin'
                        ? 'MATIN'
                        : shift.key === 'soir'
                        ? 'SOIR'
                        : shift.key === 'nuit'
                        ? 'NUIT'
                        : 'NUIT2',
                    quantite_dechargee:
                      quantite,
                    tonnage_decharge:
                      tonnage,
                    nombre_equipes:
                      nombreEquipes,
                  }),
                }
              )

            const donnees =
              await reponse.json()

            if (!reponse.ok) {
              throw new Error(
                donnees.detail ||
                donnees.produit_navire?.[0] ||
                donnees.quantite_dechargee?.[0] ||
                donnees.tonnage_decharge?.[0] ||
                'Impossible d’enregistrer le déchargement.'
              )
            }

            nouveauxDetails[
              detailKey
            ] = donnees.id
          }
        }
      }

      setDetails(
        nouveauxDetails
      )

      setMessageSuccesTableau(
        'Déchargement enregistré avec succès.'
      )

      if (
        typeof onFicheModifiee ===
        'function'
      ) {
        onFicheModifiee()
      }
    } catch (erreur) {
      setMessageErreurTableau(
        erreur.message
      )
    } finally {
      setEnregistrement(false)
    }
  }

    const supprimer = async () => {
    try {
      setSuppression(true)
      setMessageErreurTableau('')
      setMessageSuccesTableau('')

      const reponseDetails =
        await fetch(
          `${API_URL}/details-dechargement/`,
          {
            headers,
          }
        )

      if (reponseDetails.ok) {
        const tousLesDetails =
          await reponseDetails.json()

        const detailsDeLaFiche =
          tousLesDetails.filter(
            (detail) =>
              detail.fiche === fiche.id
          )

        for (
          const detail of detailsDeLaFiche
        ) {
          await fetch(
            `${API_URL}/details-dechargement/${detail.id}/`,
            {
              method: 'DELETE',
              headers,
            }
          )
        }
      }

      const reponse =
        await fetch(
          `${API_URL}/fiches-journalieres/${fiche.id}/`,
          {
            method: 'DELETE',
            headers,
          }
        )

      let donnees = {}

      if (
        reponse.status !== 204
      ) {
        try {
          donnees =
            await reponse.json()
        } catch {
          donnees = {}
        }
      }

      if (!reponse.ok) {
        throw new Error(
          donnees.detail ||
          'Impossible de supprimer le navire du suivi de la journée.'
        )
      }

      setAfficherConfirmationSuppression(false)

      if (
        typeof onSupprimer ===
        'function'
      ) {
        onSupprimer(fiche.id)
      }
    } catch (erreur) {
      setMessageErreurTableau(
        erreur.message
      )
    } finally {
      setSuppression(false)
    }
  }

  useImperativeHandle(ref, () => ({
    enregistrer,
  }))

  return (
    <div
      style={{
        marginTop: '20px',
        marginBottom: '30px',
      }}
    >
      <div
        style={{
          padding: '24px 28px',
          background: '#FFFFFF',
          borderRadius: '14px',
          border:
            '1px solid #E5E7EB',
          borderLeft: '5px solid #172F43',
          boxShadow:
            '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
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
          <span style={{ fontSize: '20px' }}>🚢</span>
          NAVIRE : {fiche.navire_nom}
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
              {fiche.date_fiche}
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
              {fiche.numero_escale}
            </div>
          </div>
        </div>

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
            {produitsSelectionnes.map(
              (produit) => (
                <div
                  key={
                    produit.produitNavireId
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap:
                      'wrap',
                    padding:
                      '12px 16px',
                    background:
                      '#F8F9FA',
                    borderRadius:
                      '9px',
                    border: '1px solid #EEF1F4',
                  }}
                >
                  <strong style={{ color: '#101828', minWidth: '110px' }}>
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
                      produit.quantiteManifeste
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
                      produit.tonnageManifeste
                    }
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {chargementDetails ? (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '10px',
          }}
        >
          Chargement des détails...
        </div>
      ) : (
        <div
          style={{
            marginTop: '20px',
          }}
        >
          <TableauFiche
            merchandises={
              merchandises
            }
            listeShifts={
              listeShifts
            }
            shifts={shifts}
            modifierValeur={
              modifierValeur
            }
            totalJour={{
              label: 'TOTAL JOUR',
              quantite:
                totalJour.quantite,
              tonnage:
                totalJour.tonnage,
            }}
            totalDech={{
              label: 'TOTAL DECH',
              quantite:
                totalDech.quantite,
              tonnage:
                totalDech.tonnage,
            }}
            resteABord={{
              label: 'RESTE À BORD',
              quantite:
                resteABord.quantite,
              tonnage:
                resteABord.tonnage,
            }}
            modifiable={
              !ficheSoumise
            }
          />

          {messageErreurTableau && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px 16px',
                background: '#FDECEC',
                color: '#B42318',
                border:
                  '1px solid #F5C2C0',
                borderRadius: '8px',
              }}
            >
              {messageErreurTableau}
            </div>
          )}

          {messageSuccesTableau && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px 16px',
                background: '#EAFaf0',
                color: '#16803A',
                border:
                  '1px solid #B7E4C7',
                borderRadius: '8px',
              }}
            >
              {messageSuccesTableau}
            </div>
          )}

                    {ficheSoumise ? (
            <div
              style={{
                marginTop: '18px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  padding: '14px 16px',
                  background: '#F8F9FA',
                  borderRadius: '8px',
                  color: '#667085',
                  fontWeight: '500',
                }}
              >
                Tableau non modifiable
              </div>

              <button
                type="button"
                onClick={() =>
                  setAfficherConfirmationSuppression(true)
                }
                style={{
                  padding: '11px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#B42318',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: '600',
                  boxShadow: '0 1px 2px rgba(16,24,40,0.08)',
                }}
              >
                Supprimer
              </button>
            </div>
          ) : (
            
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: '18px',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={
                  enregistrer
                }
                disabled={
                  enregistrement ||
                  suppression
                }
                style={{
                  padding:
                    '11px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  background:
                    '#172F43',
                  color:
                    '#FFFFFF',
                  cursor:
                    enregistrement ||
                    suppression
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    enregistrement ||
                    suppression
                      ? 0.7
                      : 1,
                  fontWeight:
                    '600',
                  boxShadow:
                    '0 1px 2px rgba(16,24,40,0.08)',
                }}
              >
                {enregistrement
                  ? 'Enregistrement...'
                  : 'Enregistrer'}
              </button>
            </div>
          )}

          {afficherConfirmationSuppression && (
            <ConfirmationSuppression
              navireNom={fiche.navire_nom}
              onAnnuler={() =>
                setAfficherConfirmationSuppression(false)
              }
              onConfirmer={supprimer}
              suppression={suppression}
            />
          )}
        </div>
      )}
    </div>
  )
})

function FicheJournaliere({
  onNavigate,
  onDeconnexion,
  dateFicheInitiale,
}) {
  const [navires, setNavires] =
    useState([])

  const [produits, setProduits] =
    useState([])

  const [navireActif, setNavireActif] =
    useState(null)

  const [dateFiche, setDateFiche] =
    useState(
      getDateAujourdhui()
    )

  const [fichesDuJour, setFichesDuJour] =
    useState([])

  const [produitsSelectionnes, setProduitsSelectionnes] =
    useState([])

  const [afficherSelectionProduits, setAfficherSelectionProduits] =
    useState(false)

  const [quantitesInitiales, setQuantitesInitiales] =
    useState({})

  const [tonnagesInitiaux, setTonnagesInitiaux] =
    useState({})

  const [numeroEscale, setNumeroEscale] =
    useState('')

  const [rechercheNavire, setRechercheNavire] =
    useState('')

  const [rechercheProduit, setRechercheProduit] =
    useState('')

  const [rechercheNouveauNavireNom, setRechercheNouveauNavireNom] =
    useState('')

  const [rechercheNouveauNavireProduit, setRechercheNouveauNavireProduit] =
    useState('')

  const [chargement, setChargement] =
    useState(true)

  const [chargementFiche, setChargementFiche] =
    useState(false)

  const [creationEnCours, setCreationEnCours] =
    useState(false)

  const [messageErreur, setMessageErreur] =
    useState('')

  const [messageErreurCreation, setMessageErreurCreation] =
    useState('')

  const [afficherAjoutNavire, setAfficherAjoutNavire] =
    useState(false)

  const [messageErreurAjoutNavire, setMessageErreurAjoutNavire] =
    useState('')

  const [nouveauNavireNom, setNouveauNavireNom] =
    useState('')

  const [nouveauNavireDate, setNouveauNavireDate] =
    useState(
      getDateAujourdhui()
    )

  const [nouveauNumeroEscale, setNouveauNumeroEscale] =
    useState('')

  const [nouveauxNavireProduits, setNouveauxNavireProduits] =
    useState([])

  const [nouveauxNavireQuantites, setNouveauxNavireQuantites] =
    useState({})

  const [nouveauxNavireTonnages, setNouveauxNavireTonnages] =
    useState({})

  const [ajoutNavireEnCours, setAjoutNavireEnCours] =
    useState(false)

  const [soumissionEnCours, setSoumissionEnCours] =
    useState(false)

  const [messageSoumission, setMessageSoumission] =
    useState('')

  const [messageErreurSoumission, setMessageErreurSoumission] =
    useState('')

  const [continuationProduits, setContinuationProduits] =
    useState({})

  const [escaleExistante, setEscaleExistante] =
    useState(false)

  const [continuationProduitsNouveauNavire, setContinuationProduitsNouveauNavire] =
    useState({})

  const blocRefs = useRef({})

  const token =
    sessionStorage.getItem('token')

  const headers = {
    'Content-Type':
      'application/json',
    Authorization: `Token ${token}`,
  }

  useEffect(() => {
  if (dateFicheInitiale) {
    setDateFiche(dateFicheInitiale)
    setMessageSoumission('')
    setMessageErreurSoumission('')
  }
}, [dateFicheInitiale])

  useEffect(() => {
    chargerDonneesInitiales()
  }, [])

  useEffect(() => {
    if (!dateFiche) {
      return
    }

    chargerFichesDuJour()
  }, [dateFiche])

  useEffect(() => {
    if (!navireActif) {
      return
    }

    const navireCourant =
      navires.find(
        (navire) =>
          navire.id === navireActif
      )

    if (navireCourant) {
      setRechercheNavire(
        navireCourant.nom_navire
      )
    }
  }, [navireActif, navires])

  useEffect(() => {
    if (!nouveauNavireNom) {
      return
    }

    const navireCourant =
      navires.find(
        (navire) =>
          String(navire.id) ===
          String(nouveauNavireNom)
      )

    if (navireCourant) {
      setRechercheNouveauNavireNom(
        navireCourant.nom_navire
      )
    }
  }, [nouveauNavireNom, navires])

  useEffect(() => {
    if (!navireActif || !numeroEscale) {
      setContinuationProduits({})
      setEscaleExistante(false)
      return
    }

    setContinuationProduits({})
    setEscaleExistante(false)

    recupererProduitsContinuation(
      navireActif,
      numeroEscale
    ).then((continuation) => {
      setContinuationProduits(
        continuation
      )
      setEscaleExistante(
        Object.keys(continuation).length > 0
      )
    })
  }, [navireActif, numeroEscale])

  useEffect(() => {
    if (!nouveauNavireNom || !nouveauNumeroEscale) {
      setContinuationProduitsNouveauNavire({})
      return
    }

    recupererProduitsContinuation(
      nouveauNavireNom,
      nouveauNumeroEscale
    ).then((continuation) => {
      setContinuationProduitsNouveauNavire(
        continuation
      )
    })
  }, [nouveauNavireNom, nouveauNumeroEscale])

  useEffect(() => {
    const clesContinuation =
      Object.keys(
        continuationProduits
      )

    if (
      clesContinuation.length ===
      0
    ) {
      return
    }

    setProduitsSelectionnes(
      (precedent) => {
        const dejaPresents =
          new Set(
            precedent.map(
              (produit) =>
                String(
                  produit.produitId
                )
            )
          )

        const nouveaux =
          clesContinuation
            .filter(
              (cle) =>
                !dejaPresents.has(
                  cle
                )
            )
            .map((cle) => {
              const produitCatalogue =
                produits.find(
                  (produit) =>
                    String(
                      produit.id
                    ) === cle
                )

              return {
                key: cle,
                label:
                  produitCatalogue
                    ? produitCatalogue.designation
                    : '',
                produitNavireId:
                  null,
                produitId:
                  Number(cle),
                quantiteManifeste:
                  continuationProduits[
                    cle
                  ].quantiteManifeste,
                tonnageManifeste:
                  continuationProduits[
                    cle
                  ].tonnageManifeste,
                totalDechargeQuantite:
                  continuationProduits[
                    cle
                  ].totalDechargeQuantite,
                totalDechargeTonnage:
                  continuationProduits[
                    cle
                  ].totalDechargeTonnage,
                resteABordQuantite:
                  continuationProduits[
                    cle
                  ].resteABordQuantite,
                resteABordTonnage:
                  continuationProduits[
                    cle
                  ].resteABordTonnage,
              }
            })

        return nouveaux.length >
          0
          ? [
              ...precedent,
              ...nouveaux,
            ]
          : precedent
      }
    )

    setQuantitesInitiales(
      (precedent) => {
        const copie = {
          ...precedent,
        }

        clesContinuation.forEach(
          (cle) => {
            if (
              copie[cle] ===
              undefined
            ) {
              copie[cle] =
                continuationProduits[
                  cle
                ].quantiteManifeste
            }
          }
        )

        return copie
      }
    )

    setTonnagesInitiaux(
      (precedent) => {
        const copie = {
          ...precedent,
        }

        clesContinuation.forEach(
          (cle) => {
            if (
              copie[cle] ===
              undefined
            ) {
              copie[cle] =
                continuationProduits[
                  cle
                ].tonnageManifeste
            }
          }
        )

        return copie
      }
    )
  }, [
    continuationProduits,
    produits,
  ])

  useEffect(() => {
    const clesContinuation =
      Object.keys(
        continuationProduitsNouveauNavire
      )

    if (
      clesContinuation.length ===
      0
    ) {
      return
    }

    setNouveauxNavireProduits(
      (precedent) => {
        const dejaPresents =
          new Set(precedent)

        const nouveaux =
          clesContinuation.filter(
            (cle) =>
              !dejaPresents.has(
                cle
              )
          )

        return nouveaux.length >
          0
          ? [
              ...precedent,
              ...nouveaux,
            ]
          : precedent
      }
    )

    setNouveauxNavireQuantites(
      (precedent) => {
        const copie = {
          ...precedent,
        }

        clesContinuation.forEach(
          (cle) => {
            if (
              copie[cle] ===
              undefined
            ) {
              copie[cle] =
                continuationProduitsNouveauNavire[
                  cle
                ].quantiteManifeste
            }
          }
        )

        return copie
      }
    )

    setNouveauxNavireTonnages(
      (precedent) => {
        const copie = {
          ...precedent,
        }

        clesContinuation.forEach(
          (cle) => {
            if (
              copie[cle] ===
              undefined
            ) {
              copie[cle] =
                continuationProduitsNouveauNavire[
                  cle
                ].tonnageManifeste
            }
          }
        )

        return copie
      }
    )
  }, [
    continuationProduitsNouveauNavire,
  ])

  const recupererProduitsContinuation =
    async (
      navireId,
      numeroEscaleSaisi
    ) => {
      if (
        !navireId ||
        !numeroEscaleSaisi
      ) {
        return {}
      }

      try {
        const [
          reponseFiches,
          reponseDetails,
        ] = await Promise.all([
          fetch(
            `${API_URL}/fiches-journalieres/`,
            {
              headers,
            }
          ),
          fetch(
            `${API_URL}/details-dechargement/`,
            {
              headers,
            }
          ),
        ])

        if (
          !reponseFiches.ok ||
          !reponseDetails.ok
        ) {
          return {}
        }

        const donnees =
          await reponseFiches.json()

        const tousLesDetails =
          await reponseDetails.json()

        const fichesMemeEscale =
          donnees
            .filter(
              (element) =>
                Number(
                  element.navire
                ) ===
                  Number(navireId) &&
                String(
                  element.numero_escale ||
                    ''
                ) ===
                  String(
                    numeroEscaleSaisi
                  )
            )
            .sort(
              (a, b) =>
                new Date(
                  b.date_fiche
                ) -
                new Date(
                  a.date_fiche
                )
            )

        if (
          fichesMemeEscale.length ===
          0
        ) {
          return {}
        }

        const produitsDerniereFiche =
          fichesMemeEscale[0]
            .produits ||
          []

        const continuation = {}

        produitsDerniereFiche.forEach(
          (produit) => {
            const produitId =
              String(
                produit.produit_id
              )

            let totalDechargeQuantite = 0
            let totalDechargeTonnage = 0

            fichesMemeEscale.forEach(
              (ficheHistorique) => {
                ;(
                  ficheHistorique.produits ||
                  []
                )
                  .filter(
                    (produitHistorique) =>
                      Number(
                        produitHistorique.produit_id
                      ) ===
                      Number(
                        produit.produit_id
                      )
                  )
                  .forEach(
                    (produitHistorique) => {
                      tousLesDetails
                        .filter(
                          (detail) =>
                            detail.fiche ===
                              ficheHistorique.id &&
                            Number(
                              detail.produit_navire
                            ) ===
                              Number(
                                produitHistorique.produit_navire
                              )
                        )
                        .forEach(
                          (detail) => {
                            totalDechargeQuantite +=
                              Number(
                                detail.quantite_dechargee
                              )

                            totalDechargeTonnage +=
                              Number(
                                detail.tonnage_decharge
                              )
                          }
                        )
                    }
                  )
              }
            )

            const quantiteManifeste =
              Number(
                produit.quantite_manifeste
              )

            const tonnageManifeste =
              Number(
                produit.tonnage_manifeste
              )

            continuation[
              produitId
            ] = {
              quantiteManifeste,
              tonnageManifeste,
              totalDechargeQuantite,
              totalDechargeTonnage,
              resteABordQuantite:
                Math.max(
                  0,
                  quantiteManifeste -
                    totalDechargeQuantite
                ),
              resteABordTonnage:
                Math.max(
                  0,
                  tonnageManifeste -
                    totalDechargeTonnage
                ),
            }
          }
        )

        return continuation
      } catch {
        return {}
      }
    }


  const chargerDonneesInitiales =
    async () => {
      try {
        setChargement(true)
        setMessageErreur('')

        const [
          reponseNavires,
          reponseProduits,
        ] = await Promise.all([
          fetch(
            `${API_URL}/navires/`,
            {
              headers,
            }
          ),
          fetch(
            `${API_URL}/produits/`,
            {
              headers,
            }
          ),
        ])

        if (!reponseNavires.ok) {
          throw new Error(
            'Impossible de récupérer les navires.'
          )
        }

        if (!reponseProduits.ok) {
          throw new Error(
            'Impossible de récupérer les produits.'
          )
        }

        const donneesNavires =
          await reponseNavires.json()

        const donneesProduits =
          await reponseProduits.json()

        setNavires(
          donneesNavires
        )

        setProduits(
          donneesProduits
        )
      } catch (erreur) {
        setMessageErreur(
          erreur.message
        )
      } finally {
        setChargement(false)
      }
    }

  const chargerFichesDuJour =
    async () => {
      if (!dateFiche) {
        return
      }

      try {
        setChargementFiche(true)
        setMessageErreur('')
        setMessageSoumission('')
        setMessageErreurSoumission('')

        const reponse =
          await fetch(
            `${API_URL}/fiches-journalieres/`,
            {
              headers,
            }
          )

        if (!reponse.ok) {
          throw new Error(
            'Impossible de récupérer les fiches journalières.'
          )
        }

        const donnees =
          await reponse.json()

        const fichesFiltrees =
          donnees.filter(
            (element) =>
              element.date_fiche ===
              dateFiche
          )

        setFichesDuJour(
          fichesFiltrees
        )
      } catch (erreur) {
        setMessageErreur(
          erreur.message
        )
      } finally {
        setChargementFiche(false)
      }
    }

  const selectionnerProduit = (
    produit
  ) => {
    const key =
      String(produit.id)

    const existe =
      produitsSelectionnes.some(
        (produitSelectionne) =>
          produitSelectionne.produitId ===
          produit.id
      )

    if (existe) {
      setProduitsSelectionnes(
        produitsSelectionnes.filter(
          (produitSelectionne) =>
            produitSelectionne.produitId !==
            produit.id
        )
      )

      setQuantitesInitiales(
        (precedent) => {
          const copie = {
            ...precedent,
          }

          delete copie[key]

          return copie
        }
      )

      setTonnagesInitiaux(
        (precedent) => {
          const copie = {
            ...precedent,
          }

          delete copie[key]

          return copie
        }
      )

      return
    }

    const continuation =
      continuationProduits[key]

    const nouveauProduit = {
      key,
      label:
        produit.designation,
      produitNavireId:
        null,
      produitId:
        produit.id,
      quantiteManifeste:
        continuation
          ? continuation.quantiteManifeste
          : '',
      tonnageManifeste:
        continuation
          ? continuation.tonnageManifeste
          : '',
      totalDechargeQuantite:
        continuation
          ? continuation.totalDechargeQuantite
          : 0,
      totalDechargeTonnage:
        continuation
          ? continuation.totalDechargeTonnage
          : 0,
      resteABordQuantite:
        continuation
          ? continuation.resteABordQuantite
          : 0,
      resteABordTonnage:
        continuation
          ? continuation.resteABordTonnage
          : 0,
    }

    setProduitsSelectionnes([
      ...produitsSelectionnes,
      nouveauProduit,
    ])

    setQuantitesInitiales(
      (precedent) => ({
        ...precedent,
        [key]: continuation
          ? continuation.quantiteManifeste
          : '',
      })
    )

    setTonnagesInitiaux(
      (precedent) => ({
        ...precedent,
        [key]: continuation
          ? continuation.tonnageManifeste
          : '',
      })
    )
  }

  const modifierQuantiteInitiale = (
    produitId,
    valeur
  ) => {
    setQuantitesInitiales(
      (precedent) => ({
        ...precedent,
        [produitId]:
          valeur === ''
            ? ''
            : Number(valeur),
      })
    )
  }

  const modifierTonnageInitial = (
    produitId,
    valeur
  ) => {
    setTonnagesInitiaux(
      (precedent) => ({
        ...precedent,
        [produitId]:
          valeur === ''
            ? ''
            : Number(valeur),
      })
    )
  }

  const creerFiche =
    async () => {
      if (!navireActif) {
        setMessageErreurCreation(
          'Veuillez sélectionner un navire.'
        )
        return
      }

      if (!dateFiche) {
        setMessageErreurCreation(
          'Veuillez sélectionner une date.'
        )
        return
      }

      if (!numeroEscale) {
        setMessageErreurCreation(
          'Veuillez saisir le numéro d’escale.'
        )
        return
      }

      if (
        produitsSelectionnes.length ===
        0
      ) {
        setMessageErreurCreation(
          'Veuillez sélectionner au moins un produit.'
        )
        return
      }

      try {
        setCreationEnCours(true)
        setMessageErreurCreation('')

        const produitsFiche =
          produitsSelectionnes.map(
            (produit) => {
              const continuation =
                continuationProduits[
                  produit.key
                ]

              return {
                produit:
                  produit.produitId,
                quantite_initiale:
                  continuation
                    ? continuation.quantiteManifeste
                    : quantitesInitiales[
                        produit.key
                      ] ?? 0,
                tonnage_initial:
                  continuation
                    ? continuation.tonnageManifeste
                    : tonnagesInitiaux[
                        produit.key
                      ] ?? 0,
              }
            }
          )

        const reponse =
          await fetch(
            `${API_URL}/fiches-journalieres/`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                date_fiche:
                  dateFiche,
                navire:
                  navireActif,
                numero_escale:
                  numeroEscale,
                produits:
                  produitsFiche,
              }),
            }
          )

        const donnees =
          await reponse.json()

        if (!reponse.ok) {
          throw new Error(
            donnees.detail ||
            donnees.navire?.[0] ||
            donnees.produits?.[0] ||
            'Impossible d’ajouter le tableau de déchargement au suivi de la journée.'
          )
        }

        setFichesDuJour(
          (precedentes) => [
            ...precedentes,
            donnees,
          ]
        )

        setProduitsSelectionnes([])
        setQuantitesInitiales({})
        setTonnagesInitiaux({})
        setNumeroEscale('')
        setAfficherSelectionProduits(false)
        setRechercheProduit('')
        setMessageErreurCreation('')
      } catch (erreur) {
        setMessageErreurCreation(
          erreur.message
        )
      } finally {
        setCreationEnCours(false)
      }
    }

  const ajouterAutreNavire =
    async () => {
      if (!nouveauNavireNom) {
        setMessageErreurAjoutNavire(
          'Veuillez sélectionner un navire.'
        )
        return
      }

      if (!nouveauNavireDate) {
        setMessageErreurAjoutNavire(
          'Veuillez sélectionner une date.'
        )
        return
      }

      if (!nouveauNumeroEscale) {
        setMessageErreurAjoutNavire(
          'Veuillez saisir le numéro d’escale.'
        )
        return
      }

      if (
        nouveauxNavireProduits.length ===
        0
      ) {
        setMessageErreurAjoutNavire(
          'Veuillez sélectionner au moins un produit.'
        )
        return
      }

      const produitsFiche =
        nouveauxNavireProduits.map(
          (produitId) => {
            const continuation =
              continuationProduitsNouveauNavire[
                produitId
              ]

            return {
              produit:
                Number(produitId),
              quantite_initiale:
                continuation
                  ? continuation.quantiteManifeste
                  : nouveauxNavireQuantites[
                      produitId
                    ] ?? 0,
              tonnage_initial:
                continuation
                  ? continuation.tonnageManifeste
                  : nouveauxNavireTonnages[
                      produitId
                    ] ?? 0,
            }
          }
        )

      for (
        const produitId of nouveauxNavireProduits
      ) {
        if (
          continuationProduitsNouveauNavire[
            produitId
          ]
        ) {
          continue
        }

        const quantite =
          nouveauxNavireQuantites[
            produitId
          ]

        const tonnage =
          nouveauxNavireTonnages[
            produitId
          ]

        if (
          quantite === '' ||
          quantite ===
            undefined ||
          Number.isNaN(
            Number(quantite)
          ) ||
          Number(quantite) < 0
        ) {
          setMessageErreurAjoutNavire(
            'Veuillez saisir une quantité manifeste valide pour chaque produit.'
          )
          return
        }

        if (
          tonnage === '' ||
          tonnage ===
            undefined ||
          Number.isNaN(
            Number(tonnage)
          ) ||
          Number(tonnage) < 0
        ) {
          setMessageErreurAjoutNavire(
            'Veuillez saisir un tonnage manifeste valide pour chaque produit.'
          )
          return
        }
      }

      try {
        setAjoutNavireEnCours(true)
        setMessageErreurAjoutNavire('')

        const navireId =
          Number(nouveauNavireNom)

        const navireFinal =
          navires.find(
            (navire) =>
              navire.id ===
              navireId
          )

        if (!navireFinal) {
          throw new Error(
            'Le navire sélectionné est introuvable.'
          )
        }

        const reponseFiches =
          await fetch(
            `${API_URL}/fiches-journalieres/`,
            {
              headers,
            }
          )

        if (!reponseFiches.ok) {
          throw new Error(
            'Impossible de vérifier les navires déjà présents pour cette journée.'
          )
        }

        const fichesExistantes =
          await reponseFiches.json()

        const navireDejaPresent =
          fichesExistantes.find(
            (element) =>
              element.navire ===
                navireId &&
              element.date_fiche ===
                nouveauNavireDate
          )

        if (navireDejaPresent) {
          throw new Error(
            `Le navire ${navireFinal.nom_navire} est déjà présent dans le suivi de la journée du ${nouveauNavireDate}.`
          )
        }

        const reponseCreationFiche =
          await fetch(
            `${API_URL}/fiches-journalieres/`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                date_fiche:
                  nouveauNavireDate,
                navire:
                  navireId,
                numero_escale:
                  nouveauNumeroEscale,
                produits:
                  produitsFiche,
              }),
            }
          )

        const donneesFiche =
          await reponseCreationFiche.json()

        if (
          !reponseCreationFiche.ok
        ) {
          throw new Error(
            donneesFiche.detail ||
            donneesFiche.navire?.[0] ||
            donneesFiche.produits?.[0] ||
            'Impossible d’ajouter le tableau de déchargement au suivi de la journée.'
          )
        }

        setFichesDuJour(
          (precedentes) => {
            if (
              donneesFiche.date_fiche ===
              dateFiche
            ) {
              return [
                ...precedentes,
                donneesFiche,
              ]
            }

            return precedentes
          }
        )

        setNouveauNavireNom('')
        setRechercheNouveauNavireNom('')
        setNouveauNavireDate(
          dateFiche
        )
        setNouveauNumeroEscale('')
        setNouveauxNavireProduits([])
        setNouveauxNavireQuantites({})
        setNouveauxNavireTonnages({})
        setRechercheNouveauNavireProduit('')
        setAfficherAjoutNavire(false)
        setMessageErreurAjoutNavire('')
      } catch (erreur) {
        setMessageErreurAjoutNavire(
          erreur.message
        )
      } finally {
        setAjoutNavireEnCours(false)
      }
    }

  const modifierNouveauNavireProduit =
    (produitId) => {
      const id =
        String(produitId)

      setNouveauxNavireProduits(
        (precedent) => {
          if (
            precedent.includes(id)
          ) {
            return precedent.filter(
              (element) =>
                element !== id
            )
          }

          return [
            ...precedent,
            id,
          ]
        }
      )

      if (
        nouveauxNavireProduits.includes(
          id
        )
      ) {
        setNouveauxNavireQuantites(
          (precedent) => {
            const copie = {
              ...precedent,
            }

            delete copie[id]

            return copie
          }
        )

        setNouveauxNavireTonnages(
          (precedent) => {
            const copie = {
              ...precedent,
            }

            delete copie[id]

            return copie
          }
        )
      } else {
        const continuation =
          continuationProduitsNouveauNavire[
            id
          ]

        setNouveauxNavireQuantites(
          (precedent) => ({
            ...precedent,
            [id]: continuation
              ? continuation.quantiteManifeste
              : '',
          })
        )

        setNouveauxNavireTonnages(
          (precedent) => ({
            ...precedent,
            [id]: continuation
              ? continuation.tonnageManifeste
              : '',
          })
        )
      }
    }

  const modifierNouveauNavireQuantite =
    (
      produitId,
      valeur
    ) => {
      const id =
        String(produitId)

      setNouveauxNavireQuantites(
        (precedent) => ({
          ...precedent,
          [id]: valeur,
        })
      )
    }

  const modifierNouveauNavireTonnage =
    (
      produitId,
      valeur
    ) => {
      const id =
        String(produitId)

      setNouveauxNavireTonnages(
        (precedent) => ({
          ...precedent,
          [id]: valeur,
        })
      )
    }

  const supprimerFicheDeLaListe =
    (ficheId) => {
      setFichesDuJour(
        (precedentes) =>
          precedentes.filter(
            (fiche) =>
              fiche.id !==
              ficheId
          )
      )
    }

  const soumettreFiche =
    async () => {
      if (
        fichesDuJour.length ===
        0
      ) {
        return
      }

      const dejaSoumise =
        fichesDuJour.every(
          (fiche) =>
            fiche.soumise
        )

      if (dejaSoumise) {
        setMessageSoumission(
          '✓ Fiche soumise'
        )
        return
      }

      try {
        setSoumissionEnCours(true)
        setMessageSoumission('')
        setMessageErreurSoumission('')

        for (
          const fiche of fichesDuJour
        ) {
          const blocRef =
            blocRefs.current[
              fiche.id
            ]

          if (
            blocRef &&
            typeof blocRef.enregistrer ===
              'function'
          ) {
            await blocRef.enregistrer()
          }
        }

        const reponse =
          await fetch(
            `${API_URL}/fiches-journalieres/soumettre/`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                date_fiche:
                  dateFiche,
              }),
            }
          )

        const donnees =
          await reponse.json()

        if (!reponse.ok) {
          throw new Error(
            donnees.detail ||
            'Impossible de soumettre la fiche journalière.'
          )
        }

        await chargerFichesDuJour()

        setAfficherAjoutNavire(false)
        setMessageSoumission(
          '✓ Fiche soumise'
        )
      } catch (erreur) {
        setMessageErreurSoumission(
          erreur.message
        )
      } finally {
        setSoumissionEnCours(false)
      }
    }

  const handleExportExcel = () => {
    console.log(
      'Export Excel'
    )
  }

  const exporterFichesExcel = async () => {
    try {
      setMessageErreurSoumission('')

      const reponseDetails =
        await fetch(
          `${API_URL}/details-dechargement/`,
          {
            headers,
          }
        )

      if (!reponseDetails.ok) {
        throw new Error(
          'Impossible de récupérer les données pour l’export.'
        )
      }

      const tousLesDetails =
        await reponseDetails.json()

      const echapper = (valeur) =>
        String(valeur ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')

      const listeShiftsExport = [
        'MATIN',
        'SOIR',
        'NUIT',
        'NUIT2',
      ]

      let contenu = ''

      fichesDuJour.forEach((ficheExport) => {
        const produitsExport =
          ficheExport.produits || []

        const detailsFiche =
          tousLesDetails.filter(
            (detail) =>
              detail.fiche ===
              ficheExport.id
          )

        contenu += `<table border="1">`
        contenu += `<tr><td colspan="${2 + produitsExport.length * 2}"><b>NAVIRE : ${echapper(ficheExport.navire_nom)}</b></td></tr>`
        contenu += `<tr><td colspan="${2 + produitsExport.length * 2}">Date : ${echapper(ficheExport.date_fiche)} | Numéro d'escale : ${echapper(ficheExport.numero_escale)}</td></tr>`

        contenu += `<tr><td colspan="${2 + produitsExport.length * 2}"><b>PRODUITS SÉLECTIONNÉS</b></td></tr>`
        contenu += `<tr><th colspan="2">Produit</th><th colspan="${produitsExport.length}">Quantité manifeste</th><th colspan="${produitsExport.length}">Tonnage manifeste</th></tr>`
        produitsExport.forEach((produit) => {
          contenu += `<tr><td colspan="2">${echapper(produit.designation)}</td><td colspan="${produitsExport.length}">${echapper(produit.quantite_manifeste)}</td><td colspan="${produitsExport.length}">${echapper(produit.tonnage_manifeste)}</td></tr>`
        })

        contenu += `<tr><th>SHIFT</th><th>NBR EQUIPES</th>`
        produitsExport.forEach((produit) => {
          contenu += `<th>Quantité ${echapper(produit.designation)}</th>`
          contenu += `<th>Tonnage ${echapper(produit.designation)}</th>`
        })
        contenu += `</tr>`

        const totauxQuantite = {}
        const totauxTonnage = {}

        listeShiftsExport.forEach((shiftExport) => {
          const detailsShift =
            detailsFiche.filter(
              (detail) =>
                detail.shift ===
                shiftExport
            )

          const nombreEquipes =
            detailsShift.length > 0
              ? detailsShift[0].nombre_equipes
              : 0

          contenu += `<tr><td>${shiftExport}</td><td>${echapper(nombreEquipes)}</td>`

          produitsExport.forEach((produit) => {
            const detail =
              detailsShift.find(
                (element) =>
                  Number(
                    element.produit_navire
                  ) ===
                  Number(
                    produit.produit_navire
                  )
              )

            const quantite =
              detail
                ? Number(detail.quantite_dechargee)
                : 0

            const tonnage =
              detail
                ? Number(detail.tonnage_decharge)
                : 0

            totauxQuantite[produit.produit_navire] =
              (totauxQuantite[produit.produit_navire] || 0) +
              quantite

            totauxTonnage[produit.produit_navire] =
              (totauxTonnage[produit.produit_navire] || 0) +
              tonnage

            contenu += `<td>${quantite}</td><td>${tonnage}</td>`
          })

          contenu += `</tr>`
        })

        contenu += `<tr><td colspan="2"><b>TOTAL JOUR</b></td>`
        produitsExport.forEach((produit) => {
          contenu += `<td><b>${totauxQuantite[produit.produit_navire] || 0}</b></td>`
          contenu += `<td><b>${totauxTonnage[produit.produit_navire] || 0}</b></td>`
        })
        contenu += `</tr>`

        contenu += `<tr><td colspan="2"><b>TOTAL DECH</b></td>`
        produitsExport.forEach((produit) => {
          contenu += `<td><b>${echapper(produit.total_decharge_quantite)}</b></td>`
          contenu += `<td><b>${echapper(produit.total_decharge_tonnage)}</b></td>`
        })
        contenu += `</tr>`

        contenu += `<tr><td colspan="2"><b>RESTE À BORD</b></td>`
        produitsExport.forEach((produit) => {
          contenu += `<td><b>${echapper(produit.reste_a_bord_quantite)}</b></td>`
          contenu += `<td><b>${echapper(produit.reste_a_bord_tonnage)}</b></td>`
        })
        contenu += `</tr>`

        contenu += `</table><br/>`
      })

      const documentHtml =
        `<html><head><meta charset="UTF-8"></head><body>${contenu}</body></html>`

      const blob = new Blob(
        ['\ufeff', documentHtml],
        {
          type:
            'application/vnd.ms-excel;charset=utf-8;',
        }
      )

      const url =
        URL.createObjectURL(blob)

      const lien =
        document.createElement('a')

      lien.href = url
      lien.download =
        `fiche-journaliere-${dateFiche}.xls`

      document.body.appendChild(lien)
      lien.click()
      document.body.removeChild(lien)

      URL.revokeObjectURL(url)
    } catch (erreur) {
      setMessageErreurSoumission(
        erreur.message
      )
    }
  }

  const naviresPourHeader =
    navires.map(
      (navire) => ({
        key: navire.id,
        label: navire.nom_navire,
      })
    )

  const ficheDuJourEstSoumise =
    fichesDuJour.length > 0 &&
    fichesDuJour.every(
      (fiche) =>
        fiche.soumise
    )

  if (chargement) {
    return (
      <div
        style={{
          padding: '30px',
          background: '#F5F7FA',
          minHeight: '100%',
        }}
      >
        Chargement...
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '30px',
        background: '#F5F7FA',
        minHeight: '100%',
      }}
    >
      <FicheHeader
        navires={
          naviresPourHeader
        }
        navireActifKey={
          navireActif
        }
        onSelectNavire={
          setNavireActif
        }
        onExporterExcel={
          handleExportExcel
        }
        onDeconnexion={
          onDeconnexion
        }
      />

      {messageErreur && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#FDECEC',
            color: '#B42318',
            border:
              '1px solid #F5C2C0',
            borderRadius: '8px',
          }}
        >
          {messageErreur}
        </div>
      )}

      {chargementFiche ? (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '10px',
          }}
        >
          Chargement de la fiche...
        </div>
      ) : fichesDuJour.length ===
        0 ? (
        <div
          style={{
            marginTop: '20px',
            padding: '30px',
            background: '#FFFFFF',
            borderRadius: '14px',
            border:
              '1px solid #E5E7EB',
            boxShadow:
              '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
          }}
        >
          {messageSoumission && (
            <div
              style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: '#EAFaf0',
                color: '#16803A',
                border:
                  '1px solid #B7E4C7',
                borderRadius: '8px',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {messageSoumission}
            </div>
          )}

          <h2
            style={{
              marginTop: 0,
              marginBottom: '26px',
              fontSize: '22px',
              fontWeight: '700',
              color: '#101828',
              paddingBottom: '16px',
              borderBottom: '1px solid #EAECF0',
            }}
          >
            Créer une fiche journalière
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: '500',
                }}
              >
                Date
              </label>

              <input
                type="date"
                value={dateFiche}
                onChange={(e) => {
                  setDateFiche(
                    e.target.value
                  )
                  setMessageErreurCreation('')
                  setMessageSoumission('')
                }}
                style={{
                  padding:
                    '10px 12px',
                  border:
                    '1px solid #D0D5DD',
                  borderRadius: '7px',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: '500',
                }}
              >
                Navire
              </label>

              <input
                type="text"
                placeholder="Sélectionner navire"
                value={rechercheNavire}
                onChange={(e) => {
                  setRechercheNavire(
                    e.target.value
                  )
                  setMessageErreurCreation('')
                }}
                style={{
                  width: '100%',
                  padding:
                    '10px 12px',
                  border:
                    '1px solid #D0D5DD',
                  borderRadius: '7px',
                  boxSizing:
                    'border-box',
                  marginBottom:
                    '8px',
                }}
              />

              <div
                style={{
                  border:
                    '1px solid #D0D5DD',
                  borderRadius: '7px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  background:
                    '#FFFFFF',
                }}
              >
                {navires
                  .filter((navire) =>
                    navire.nom_navire
                      .toLowerCase()
                      .includes(
                        rechercheNavire.toLowerCase()
                      )
                  )
                  .map((navire) => (
                    <div
                      key={
                        navire.id
                      }
                      onClick={() => {
                        setNavireActif(
                          navire.id
                        )
                        setRechercheNavire(
                          navire.nom_navire
                        )
                        setMessageErreurCreation('')
                      }}
                      style={{
                        padding:
                          '10px 12px',
                        cursor:
                          'pointer',
                        borderBottom:
                          '1px solid #F0F0F0',
                        background:
                          navireActif ===
                          navire.id
                            ? '#F5F9FF'
                            : '#FFFFFF',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '10px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          navireActif ===
                          navire.id
                        }
                        onChange={() => {}}
                        style={{
                          cursor:
                            'pointer',
                        }}
                      />

                      <span
                        style={{
                          color: '#101828',
                          fontWeight: '500',
                        }}
                      >
                        {
                          navire.nom_navire
                        }
                      </span>
                    </div>
                  ))}

                {navires.filter(
                  (navire) =>
                    navire.nom_navire
                      .toLowerCase()
                      .includes(
                        rechercheNavire.toLowerCase()
                      )
                ).length ===
                  0 && (
                  <div
                    style={{
                      padding:
                        '12px',
                      color:
                        '#667085',
                    }}
                  >
                    Aucun navire trouvé.
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: '500',
                }}
              >
                Numéro d'escale
              </label>

              <input
                type="text"
                placeholder="Saisir le numéro d'escale"
                value={numeroEscale}
                onChange={(e) => {
                  setNumeroEscale(
                    e.target.value
                  )
                  setMessageErreurCreation('')
                }}
                style={{
                  padding:
                    '10px 12px',
                  border:
                    '1px solid #D0D5DD',
                  borderRadius: '7px',
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: '10px',
                fontWeight: '500',
              }}
            >
              Sélectionner les produits
            </label>

            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={rechercheProduit}
              onChange={(e) =>
                setRechercheProduit(
                  e.target.value
                )
              }
              style={{
                width: '100%',
                padding:
                  '10px 12px',
                border:
                  '1px solid #D0D5DD',
                borderRadius: '7px',
                boxSizing:
                  'border-box',
                marginBottom:
                  '10px',
              }}
            />

            <div
              style={{
                border:
                  '1px solid #D0D5DD',
                borderRadius: '7px',
                maxHeight: '220px',
                overflowY: 'auto',
                background:
                  '#FFFFFF',
              }}
            >
              {produits
                .filter((produit) =>
                  produit.designation
                    .toLowerCase()
                    .includes(
                      rechercheProduit.toLowerCase()
                    )
                )
                .map((produit) => {
                  const estSelectionne =
                    produitsSelectionnes.some(
                      (
                        produitSelectionne
                      ) =>
                        produitSelectionne.produitId ===
                        produit.id
                    )

                  return (
                    <div
                      key={
                        produit.id
                      }
                      onClick={() => {
                        selectionnerProduit(
                          produit
                        )
                        setMessageErreurCreation('')
                      }}
                      style={{
                        padding:
                          '10px 12px',
                        cursor:
                          'pointer',
                        borderBottom:
                          '1px solid #F0F0F0',
                        background:
                          estSelectionne
                            ? '#F5F9FF'
                            : '#FFFFFF',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '10px',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          estSelectionne
                        }
                        onChange={() => {}}
                        style={{
                          cursor:
                            'pointer',
                        }}
                      />

                      <span>
                        {
                          produit.designation
                        }
                      </span>
                    </div>
                  )
                })}

              {produits.filter(
                (produit) =>
                  produit.designation
                    .toLowerCase()
                    .includes(
                      rechercheProduit.toLowerCase()
                    )
              ).length ===
                0 && (
                <div
                  style={{
                    padding:
                      '12px',
                    color:
                      '#667085',
                  }}
                >
                  Aucun produit trouvé.
                </div>
              )}
            </div>

            {produitsSelectionnes.length >
              0 && (
              <div
                style={{
                  marginTop:
                    '16px',
                }}
              >
                <label
                  style={{
                    display:
                      'block',
                    marginBottom:
                      '10px',
                    fontWeight:
                      '500',
                  }}
                >
                  Produits sélectionnés
                </label>

                <div
                  style={{
                    display:
                      'flex',
                    flexDirection:
                      'column',
                    gap: '12px',
                  }}
                >
                  {produitsSelectionnes.map(
                    (produit) => {
                      const key =
                        String(
                          produit.produitId
                        )

                      const estContinuation =
                        Boolean(
                          continuationProduits[
                            key
                          ]
                        )

                      return (
                        <div
                          key={
                            produit.produitId
                          }
                          style={{
                            padding:
                              '14px',
                            border:
                              '1px solid #8EBBFF',
                            borderRadius:
                              '8px',
                            background:
                              '#F5F9FF',
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              justifyContent:
                                'space-between',
                              gap:
                                '15px',
                              flexWrap:
                                'wrap',
                            }}
                          >
                            <span
                              style={{
                                fontWeight:
                                  '500',
                              }}
                            >
                              {
                                produit.label
                              }
                              {estContinuation && (
                                <span
                                  style={{
                                    marginLeft:
                                      '8px',
                                    fontSize:
                                      '12px',
                                    fontWeight:
                                      '600',
                                    color:
                                      '#16803A',
                                  }}
                                >
                                  (Suite du déchargement précédent)
                                </span>
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                selectionnerProduit(
                                  {
                                    id:
                                      produit.produitId,
                                    designation:
                                      produit.label,
                                  }
                                )
                              }
                              style={{
                                padding:
                                  '6px 10px',
                                border:
                                  '1px solid #D0D5DD',
                                borderRadius:
                                  '6px',
                                background:
                                  '#FFFFFF',
                                color:
                                  '#344054',
                                cursor:
                                  'pointer',
                              }}
                            >
                              Retirer
                            </button>
                          </div>

                          <div
                            style={{
                              display:
                                'flex',
                              gap:
                                '15px',
                              marginTop:
                                '12px',
                              flexWrap:
                                'wrap',
                            }}
                          >
                            <div>
                              <label
                                style={{
                                  display:
                                    'block',
                                  marginBottom:
                                    '5px',
                                  fontSize:
                                    '14px',
                                }}
                              >
                                Quantité manifeste
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  estContinuation
                                    ? continuationProduits[key].quantiteManifeste
                                    : quantitesInitiales[key] ?? ''
                                }
                                onChange={(
                                  e
                                ) =>
                                  modifierQuantiteInitiale(
                                    key,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  estContinuation
                                }
                                style={{
                                  padding:
                                    '8px 10px',
                                  border:
                                    '1px solid #D0D5DD',
                                  borderRadius:
                                    '6px',
                                  width:
                                    '160px',
                                  background:
                                    estContinuation
                                      ? '#F0F0F0'
                                      : '#FFFFFF',
                                }}
                              />
                            </div>

                            <div>
                              <label
                                style={{
                                  display:
                                    'block',
                                  marginBottom:
                                    '5px',
                                  fontSize:
                                    '14px',
                                }}
                              >
                                Tonnage manifeste
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  estContinuation
                                    ? continuationProduits[key].tonnageManifeste
                                    : tonnagesInitiaux[key] ?? ''
                                }
                                onChange={(
                                  e
                                ) =>
                                  modifierTonnageInitial(
                                    key,
                                    e
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  estContinuation
                                }
                                style={{
                                  padding:
                                    '8px 10px',
                                  border:
                                    '1px solid #D0D5DD',
                                  borderRadius:
                                    '6px',
                                  width:
                                    '160px',
                                  background:
                                    estContinuation
                                      ? '#F0F0F0'
                                      : '#FFFFFF',
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={
              creerFiche
            }
            disabled={
              creationEnCours
            }
            style={{
              marginTop: '28px',
              padding:
                '12px 26px',
              border: 'none',
              borderRadius:
                '9px',
              background:
                '#172F43',
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '15px',
              cursor:
                creationEnCours
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                creationEnCours
                  ? 0.7
                  : 1,
              boxShadow:
                '0 1px 3px rgba(16,24,40,0.15)',
            }}
          >
            {creationEnCours
              ? 'Création...'
              : 'Créer la fiche'}
          </button>

          {messageErreurCreation && (
            <div
              style={{
                marginTop: '10px',
                padding: '12px 16px',
                background: '#FDECEC',
                color: '#B42318',
                border:
                  '1px solid #F5C2C0',
                borderRadius:
                  '8px',
              }}
            >
              {
                messageErreurCreation
              }
            </div>
          )}
        </div>
      ) : (
        <>
          {fichesDuJour.map(
            (ficheDuJour, indexFiche) => (
              <Fragment
                key={
                  ficheDuJour.id
                }
              >
                <BlocNavire
                  ref={(element) => {
                    blocRefs.current[
                      ficheDuJour.id
                    ] = element
                  }}
                  fiche={
                    ficheDuJour
                  }
                  onSupprimer={
                    supprimerFicheDeLaListe
                  }
                  onFicheModifiee={
                    () => {}
                  }
                />

                {fichesDuJour.length - 1 >
                  indexFiche && (
                  <div
                    style={{
                      height: '1px',
                      background:
                        'linear-gradient(90deg, transparent, #D0D5DD 15%, #D0D5DD 85%, transparent)',
                      margin: '4px 0 26px 0',
                    }}
                  />
                )}
              </Fragment>
            )
          )}

          {!ficheDuJourEstSoumise && (
            <>
              <div
                style={{
                  marginTop: '20px',
                  marginBottom: '20px',
                  textAlign: 'center',
                }}
              >
                {!afficherAjoutNavire ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAfficherAjoutNavire(
                        true
                      )
                      setNouveauNavireDate(
                        dateFiche
                      )
                      setNouveauNumeroEscale(
                        ''
                      )
                      setNouveauNavireNom(
                        ''
                      )
                      setRechercheNouveauNavireNom(
                        ''
                      )
                      setMessageErreurAjoutNavire(
                        ''
                      )
                    }}
                    style={{
                      padding:
                        '12px 26px',
                      border:
                        'none',
                      borderRadius:
                        '9px',
                      background:
                        '#172F43',
                      color:
                        '#FFFFFF',
                      cursor:
                        'pointer',
                      fontWeight:
                        '600',
                      fontSize:
                        '15px',
                      boxShadow:
                        '0 1px 3px rgba(16,24,40,0.15)',
                    }}
                  >
                    + Ajouter un tableau de déchargement
                  </button>
                ) : (
                  <div
                    style={{
                      padding: '30px',
                      background:
                        '#FFFFFF',
                      borderRadius:
                        '14px',
                      border:
                        '1px solid #E5E7EB',
                      boxShadow:
                        '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
                      textAlign:
                        'left',
                    }}
                  >
                    <h2
                      style={{
                        marginTop: 0,
                        marginBottom:
                          '26px',
                        fontSize:
                          '22px',
                        fontWeight:
                          '700',
                        color:
                          '#101828',
                        paddingBottom:
                          '16px',
                        borderBottom:
                          '1px solid #EAECF0',
                      }}
                    >
                      Ajouter un tableau de déchargement
                    </h2>

                    <div
                      style={{
                        display:
                          'flex',
                        flexDirection:
                          'column',
                        gap: '20px',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display:
                              'block',
                            marginBottom:
                              '7px',
                            fontWeight:
                              '500',
                          }}
                        >
                          Date
                        </label>

                        <input
                          type="date"
                          value={
                            nouveauNavireDate
                          }
                          onChange={(e) => {
                            setNouveauNavireDate(
                              e.target.value
                            )
                            setMessageErreurAjoutNavire(
                              ''
                            )
                          }}
                          style={{
                            padding:
                              '10px 12px',
                            border:
                              '1px solid #D0D5DD',
                            borderRadius:
                              '7px',
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display:
                              'block',
                            marginBottom:
                              '7px',
                            fontWeight:
                              '500',
                          }}
                        >
                          Nom du navire
                        </label>

                        <input
                          type="text"
                          placeholder="Sélectionner navire"
                          value={
                            rechercheNouveauNavireNom
                          }
                          onChange={(e) => {
                            setRechercheNouveauNavireNom(
                              e.target.value
                            )
                            setMessageErreurAjoutNavire(
                              ''
                            )
                          }}
                          style={{
                            width:
                              '100%',
                            padding:
                              '10px 12px',
                            border:
                              '1px solid #D0D5DD',
                            borderRadius:
                              '7px',
                            boxSizing:
                              'border-box',
                            marginBottom:
                              '8px',
                          }}
                        />

                        <div
                          style={{
                            border:
                              '1px solid #D0D5DD',
                            borderRadius:
                              '7px',
                            maxHeight:
                              '160px',
                            overflowY:
                              'auto',
                            background:
                              '#FFFFFF',
                          }}
                        >
                          {navires
                            .filter(
                              (navire) =>
                                navire.nom_navire
                                  .toLowerCase()
                                  .includes(
                                    rechercheNouveauNavireNom.toLowerCase()
                                  )
                            )
                            .map(
                              (navire) => (
                                <div
                                  key={
                                    navire.id
                                  }
                                  onClick={() => {
                                    setNouveauNavireNom(
                                      navire.id
                                    )
                                    setRechercheNouveauNavireNom(
                                      navire.nom_navire
                                    )
                                    setMessageErreurAjoutNavire(
                                      ''
                                    )
                                  }}
                                  style={{
                                    padding:
                                      '10px 12px',
                                    cursor:
                                      'pointer',
                                    borderBottom:
                                      '1px solid #F0F0F0',
                                    background:
                                      String(
                                        nouveauNavireNom
                                      ) ===
                                      String(
                                        navire.id
                                      )
                                        ? '#F5F9FF'
                                        : '#FFFFFF',
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    gap:
                                      '10px',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      String(
                                        nouveauNavireNom
                                      ) ===
                                      String(
                                        navire.id
                                      )
                                    }
                                    onChange={() => {}}
                                    style={{
                                      cursor:
                                        'pointer',
                                    }}
                                  />

                                  <span>
                                    {
                                      navire.nom_navire
                                    }
                                  </span>
                                </div>
                              )
                            )}

                          {navires.filter(
                            (navire) =>
                              navire.nom_navire
                                .toLowerCase()
                                .includes(
                                  rechercheNouveauNavireNom.toLowerCase()
                                )
                          ).length ===
                            0 && (
                            <div
                              style={{
                                padding:
                                  '12px',
                                color:
                                  '#667085',
                              }}
                            >
                              Aucun navire trouvé.
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label
                          style={{
                            display:
                              'block',
                            marginBottom:
                              '7px',
                            fontWeight:
                              '500',
                          }}
                        >
                          Numéro d'escale
                        </label>

                        <input
                          type="text"
                          placeholder="Saisir le numéro d'escale"
                          value={
                            nouveauNumeroEscale
                          }
                          onChange={(e) => {
                            setNouveauNumeroEscale(
                              e.target.value
                            )
                            setMessageErreurAjoutNavire(
                              ''
                            )
                          }}
                          style={{
                            padding:
                              '10px 12px',
                            border:
                              '1px solid #D0D5DD',
                            borderRadius:
                              '7px',
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop:
                          '24px',
                      }}
                    >
                      <label
                        style={{
                          display:
                            'block',
                          marginBottom:
                            '10px',
                          fontWeight:
                            '500',
                        }}
                      >
                        Sélectionner les produits
                      </label>

                      <input
                        type="text"
                        placeholder="Rechercher un produit..."
                        value={
                          rechercheNouveauNavireProduit
                        }
                        onChange={(e) =>
                          setRechercheNouveauNavireProduit(
                            e.target.value
                          )
                        }
                        style={{
                          width:
                            '100%',
                          padding:
                            '10px 12px',
                          border:
                            '1px solid #D0D5DD',
                          borderRadius:
                            '7px',
                          boxSizing:
                            'border-box',
                          marginBottom:
                            '10px',
                        }}
                      />

                      <div
                        style={{
                          border:
                            '1px solid #D0D5DD',
                          borderRadius:
                            '7px',
                          maxHeight:
                            '220px',
                          overflowY:
                            'auto',
                          background:
                            '#FFFFFF',
                        }}
                      >
                        {produits
                          .filter(
                            (produit) =>
                              produit.designation
                                .toLowerCase()
                                .includes(
                                  rechercheNouveauNavireProduit.toLowerCase()
                                )
                          )
                          .map(
                            (produit) => {
                              const produitId =
                                String(
                                  produit.id
                                )

                              const estSelectionne =
                                nouveauxNavireProduits.includes(
                                  produitId
                                )

                              return (
                                <div
                                  key={
                                    produit.id
                                  }
                                  onClick={() => {
                                    modifierNouveauNavireProduit(
                                      produitId
                                    )
                                    setMessageErreurAjoutNavire(
                                      ''
                                    )
                                  }}
                                  style={{
                                    padding:
                                      '10px 12px',
                                    cursor:
                                      'pointer',
                                    borderBottom:
                                      '1px solid #F0F0F0',
                                    background:
                                      estSelectionne
                                        ? '#F5F9FF'
                                        : '#FFFFFF',
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    gap:
                                      '10px',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      estSelectionne
                                    }
                                    onChange={() => {}}
                                    style={{
                                      cursor:
                                        'pointer',
                                    }}
                                  />

                                  <span>
                                    {
                                      produit.designation
                                    }
                                  </span>
                                </div>
                              )
                            }
                          )}

                        {produits.filter(
                          (produit) =>
                            produit.designation
                              .toLowerCase()
                              .includes(
                                rechercheNouveauNavireProduit.toLowerCase()
                              )
                        ).length ===
                          0 && (
                          <div
                            style={{
                              padding:
                                '12px',
                              color:
                                '#667085',
                            }}
                          >
                            Aucun produit trouvé.
                          </div>
                        )}
                      </div>

                      {nouveauxNavireProduits.length >
                        0 && (
                        <div
                          style={{
                            marginTop:
                              '16px',
                          }}
                        >
                          <label
                            style={{
                              display:
                                'block',
                              marginBottom:
                                '10px',
                              fontWeight:
                                '500',
                            }}
                          >
                            Produits sélectionnés
                          </label>

                          <div
                            style={{
                              display:
                                'flex',
                              flexDirection:
                                'column',
                              gap:
                                '12px',
                            }}
                          >
                            {nouveauxNavireProduits.map(
                              (
                                produitId
                              ) => {
                                const produit =
                                  produits.find(
                                    (
                                      element
                                    ) =>
                                      String(
                                        element.id
                                      ) ===
                                      String(
                                        produitId
                                      )
                                  )

                                if (!produit) {
                                  return null
                                }

                                const estContinuation =
                                  Boolean(
                                    continuationProduitsNouveauNavire[
                                      produitId
                                    ]
                                  )

                                return (
                                  <div
                                    key={
                                      produit.id
                                    }
                                    style={{
                                      padding:
                                        '14px',
                                      border:
                                        '1px solid #8EBBFF',
                                      borderRadius:
                                        '8px',
                                      background:
                                        '#F5F9FF',
                                    }}
                                  >
                                    <div
                                      style={{
                                        display:
                                          'flex',
                                        alignItems:
                                          'center',
                                        justifyContent:
                                          'space-between',
                                        gap:
                                          '15px',
                                        flexWrap:
                                          'wrap',
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight:
                                            '500',
                                        }}
                                      >
                                        {
                                          produit.designation
                                        }
                                        {estContinuation && (
                                          <span
                                            style={{
                                              marginLeft:
                                                '8px',
                                              fontSize:
                                                '12px',
                                              fontWeight:
                                                '600',
                                              color:
                                                '#16803A',
                                            }}
                                          >
                                            (Suite du déchargement précédent)
                                          </span>
                                        )}
                                      </span>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          modifierNouveauNavireProduit(
                                            String(
                                              produit.id
                                            )
                                          )
                                          setMessageErreurAjoutNavire(
                                            ''
                                          )
                                        }}
                                        style={{
                                          padding:
                                            '6px 10px',
                                          border:
                                            '1px solid #D0D5DD',
                                          borderRadius:
                                            '6px',
                                          background:
                                            '#FFFFFF',
                                          color:
                                            '#344054',
                                          cursor:
                                            'pointer',
                                        }}
                                      >
                                        Retirer
                                      </button>
                                    </div>

                                    <div
                                      style={{
                                        display:
                                          'flex',
                                        gap:
                                          '15px',
                                        marginTop:
                                          '12px',
                                        flexWrap:
                                          'wrap',
                                      }}
                                    >
                                      <div>
                                        <label
                                          style={{
                                            display:
                                              'block',
                                            marginBottom:
                                              '5px',
                                            fontSize:
                                              '14px',
                                          }}
                                        >
                                          Quantité manifeste
                                        </label>

                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={
                                            estContinuation
                                              ? continuationProduitsNouveauNavire[produitId].quantiteManifeste
                                              : nouveauxNavireQuantites[produitId] ?? ''
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            modifierNouveauNavireQuantite(
                                              produitId,
                                              e
                                                .target
                                                .value
                                            )
                                          }
                                          disabled={
                                            estContinuation
                                          }
                                          style={{
                                            padding:
                                              '8px 10px',
                                            border:
                                              '1px solid #D0D5DD',
                                            borderRadius:
                                              '6px',
                                            width:
                                              '160px',
                                            background:
                                              estContinuation
                                                ? '#F0F0F0'
                                                : '#FFFFFF',
                                          }}
                                        />
                                      </div>

                                      <div>
                                        <label
                                          style={{
                                            display:
                                              'block',
                                            marginBottom:
                                              '5px',
                                            fontSize:
                                              '14px',
                                          }}
                                        >
                                          Tonnage manifeste
                                        </label>

                                        <input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          value={
                                            estContinuation
                                              ? continuationProduitsNouveauNavire[produitId].tonnageManifeste
                                              : nouveauxNavireTonnages[produitId] ?? ''
                                          }
                                          onChange={(
                                            e
                                          ) =>
                                            modifierNouveauNavireTonnage(
                                              produitId,
                                              e
                                                .target
                                                .value
                                            )
                                          }
                                          disabled={
                                            estContinuation
                                          }
                                          style={{
                                            padding:
                                              '8px 10px',
                                            border:
                                              '1px solid #D0D5DD',
                                            borderRadius:
                                              '6px',
                                            width:
                                              '160px',
                                            background:
                                              estContinuation
                                                ? '#F0F0F0'
                                                : '#FFFFFF',
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              }
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display:
                          'flex',
                        gap: '10px',
                        marginTop:
                          '24px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={
                          ajouterAutreNavire
                        }
                        disabled={
                          ajoutNavireEnCours
                        }
                        style={{
                          padding:
                            '12px 26px',
                          border:
                            'none',
                          borderRadius:
                            '9px',
                          background:
                            '#172F43',
                          color:
                            '#FFFFFF',
                          cursor:
                            ajoutNavireEnCours
                              ? 'not-allowed'
                              : 'pointer',
                          opacity:
                            ajoutNavireEnCours
                              ? 0.7
                              : 1,
                          fontWeight:
                            '600',
                          fontSize:
                            '15px',
                          boxShadow:
                            '0 1px 3px rgba(16,24,40,0.15)',
                        }}
                      >
                        {ajoutNavireEnCours
                          ? 'Création...'
                          : 'Ajouter le tableau de déchargement'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAfficherAjoutNavire(
                            false
                          )
                          setMessageErreurAjoutNavire(
                            ''
                          )
                        }}
                        disabled={
                          ajoutNavireEnCours
                        }
                        style={{
                          padding:
                            '12px 26px',
                          border:
                            '1px solid #D0D5DD',
                          borderRadius:
                            '9px',
                          background:
                            '#FFFFFF',
                          color:
                            '#344054',
                          fontWeight:
                            '600',
                          fontSize:
                            '15px',
                          cursor:
                            ajoutNavireEnCours
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                      >
                        Annuler
                      </button>
                    </div>

                    {messageErreurAjoutNavire && (
                      <div
                        style={{
                          marginTop:
                            '10px',
                          padding:
                            '12px 16px',
                          background:
                            '#FDECEC',
                          color:
                            '#B42318',
                          border:
                            '1px solid #F5C2C0',
                          borderRadius:
                            '8px',
                        }}
                      >
                        {
                          messageErreurAjoutNavire
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!afficherAjoutNavire && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'center',
                    marginBottom:
                      '30px',
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      soumettreFiche
                    }
                    disabled={
                      soumissionEnCours
                    }
                    style={{
                      padding:
                        '13px 34px',
                      border: 'none',
                      borderRadius:
                        '9px',
                      background:
                        '#172F43',
                      color:
                        '#FFFFFF',
                      cursor:
                        soumissionEnCours
                          ? 'not-allowed'
                          : 'pointer',
                      fontWeight:
                        '700',
                      fontSize:
                        '15px',
                      letterSpacing:
                        '0.03em',
                      opacity:
                        soumissionEnCours
                          ? 0.7
                          : 1,
                      boxShadow:
                        '0 1px 3px rgba(16,24,40,0.2)',
                    }}
                  >
                    {soumissionEnCours
                      ? 'Soumission...'
                      : 'SOUMETTRE'}
                  </button>
                </div>
              )}
            </>
          )}

          {messageErreurSoumission && (
            <div
              style={{
                marginTop: '10px',
                marginBottom: '20px',
                padding: '12px 16px',
                background:
                  '#FDECEC',
                color: '#B42318',
                border:
                  '1px solid #F5C2C0',
                borderRadius: '8px',
              }}
            >
              {
                messageErreurSoumission
              }
            </div>
          )}

                    {ficheDuJourEstSoumise && (
            <div
              style={{
                marginTop: '10px',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#16803A',
                  marginBottom: '16px',
                }}
              >
                {messageSoumission ||
                  '✓ Fiche soumise'}
              </div>

              <button
                type="button"
                onClick={exporterFichesExcel}
                style={{
                  padding:
                    '11px 20px',
                  border: 'none',
                  borderRadius: '7px',
                  background:
                    '#14532D',
                  color:
                    '#FFFFFF',
                  cursor:
                    'pointer',
                  fontWeight:
                    '500',
                  marginRight: '12px',
                }}
              >
                Exporter en Excel
              </button>

              <button
                type="button"
                onClick={() => {
                  setDateFiche('')
                  setFichesDuJour([])
                  setMessageSoumission('')
                }}
                style={{
                  padding:
                    '11px 20px',
                  border: 'none',
                  borderRadius: '7px',
                  background:
                    '#172F43',
                  color:
                    '#FFFFFF',
                  cursor:
                    'pointer',
                  fontWeight:
                    '500',
                }}
              >
                Retour à la création d'une fiche
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FicheJournaliere