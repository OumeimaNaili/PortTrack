import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

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
    <div style={{ marginBottom: '16px' }}>
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

function Message({ message }) {
  if (!message) {
    return null
  }

  const couleurs = {
    succes: { fond: '#ECFDF3', texte: '#067647', bord: '#ABEFC6' },
    erreur: { fond: '#FEF3F2', texte: '#B42318', bord: '#FECDCA' },
    info: { fond: '#EEF3F9', texte: '#344D66', bord: '#D5E0EE' },
  }

  const couleur = couleurs[message.type] || couleurs.info

  return (
    <div
      style={{
        marginBottom: '18px',
        padding: '11px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        background: couleur.fond,
        color: couleur.texte,
        border: `1px solid ${couleur.bord}`,
      }}
    >
      {message.texte}
    </div>
  )
}

function boutonPrincipal(desactive) {
  return {
    width: '100%',
    height: '42px',
    border: 'none',
    borderRadius: '8px',
    background: desactive ? '#8FA6BF' : '#0F2942',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    cursor: desactive ? 'not-allowed' : 'pointer',
  }
}

const styleLien = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: '#0F2942',
  fontSize: '13px',
  textDecoration: 'underline',
  cursor: 'pointer',
}

async function lireReponse(response) {
  try {
    return await response.json()
  } catch (error) {
    return {}
  }
}

function PageMotDePasseOublie({ onNavigate }) {
  const [etape, setEtape] = useState('demande')

  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [afficher, setAfficher] = useState(false)

  const [erreurs, setErreurs] = useState({})
  const [message, setMessage] = useState(null)
  const [chargement, setChargement] = useState(false)
  const [attente, setAttente] = useState(0)

  useEffect(() => {
    if (attente <= 0) {
      return undefined
    }

    const minuteur = setTimeout(() => {
      setAttente((valeur) => valeur - 1)
    }, 1000)

    return () => clearTimeout(minuteur)
  }, [attente])

  const retourConnexion = () => {
    if (onNavigate) {
      onNavigate('connexion')
    }
  }

  const envoyerCode = async (evenement) => {
    if (evenement) {
      evenement.preventDefault()
    }

    setMessage(null)
    setErreurs({})

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErreurs({
        email: 'Veuillez saisir une adresse email valide.',
      })
      return
    }

    setChargement(true)

    try {
      const response = await fetch(`${API_URL}/mot-de-passe-oublie/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifiant_ou_email: email.trim(),
        }),
      })

      const data = await lireReponse(response)

      if (!response.ok) {
        setMessage({
          type: 'erreur',
          texte:
            data.detail ||
            'Impossible d’envoyer le code. Réessayez plus tard.',
        })
        return
      }

      setEtape('code')
      setAttente(60)
      setMessage({
        type: 'info',
        texte:
          data.message ||
          'Si un compte correspond, un code à 6 chiffres vient d’être envoyé par email.',
      })
    } catch (error) {
      console.error('Erreur de connexion au serveur :', error)

      setMessage({
        type: 'erreur',
        texte: 'Erreur de connexion au serveur.',
      })
    } finally {
      setChargement(false)
    }
  }

  const reinitialiser = async (evenement) => {
    evenement.preventDefault()

    setMessage(null)

    const nouvellesErreurs = {}

    if (!/^\d{6}$/.test(code.trim())) {
      nouvellesErreurs.code = 'Le code doit contenir 6 chiffres.'
    }

    if (nouveauMotDePasse.length < 8) {
      nouvellesErreurs.nouveau_mot_de_passe =
        'Le nouveau mot de passe doit contenir au moins 8 caractères.'
    }

    if (confirmation !== nouveauMotDePasse) {
      nouvellesErreurs.confirmation =
        'La confirmation ne correspond pas au nouveau mot de passe.'
    }

    setErreurs(nouvellesErreurs)

    if (Object.keys(nouvellesErreurs).length > 0) {
      return
    }

    setChargement(true)

    try {
      const response = await fetch(
        `${API_URL}/reinitialiser-mot-de-passe/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifiant_ou_email: email.trim(),
            code: code.trim(),
            nouveau_mot_de_passe: nouveauMotDePasse,
            confirmation: confirmation,
          }),
        }
      )

      const data = await lireReponse(response)

      if (!response.ok) {
        const { detail, ...erreursServeur } = data

        setErreurs(erreursServeur)
        setMessage({
          type: 'erreur',
          texte:
            detail ||
            'Impossible de réinitialiser le mot de passe. Vérifiez les champs.',
        })
        return
      }

      setEtape('succes')
      setMessage(null)
    } catch (error) {
      console.error('Erreur de connexion au serveur :', error)

      setMessage({
        type: 'erreur',
        texte: 'Erreur de connexion au serveur.',
      })
    } finally {
      setChargement(false)
    }
  }

  const typeChamp = afficher ? 'text' : 'password'

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/page1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(5px)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255,255,255,0.18)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          padding: '32px',
          boxSizing: 'border-box',
          boxShadow:
            '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        }}
      >
        <button
          type="button"
          onClick={retourConnexion}
          style={{ ...styleLien, marginBottom: '18px' }}
        >
          ← Retour à la connexion
        </button>

        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#101828',
            margin: '0 0 6px 0',
          }}
        >
          Mot de passe oublié
        </h1>

        {etape === 'demande' && (
          <form onSubmit={envoyerCode} noValidate>
            <p
              style={{
                fontSize: '14px',
                color: '#667085',
                margin: '0 0 22px 0',
              }}
            >
              Saisissez votre adresse email. Un code à 6 chiffres vous
              sera envoyé à cette adresse.
            </p>

            <Message message={message} />

            <Champ
              libelle="Votre email"
              erreur={erreurs.email}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                style={styleInput(erreurs.email)}
              />
            </Champ>

            <button
              type="submit"
              disabled={chargement}
              style={boutonPrincipal(chargement)}
            >
              {chargement ? 'Envoi...' : 'Envoyer le code'}
            </button>
          </form>
        )}

        {etape === 'code' && (
          <form onSubmit={reinitialiser} noValidate>
            <p
              style={{
                fontSize: '14px',
                color: '#667085',
                margin: '0 0 22px 0',
              }}
            >
              Saisissez le code reçu par email (valable 10 minutes) et
              choisissez un nouveau mot de passe.
            </p>

            <Message message={message} />

            <Champ libelle="Code à 6 chiffres" erreur={erreurs.code}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, ''))
                }
                autoFocus
                style={{
                  ...styleInput(erreurs.code),
                  letterSpacing: '0.4em',
                  fontSize: '18px',
                  textAlign: 'center',
                }}
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

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px',
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

            <button
              type="submit"
              disabled={chargement}
              style={boutonPrincipal(chargement)}
            >
              {chargement
                ? 'Enregistrement...'
                : 'Réinitialiser le mot de passe'}
            </button>

            <div
              style={{
                marginTop: '16px',
                textAlign: 'center',
                fontSize: '13px',
                color: '#667085',
              }}
            >
              {attente > 0 ? (
                <span>Renvoyer le code dans {attente} s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => envoyerCode()}
                  disabled={chargement}
                  style={styleLien}
                >
                  Renvoyer le code
                </button>
              )}
            </div>
          </form>
        )}

        {etape === 'succes' && (
          <div>
            <p
              style={{
                fontSize: '14px',
                color: '#667085',
                margin: '0 0 22px 0',
              }}
            >
              Votre mot de passe a été réinitialisé avec succès. Vous
              pouvez maintenant vous connecter avec votre nouveau mot de
              passe.
            </p>

            <button
              type="button"
              onClick={retourConnexion}
              style={boutonPrincipal(false)}
            >
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PageMotDePasseOublie