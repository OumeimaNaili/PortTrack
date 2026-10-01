import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function ChampLectureSeule({ libelle, valeur }) {
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

      <input
        type="text"
        value={valeur || '-'}
        readOnly
        style={{
          width: '100%',
          height: '42px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '0 14px',
          fontSize: '14px',
          color: '#667085',
          background: '#F8F9FB',
          boxSizing: 'border-box',
          cursor: 'not-allowed',
        }}
      />
    </div>
  )
}

function PageModifierProfil({
  utilisateur,
  onNavigate,
  onProfilMisAJour,
}) {
  const [email, setEmail] = useState(utilisateur?.email || '')
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState(null)
  const [enregistrement, setEnregistrement] = useState(false)

  const retourParametres = () => {
    if (onNavigate) {
      onNavigate('parametres')
    }
  }

  const enregistrer = async (evenement) => {
    evenement.preventDefault()

    setMessage(null)
    setErreur('')

    const emailNettoye = email.trim()

    if (!/^\S+@\S+\.\S+$/.test(emailNettoye)) {
      setErreur('Veuillez saisir une adresse email valide.')
      return
    }

    if (emailNettoye === (utilisateur?.email || '')) {
      setMessage({
        type: 'info',
        texte: 'Aucune modification à enregistrer.',
      })
      return
    }

    setEnregistrement(true)

    try {
      const token = sessionStorage.getItem('token')

      const response = await fetch(`${API_URL}/mon-profil/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ email: emailNettoye }),
      })

      let data = {}

      try {
        data = await response.json()
      } catch (error) {
        data = {}
      }

      if (!response.ok) {
        setErreur(data.email || '')

        setMessage({
          type: 'erreur',
          texte:
            data.detail ||
            data.email ||
            'Impossible de modifier l’email.',
        })

        return
      }

      if (data.utilisateur && onProfilMisAJour) {
        onProfilMisAJour(data.utilisateur)
      }

      setMessage({
        type: 'succes',
        texte: 'Votre adresse email a été modifiée avec succès.',
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

  const couleursMessage = {
    succes: { fond: '#ECFDF3', texte: '#067647', bord: '#ABEFC6' },
    erreur: { fond: '#FEF3F2', texte: '#B42318', bord: '#FECDCA' },
    info: { fond: '#EEF3F9', texte: '#344D66', bord: '#D5E0EE' },
  }

  const couleur = message ? couleursMessage[message.type] : null

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
          Modifier le profil
        </h1>

        <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
          Vous pouvez modifier uniquement votre adresse email.
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
              background: couleur.fond,
              color: couleur.texte,
              border: `1px solid ${couleur.bord}`,
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
          <ChampLectureSeule
            libelle="Nom"
            valeur={utilisateur?.nom}
          />

          <ChampLectureSeule
            libelle="Prénom"
            valeur={utilisateur?.prenom}
          />

          <ChampLectureSeule
            libelle="Identifiant"
            valeur={utilisateur?.identifiant}
          />

          <ChampLectureSeule
            libelle="Rôle"
            valeur={utilisateur?.profil?.nom_profil}
          />

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
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                border: erreur
                  ? '1px solid #D63C3C'
                  : '1px solid #D0D5DD',
                borderRadius: '8px',
                padding: '0 14px',
                fontSize: '14px',
                color: '#172F43',
                background: '#FFFFFF',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />

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
        </div>

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

export default PageModifierProfil