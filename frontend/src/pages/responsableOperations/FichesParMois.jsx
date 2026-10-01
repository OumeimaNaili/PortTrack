import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

const NOMS_MOIS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

const formaterNombre = (valeur) =>
  Number(valeur || 0).toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  })

const formaterDate = (dateIso) => {
  const [annee, mois, jour] = dateIso.split('-')
  return `${jour}/${mois}/${annee}`
}

const libelleMois = (cleMois) => {
  const [annee, mois] = cleMois.split('-')
  return `${NOMS_MOIS[Number(mois) - 1]} ${annee}`
}

/*
 * Construit les données par mois, puis par jour.
 *
 * Règle importante : pour un même navire + même numéro d'escale,
 * si le déchargement continue sur un nouveau mois, le tonnage manifeste
 * du nouveau mois = reste à bord du dernier jour du mois précédent.
 * Total déchargé et reste à bord sont alors recalculés à partir de cette base.
 */
const construireMois = (fiches, details) => {
  const fichesRetenues = fiches
    .filter(
      (fiche) =>
        fiche.statut === 'SOUMISE' || fiche.statut === 'VALIDEE'
    )
    .sort((a, b) =>
      a.date_fiche < b.date_fiche
        ? -1
        : a.date_fiche > b.date_fiche
          ? 1
          : 0
    )

  // Tonnage déchargé par fiche + produit_navire (= "total jour")
  const totalParFicheProduit = {}

  details.forEach((detail) => {
    const cle = `${detail.fiche}-${detail.produit_navire}`

    totalParFicheProduit[cle] =
      (totalParFicheProduit[cle] || 0) +
      Number(detail.tonnage_decharge || 0)
  })

  // État cumulé par escale + produit
  const etats = {}
  const mois = {}

  fichesRetenues.forEach((fiche) => {
    const cleMois = fiche.date_fiche.slice(0, 7)

    const cleEscale = `${fiche.navire}-${String(
      fiche.numero_escale || ''
    ).trim()}`

    const lignes = (fiche.produits || []).map((produit) => {
      const cleEtat = `${cleEscale}-${produit.produit_id}`

      if (!etats[cleEtat]) {
        etats[cleEtat] = {
          manifesteInitial: Number(produit.tonnage_manifeste) || 0,
          cumul: 0,
          moisCourant: cleMois,
          baseMois: 0,
        }
      }

      const etat = etats[cleEtat]

      // Nouveau mois : la base devient tout ce qui a déjà été déchargé
      if (etat.moisCourant !== cleMois) {
        etat.moisCourant = cleMois
        etat.baseMois = etat.cumul
      }

      const totalJour =
        totalParFicheProduit[
          `${fiche.id}-${produit.produit_navire}`
        ] || 0

      etat.cumul += totalJour

      return {
        cle: cleEtat,
        designation: produit.designation,
        manifeste: Math.max(
          0,
          etat.manifesteInitial - etat.baseMois
        ),
        totalJour,
        totalDecharge: etat.cumul - etat.baseMois,
        reste: Math.max(0, etat.manifesteInitial - etat.cumul),
        reporte: etat.baseMois > 0,
      }
    })

    if (!mois[cleMois]) {
      mois[cleMois] = { cle: cleMois, jours: {} }
    }

    if (!mois[cleMois].jours[fiche.date_fiche]) {
      mois[cleMois].jours[fiche.date_fiche] = {
        date: fiche.date_fiche,
        fiches: [],
      }
    }

    mois[cleMois].jours[fiche.date_fiche].fiches.push({
      id: fiche.id,
      navireNom: fiche.navire_nom,
      numeroEscale: fiche.numero_escale,
      statut: fiche.statut,
      lignes,
    })
  })

  return Object.values(mois)
    .sort((a, b) => (a.cle < b.cle ? 1 : -1))
    .map((moisCourant) => ({
      cle: moisCourant.cle,
      jours: Object.values(moisCourant.jours)
        .sort((a, b) => (a.date < b.date ? -1 : 1))
        .map((jour) => ({
          ...jour,
          fiches: jour.fiches.sort((a, b) =>
            (a.navireNom || '').localeCompare(b.navireNom || '')
          ),
          validee: jour.fiches.every(
            (fiche) => fiche.statut === 'VALIDEE'
          ),
        })),
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

const styleTh = {
  padding: '12px 14px',
  background: '#172F43',
  color: '#FFFFFF',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
  textAlign: 'center',
  border: '1px solid #26435A',
}

const styleTd = {
  padding: '11px 14px',
  fontSize: '14px',
  color: '#101828',
  textAlign: 'center',
  border: '1px solid #E5E7EB',
}

function TableauJour({ jour }) {
  return (
    <div style={{ ...styleCarte, padding: '22px 28px', marginBottom: '22px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 700,
            color: '#101828',
          }}
        >
          Journée du {formaterDate(jour.date)}
        </h3>

        <span
          style={{
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.03em',
            background: jour.validee ? '#ECFDF3' : '#FFF7E6',
            color: jour.validee ? '#027A48' : '#B54708',
          }}
        >
          {jour.validee ? 'VALIDÉE' : 'EN ATTENTE DE VALIDATION'}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '760px',
          }}
        >
          <thead>
            <tr>
              <th style={styleTh}>Navire</th>
              <th style={styleTh}>Produit</th>
              <th style={styleTh}>Tonnage manifeste</th>
              <th style={styleTh}>Total jour</th>
              <th style={styleTh}>Total déchargé</th>
              <th style={styleTh}>Reste à bord</th>
            </tr>
          </thead>

          <tbody>
            {jour.fiches.map((fiche) =>
              fiche.lignes.map((ligne, index) => (
                <tr key={`${fiche.id}-${ligne.cle}`}>
                  {index === 0 && (
                    <td
                      rowSpan={fiche.lignes.length}
                      style={{
                        ...styleTd,
                        fontWeight: 700,
                        background: '#F8F9FB',
                      }}
                    >
                      🚢 {fiche.navireNom}
                      <div
                        style={{
                          marginTop: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#667085',
                        }}
                      >
                        Escale : {fiche.numeroEscale || '-'}
                      </div>
                    </td>
                  )}

                  <td style={{ ...styleTd, fontWeight: 600 }}>
                    {ligne.designation}
                  </td>

                  <td style={styleTd}>
                    {formaterNombre(ligne.manifeste)}
                    {ligne.reporte && (
                      <div
                        style={{
                          marginTop: '3px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#B54708',
                        }}
                      >
                        
                      </div>
                    )}
                  </td>

                  <td style={styleTd}>
                    {formaterNombre(ligne.totalJour)}
                  </td>

                  <td style={styleTd}>
                    {formaterNombre(ligne.totalDecharge)}
                  </td>

                  <td
                    style={{
                      ...styleTd,
                      fontWeight: 700,
                      color: ligne.reste === 0 ? '#16803A' : '#101828',
                    }}
                  >
                    {formaterNombre(ligne.reste)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FichesParMois({ lectureSeule = false, moisInitial = null }) {
  const [fiches, setFiches] = useState([])
  const [details, setDetails] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [moisChoisi, setMoisChoisi] = useState(moisInitial || '')
  const [soumissionMois, setSoumissionMois] = useState(false)
  const [messageMois, setMessageMois] = useState(null)

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
          throw new Error('Impossible de charger les fiches par mois.')
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

  const listeMois = useMemo(
    () => construireMois(fiches, details),
    [fiches, details]
  )

    const moisAffiche =
    listeMois.find((element) => element.cle === moisChoisi) ||
    listeMois[0]

  const exporterExcel = () => {
    if (!moisAffiche) {
      return
    }

    const echapper = (valeur) =>
      String(valeur ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    let contenu = `<table border="1"><tr><td colspan="6"><b>FICHES DU MOIS : ${echapper(
      libelleMois(moisAffiche.cle)
    )}</b></td></tr></table><br/>`

    moisAffiche.jours.forEach((jour) => {
      contenu += `<table border="1">`
      contenu += `<tr><td colspan="6"><b>Journée du ${echapper(
        formaterDate(jour.date)
      )} - ${jour.validee ? 'VALIDÉE' : 'EN ATTENTE DE VALIDATION'}</b></td></tr>`
      contenu += `<tr><th>Navire</th><th>Produit</th><th>Tonnage manifeste</th><th>Total jour</th><th>Total déchargé</th><th>Reste à bord</th></tr>`

      jour.fiches.forEach((fiche) => {
        fiche.lignes.forEach((ligne, index) => {
          contenu += `<tr>`

          if (index === 0) {
            contenu += `<td rowspan="${fiche.lignes.length}"><b>${echapper(
              fiche.navireNom
            )}</b><br/>Escale : ${echapper(fiche.numeroEscale || '-')}</td>`
          }

          contenu += `<td>${echapper(ligne.designation)}</td>`
          contenu += `<td>${Number(ligne.manifeste || 0)}</td>`
          contenu += `<td>${Number(ligne.totalJour || 0)}</td>`
          contenu += `<td>${Number(ligne.totalDecharge || 0)}</td>`
          contenu += `<td><b>${Number(ligne.reste || 0)}</b></td>`
          contenu += `</tr>`
        })
      })

      contenu += `</table><br/>`
    })

    const documentHtml = `<html><head><meta charset="UTF-8"></head><body>${contenu}</body></html>`

    const blob = new Blob(['\ufeff', documentHtml], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const lien = document.createElement('a')

    lien.href = url
    lien.download = `fiches-par-mois-${moisAffiche.cle}.xls`

    document.body.appendChild(lien)
    lien.click()
    document.body.removeChild(lien)

    URL.revokeObjectURL(url)
  }

  const soumettreMois = async () => {
    if (!moisAffiche) {
      return
    }

    const token = sessionStorage.getItem('token')

    setSoumissionMois(true)
    setMessageMois(null)

    try {
      const response = await fetch(
        `${API_URL}/fiches-journalieres/soumettre-mois/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mois: moisAffiche.cle }),
        }
      )

      let data = {}

      try {
        data = await response.json()
      } catch (error) {
        data = {}
      }

      if (!response.ok) {
        setMessageMois({
          type: 'erreur',
          texte: data.detail || 'Impossible de soumettre le mois.',
        })
        return
      }

      setMessageMois({
        type: 'succes',
        texte: 'Le mois a été soumis avec succès.',
      })
    } catch (error) {
      setMessageMois({
        type: 'erreur',
        texte: 'Erreur de connexion au serveur.',
      })
    } finally {
      setSoumissionMois(false)
    }
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
            Fiches par mois
          </h1>

          <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
            Fiches journalières soumises et validées, regroupées par mois.
          </p>
        </div>

                {listeMois.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
                        {!lectureSeule && (
              <select
                value={moisAffiche ? moisAffiche.cle : ''}
                onChange={(e) => {
                  setMoisChoisi(e.target.value)
                  setMessageMois(null)
                }}
                style={{
                  padding: '10px 14px',
                  border: '1px solid #D0D5DD',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#172F43',
                  background: '#FFFFFF',
                }}
              >
                {listeMois.map((element) => (
                  <option key={element.cle} value={element.cle}>
                    {libelleMois(element.cle)}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={exporterExcel}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderRadius: '8px',
                background: '#14532D',
                color: '#FFFFFF',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Exporter en Excel
            </button>
          </div>
        )}

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
          Chargement des fiches...
        </div>
      ) : !moisAffiche ? (
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
        <>
          <h2
            style={{
              margin: '0 0 18px',
              fontSize: '20px',
              fontWeight: 700,
              color: '#172F43',
            }}
          >
            {libelleMois(moisAffiche.cle)}
          </h2>

          {moisAffiche.jours.map((jour) => (
            <TableauJour key={jour.date} jour={jour} />
          ))}

          {!lectureSeule && messageMois && (
            <div
              style={{
                marginBottom: '14px',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textAlign: 'center',
                background:
                  messageMois.type === 'succes' ? '#EAFaf0' : '#FDECEC',
                color:
                  messageMois.type === 'succes' ? '#16803A' : '#B42318',
                border:
                  messageMois.type === 'succes'
                    ? '1px solid #B7E4C7'
                    : '1px solid #F5C2C0',
              }}
            >
              {messageMois.texte}
            </div>
          )}

          <div
            style={{
              display: lectureSeule ? 'none' : 'flex',
              justifyContent: 'center',
              marginBottom: '30px',
            }}
          >
            <button
              type="button"
              onClick={soumettreMois}
              disabled={soumissionMois}
              style={{
                padding: '13px 34px',
                border: 'none',
                borderRadius: '9px',
                background: '#172F43',
                color: '#FFFFFF',
                cursor: soumissionMois ? 'not-allowed' : 'pointer',
                opacity: soumissionMois ? 0.7 : 1,
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '0.03em',
                boxShadow: '0 1px 3px rgba(16,24,40,0.2)',
              }}
            >
              {soumissionMois ? 'Soumission...' : 'SOUMETTRE'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default FichesParMois