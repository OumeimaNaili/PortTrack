import { useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api'

const styleInput = (erreur) => ({
  width: '100%',
  height: '42px',
  border: erreur ? '1px solid #D63C3C' : '1px solid #D0D5DD',
  borderRadius: '8px',
  padding: '0 14px',
  fontSize: '14px',
  color: '#172F43',
  background: '#FFFFFF',
  boxSizing: 'border-box',
  outline: 'none',
})

function Champ({ libelle, erreur, children }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          color: '#667085',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        {libelle}
      </label>

      {children}

      {erreur && (
        <div
          style={{
            fontSize: '12px',
            color: '#D63C3C',
            marginTop: '5px',
          }}
        >
          {erreur}
        </div>
      )}
    </div>
  )
}

function PageModifierMotDePasse({ onNavigate }) {
  const [ancienMotDePasse, setAncienMotDePasse] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [afficher, setAfficher] = useState(false)
  const [erreurs, setErreurs] = useState({})
  const [message, setMessage] = useState(null)
  const [enregistrement, setEnregistrement] = useState(false)

  const typeChamp = afficher ? 'text' : 'password'

  const retourParametres = () => {
    if (onNavigate) {
      onNavigate('parametres')
    }
  }

  const enregistrer = async (evenement) => {
    evenement.preventDefault()

    setMessage(null)

    const nouvellesErreurs = {}

    if (!ancienMotDePasse) {
      nouvellesErreurs.ancien_mot_de_passe =
        'Veuillez saisir votre mot de passe actuel.'
    }

    if (nouveauMotDePasse.length < 8) {
      nouvellesErreurs.nouveau_mot_de_passe =
        'Le nouveau mot de passe doit contenir au moins 8 caractères.'
    } else if (nouveauMotDePasse === ancienMotDePasse) {
      nouvellesErreurs.nouveau_mot_de_passe =
        'Le nouveau mot de passe doit être différent de l’ancien.'
    }

    if (confirmation !== nouveauMotDePasse) {
      nouvellesErreurs.confirmation =
        'La confirmation ne correspond pas au nouveau mot de passe.'
    }

    setErreurs(nouvellesErreurs)

    if (Object.keys(nouvellesErreurs).length > 0) {
      return
    }

    setEnregistrement(true)

    try {
      const token = sessionStorage.getItem('token')

      const response = await fetch(
        `${API_URL}/changer-mot-de-passe/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            ancien_mot_de_passe: ancienMotDePasse,
            nouveau_mot_de_passe: nouveauMotDePasse,
            confirmation: confirmation,
          }),
        }
      )

      let data = {}

      try {
        data = await response.json()
      } catch (error) {
        data = {}
      }

      if (!response.ok) {
        const { detail, ...erreursServeur } = data

        setErreurs(erreursServeur)

        setMessage({
          type: 'erreur',
          texte:
            detail ||
            'Impossible de modifier le mot de passe. Vérifiez les champs.',
        })

        return
      }

      setAncienMotDePasse('')
      setNouveauMotDePasse('')
      setConfirmation('')
      setErreurs({})

      setMessage({
        type: 'succes',
        texte: 'Votre mot de passe a été modifié avec succès.',
      })
    } catch (error) {
      console.error('Erreur de connexion au serveur :', error)

      setMessage({
        type: 'erreur',
        texte: 'Erreur de connexion au serveur.',
      })
    } finally {
      setEnregistrement(false)
    }
  }

  const succes = message?.type === 'succes'

  return (
    <div>
      <button
        type="button"
        onClick={retourParametres}
        style={{
          marginBottom: '16px',
          padding: '8px 14px',
          border: '1px solid #D0D5DD',
          borderRadius: '8px',
          background: '#FFFFFF',
          color: '#344054',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        ← Retour aux paramètres
      </button>

      <div
        style={{
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
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#101828',
            margin: '0 0 6px 0',
          }}
        >
          Modifier le mot de passe
        </h1>

        <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
          Le nouveau mot de passe doit contenir au moins 8 caractères.
        </p>
      </div>

      <form
        onSubmit={enregistrer}
        noValidate
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          padding: '28px',
          boxShadow:
            '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        }}
      >
        {message && (
          <div
            style={{
              marginBottom: '20px',
              padding: '11px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              background: succes ? '#ECFDF3' : '#FEF3F2',
              color: succes ? '#067647' : '#B42318',
              border: `1px solid ${succes ? '#ABEFC6' : '#FECDCA'}`,
            }}
          >
            {message.texte}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
          }}
        >
          <Champ
            libelle="Mot de passe actuel"
            erreur={erreurs.ancien_mot_de_passe}
          >
            <input
              type={typeChamp}
              value={ancienMotDePasse}
              onChange={(e) => setAncienMotDePasse(e.target.value)}
              autoComplete="current-password"
              style={styleInput(erreurs.ancien_mot_de_passe)}
            />
          </Champ>

          <Champ
            libelle="Nouveau mot de passe"
            erreur={erreurs.nouveau_mot_de_passe}
          >
            <input
              type={typeChamp}
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              autoComplete="new-password"
              style={styleInput(erreurs.nouveau_mot_de_passe)}
            />
          </Champ>

          <Champ
            libelle="Confirmer le nouveau mot de passe"
            erreur={erreurs.confirmation}
          >
            <input
              type={typeChamp}
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="new-password"
              style={styleInput(erreurs.confirmation)}
            />
          </Champ>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
            fontSize: '13px',
            color: '#667085',
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          <input
            type="checkbox"
            checked={afficher}
            onChange={(e) => setAfficher(e.target.checked)}
          />
          Afficher les mots de passe
        </label>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '26px',
          }}
        >
          <button
            type="button"
            onClick={retourParametres}
            style={{
              height: '40px',
              border: '1px solid #D0D5DD',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#344054',
              padding: '0 20px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={enregistrement}
            style={{
              height: '40px',
              border: 'none',
              borderRadius: '8px',
              background: enregistrement ? '#8FA6BF' : '#0F2942',
              color: '#FFFFFF',
              padding: '0 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: enregistrement ? 'not-allowed' : 'pointer',
            }}
          >
            {enregistrement ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PageModifierMotDePasse