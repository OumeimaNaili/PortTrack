import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api'

const HAUTEUR_BARRE = 130

// Regroupe les fiches VALIDÉES par navire + numéro d'escale.
// Les tonnages déchargés sont calculés à partir des détails de déchargement
// (et non du total cumulé renvoyé par l'API, qui serait compté plusieurs fois).
const construireEscales = (fiches, details) => {
  const escales = {}

  const fichesValidees = fiches.filter(
    (fiche) => fiche.statut === 'VALIDEE'
  )

  // Tonnage déchargé par fiche + produit_navire
  const tonnageParFicheProduit = {}

  details.forEach((detail) => {
    const cle = `${detail.fiche}-${detail.produit_navire}`

    tonnageParFicheProduit[cle] =
      (tonnageParFicheProduit[cle] || 0) +
      Number(detail.tonnage_decharge || 0)
  })

  fichesValidees.forEach((fiche) => {
    const cleEscale = `${fiche.navire}-${String(
      fiche.numero_escale || ''
    ).trim()}`

    if (!escales[cleEscale]) {
      escales[cleEscale] = {
        cle: cleEscale,
        navireId: fiche.navire,
        navireNom: fiche.navire_nom,
        numeroEscale: fiche.numero_escale,
        derniereDate: fiche.date_fiche,
        produits: {},
      }
    }

    const escale = escales[cleEscale]

    if (
      !escale.derniereDate ||
      fiche.date_fiche > escale.derniereDate
    ) {
      escale.derniereDate = fiche.date_fiche
    }

    ;(fiche.produits || []).forEach((produit) => {
      const cleProduit = String(produit.produit_id)

      if (!escale.produits[cleProduit]) {
        escale.produits[cleProduit] = {
          designation: produit.designation,
          tonnageManifeste: 0,
          totalDechargeTonnage: 0,
        }
      }

      const donneesProduit = escale.produits[cleProduit]

      donneesProduit.tonnageManifeste = Math.max(
        donneesProduit.tonnageManifeste,
        Number(produit.tonnage_manifeste) || 0
      )

      donneesProduit.totalDechargeTonnage +=
        tonnageParFicheProduit[
          `${fiche.id}-${produit.produit_navire}`
        ] || 0
    })
  })

  return Object.values(escales)
    .map((escale) => {
      const produits = Object.values(escale.produits).map(
        (produit) => {
          const resteTonnage = Math.max(
            0,
            produit.tonnageManifeste -
              produit.totalDechargeTonnage
          )

          return {
            ...produit,
            resteABordTonnage: resteTonnage,
          }
        }
      )

      return {
        ...escale,
        produits,
      }
    })
        .filter((escale) =>
      escale.produits.some(
        (produit) =>
          produit.resteABordTonnage > 0 ||
          produit.tonnageManifeste === 0
      )
    )
    .sort((a, b) =>
      a.navireNom.localeCompare(b.navireNom)
    )
}

function BarreProduit({ designation, decharge, manifeste }) {
  const max = manifeste > 0 ? manifeste : 1

  const hauteur =
    (Math.min(decharge, max) / max) * HAUTEUR_BARRE

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '110px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontWeight: 700,
          color: '#16803A',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {decharge.toLocaleString('fr-FR')} /{' '}
        {manifeste.toLocaleString('fr-FR')} t
      </div>

      <div
        style={{
          width: '54px',
          height: `${HAUTEUR_BARRE}px`,
          display: 'flex',
          alignItems: 'flex-end',
          background: '#F2F4F7',
          borderRadius: '6px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '100%',
            height: `${Math.max(hauteur, decharge > 0 ? 3 : 0)}px`,
            background: '#16803A',
            borderRadius: '6px 6px 0 0',
            transition: 'height 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#344054',
          marginTop: '8px',
          textAlign: 'center',
        }}
      >
        {designation}
      </div>
    </div>
  )
}

function CarteNavire({ escale }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: '5px solid #172F43',
        borderRadius: '14px',
        padding: '24px 28px',
        marginBottom: '22px',
        boxShadow:
          '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '19px',
            fontWeight: '700',
            color: '#101828',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>🚢</span>
          {escale.navireNom}
        </h2>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              background: '#EAF1FF',
              color: '#172F43',
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Escale : {escale.numeroEscale}
          </span>

          <span
            style={{
              background: '#FFF7E6',
              color: '#B54708',
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            EN COURS DE DÉCHARGEMENT
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        {escale.produits.map((produit) => (
          <BarreProduit
            key={produit.designation}
            designation={produit.designation}
            decharge={produit.totalDechargeTonnage}
            manifeste={produit.tonnageManifeste}
          />
        ))}
      </div>
    </div>
  )
}

function SuiviDechargement() {
  const [escales, setEscales] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')

  const chargerDonnees = async () => {
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

      const [reponseFiches, reponseDetails] = await Promise.all([
        fetch(`${API_URL}/fiches-journalieres/`, {
          method: 'GET',
          cache: 'no-store',
          headers,
        }),
        fetch(`${API_URL}/details-dechargement/`, {
          method: 'GET',
          cache: 'no-store',
          headers,
        }),
      ])

      if (!reponseFiches.ok || !reponseDetails.ok) {
        setErreur(
          'Impossible de charger le suivi du déchargement.'
        )
        setChargement(false)
        return
      }

      const dataFiches = await reponseFiches.json()
      const dataDetails = await reponseDetails.json()

      const listeFiches = Array.isArray(dataFiches)
        ? dataFiches
        : dataFiches.results || []

      const listeDetails = Array.isArray(dataDetails)
        ? dataDetails
        : dataDetails.results || []

      setEscales(construireEscales(listeFiches, listeDetails))
      setErreur('')
    } catch (error) {
      setErreur('Erreur de connexion au serveur.')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => {
    chargerDonnees()

    const interval = setInterval(() => {
      chargerDonnees()
    }, 10000)

    return () => {
      clearInterval(interval)
    }
  }, [])

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
            Suivi du déchargement
          </h1>

          <p
            style={{
              fontSize: '14px',
              color: '#667085',
              margin: 0,
            }}
          >
            Navires en cours de déchargement, mis à jour après
            validation des fiches.
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
          {escales.length} navire
          {escales.length > 1 ? 's' : ''} en cours
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
          Chargement du suivi du déchargement...
        </div>
      ) : escales.length === 0 ? (
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
          Aucun navire en cours de déchargement.
        </div>
      ) : (
        escales.map((escale) => (
          <CarteNavire key={escale.cle} escale={escale} />
        ))
      )}
    </div>
  )
}

export default SuiviDechargement