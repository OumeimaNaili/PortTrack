import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

function IconeRetour() {
  return (
    <svg
      width="14px"
      height="14px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#526C84"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconeInformation() {
  return (
    <svg
      width="13px"
      height="13px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#526C84"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function IconeOeil() {
  return (
    <svg
      width="15px"
      height="15px"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#526C84"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  )
}

function AjouterUtilisateur({ onNavigate }) {
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)

  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [identifiant, setIdentifiant] = useState('')
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [profil, setProfil] = useState('')

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [compteCree, setCompteCree] = useState(false)

  useEffect(() => {
    const genererIdentifiant = async () => {
      try {
        const token = localStorage.getItem('token')

        const response = await fetch(
          'http://127.0.0.1:8000/api/utilisateurs/',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Token ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Impossible de récupérer les utilisateurs.')
        }

        const data = await response.json()

        const utilisateurs = Array.isArray(data)
          ? data
          : data.results || []

        const numerosExistants = utilisateurs
          .map((utilisateur) => {
            const match = utilisateur.identifiant?.match(/^USER-(\d+)$/)
            return match ? parseInt(match[1], 10) : null
          })
          .filter((numero) => numero !== null)

        let numero = 1

        while (numerosExistants.includes(numero)) {
          numero++
        }

        setIdentifiant(
          `USER-${String(numero).padStart(3, '0')}`
        )
      } catch (error) {
        console.error(
          'Erreur lors de la génération de l’identifiant :',
          error
        )

        setMessage(
          'Impossible de générer automatiquement l’identifiant.'
        )
        setMessageType('error')
      }
    }

    genererIdentifiant()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setMessageType('')

    const profils = {
      'Chef Magasinier': 2,
      'Responsable des Opérations': 3,
      'Directeur': 4,
      'Responsable des Statistiques': 5,
    }

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/utilisateurs/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            identifiant,
            mot_de_passe: motDePasse,
            nom,
            prenom,
            email,
            profil: profils[profil],
            actif: true,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        let messageErreur =
          'Une erreur est survenue lors de la création du compte.'

        if (data.email) {
          messageErreur = 'Cette adresse e-mail existe déjà.'
        } else if (data.detail) {
          messageErreur = data.detail
        } else if (data.identifiant) {
          messageErreur = `Identifiant : ${
            Array.isArray(data.identifiant)
              ? data.identifiant.join(' ')
              : data.identifiant
          }`
        } else if (data.mot_de_passe) {
          messageErreur = `Mot de passe : ${
            Array.isArray(data.mot_de_passe)
              ? data.mot_de_passe.join(' ')
              : data.mot_de_passe
          }`
        } else if (data.profil) {
          messageErreur = `Profil : ${
            Array.isArray(data.profil)
              ? data.profil.join(' ')
              : data.profil
          }`
        }

        setMessage(messageErreur)
        setMessageType('error')
        return
      }

      setCompteCree(true)
    } catch (error) {
      setMessage(
        'Une erreur est survenue lors de la création du compte.'
      )
      setMessageType('error')
    }
  }

  return (
    <AdminLayout
      pageActive="utilisateurs"
      nomAdministrateur="Nom admin"
      onNavigate={onNavigate}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1120px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        {/* Retour */}
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate('utilisateurs')
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: 'none',
            background: 'none',
            padding: 0,
            fontSize: '12px',
            color: '#526C84',
            cursor: 'pointer',
            marginBottom: '18px',
          }}
        >
          <IconeRetour />
          Retour à la gestion des utilisateurs
        </button>

        {/* Titre */}
        <div
          style={{
            marginBottom: '32px',
          }}
        >
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#171D22',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.4px',
            }}
          >
            Ajouter un utilisateur
          </h1>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          style={{
            width: '100%',
            maxWidth: '900px',
            backgroundColor: '#FFFFFF',
            borderRadius: '7px',
            padding: '30px 34px',
            boxSizing: 'border-box',
            boxShadow: '0 1px 5px rgba(15, 41, 66, 0.04)',
          }}
        >
          {/* Nom + Prénom */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '18px',
              marginBottom: '22px',
            }}
          >
            {/* Nom */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '7px',
                }}
              >
                Nom <span style={{ color: '#D63C3C' }}>*</span>
              </label>

              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Saisir le nom"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  backgroundColor: '#F0F2F4',
                  padding: '0 12px',
                  fontSize: '11px',
                  color: '#374957',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Prénom */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '7px',
                }}
              >
                Prénom <span style={{ color: '#D63C3C' }}>*</span>
              </label>

              <input
                type="text"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                placeholder="Saisir le prénom"
                required
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  backgroundColor: '#F0F2F4',
                  padding: '0 12px',
                  fontSize: '11px',
                  color: '#374957',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Identifiant */}
          <div
            style={{
              marginBottom: '22px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '7px',
              }}
            >
              <label
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                }}
              >
                Identifiant système{' '}
                <span style={{ color: '#D63C3C' }}>*</span>
              </label>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                height: '40px',
                backgroundColor: '#F0F2F4',
              }}
            >
              <span
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  borderRight: '1px solid #E1E4E7',
                  fontSize: '10px',
                  color: '#526C84',
                  whiteSpace: 'nowrap',
                }}
              >
                # USER-
              </span>

              <input
                type="text"
                value={identifiant.replace('USER-', '')}
                readOnly
                style={{
                  flex: 1,
                  height: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  padding: '0 12px',
                  fontSize: '11px',
                  color: '#374957',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <p
              style={{
                fontSize: '9px',
                color: '#8997A2',
                margin: '7px 0 0',
              }}
            >
              Identifiant unique utilisé pour l'audit et les signatures d'intervention.
            </p>
          </div>

          {/* Adresse e-mail */}
          <div
            style={{
              marginBottom: '22px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 600,
                color: '#526C84',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                marginBottom: '7px',
              }}
            >
              Adresse e-mail{' '}
              <span style={{ color: '#D63C3C' }}>*</span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Saisir l'adresse e-mail"
              required
              style={{
                width: '100%',
                height: '40px',
                border: 'none',
                backgroundColor: '#F0F2F4',
                padding: '0 12px',
                fontSize: '11px',
                color: '#374957',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Mot de passe */}
          <div
            style={{
              marginBottom: '22px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 600,
                color: '#526C84',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                marginBottom: '7px',
              }}
            >
              Mot de passe provisoire{' '}
              <span style={{ color: '#D63C3C' }}>*</span>
            </label>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '40px',
              }}
            >
              <input
                type={motDePasseVisible ? 'text' : 'password'}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#F0F2F4',
                  padding: '0 38px 0 12px',
                  fontSize: '11px',
                  color: '#374957',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setMotDePasseVisible(!motDePasseVisible)
                }
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <IconeOeil />
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '7px',
              }}
            >
              <IconeInformation />

              <span
                style={{
                  fontSize: '9px',
                  color: '#526C84',
                }}
              >
                L'utilisateur sera invité à modifier ce mot de passe à la première connexion.
              </span>
            </div>
          </div>

          {/* Profil */}
          <div
            style={{
              marginBottom: '32px',
            }}
          >
            <label
              style={{
                display: 'block',
                fontSize: '9px',
                fontWeight: 600,
                color: '#526C84',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                marginBottom: '7px',
              }}
            >
              Profil d'accès{' '}
              <span style={{ color: '#D63C3C' }}>*</span>
            </label>

            <select
              value={profil}
              onChange={(e) => setProfil(e.target.value)}
              required
              style={{
                width: '100%',
                height: '40px',
                border: 'none',
                backgroundColor: '#F0F2F4',
                padding: '0 12px',
                fontSize: '11px',
                color: '#374957',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="" disabled>
                Sélectionner un profil d'autorisation...
              </option>

              <option value="Chef Magasinier">
                Chef Magasinier
              </option>

              <option value="Responsable des Opérations">
                Responsable des Opérations
              </option>

              <option value="Directeur">
                Directeur
              </option>

              <option value="Responsable des Statistiques">
                Responsable des Statistiques
              </option>
            </select>

            <p
              style={{
                fontSize: '9px',
                color: '#8997A2',
                margin: '7px 0 0',
              }}
            >
              Le profil détermine l'étendue des autorisations et la visibilité opérationnelle.
            </p>
          </div>

          {/* Message d'erreur */}
          {message && (
            <div
              style={{
                marginBottom: '20px',
                padding: '11px 14px',
                borderRadius: '4px',
                backgroundColor: '#FDECEC',
                color: '#B83232',
                border: '1px solid #F3CACA',
                fontSize: '10px',
              }}
            >
              {message}
            </div>
          )}

          {/* Boutons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('utilisateurs')
                }
              }}
              style={{
                height: '34px',
                border: 'none',
                backgroundColor: '#F0F2F4',
                color: '#526C84',
                padding: '0 14px',
                fontSize: '9px',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>

            <button
              type="submit"
              style={{
                height: '34px',
                border: 'none',
                borderRadius: '2px',
                backgroundColor: '#0F2942',
                color: '#FFFFFF',
                padding: '0 18px',
                fontSize: '9px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Créer le compte
            </button>
          </div>
        </form>
      </div>

      {/* Fenêtre de confirmation */}
      {compteCree && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(15, 41, 66, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: '360px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '28px 30px',
              boxSizing: 'border-box',
              boxShadow: '0 8px 30px rgba(15, 41, 66, 0.18)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#EAF6EE',
                color: '#267A45',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              ✓
            </div>

            <h2
              style={{
                margin: '0 0 8px',
                fontSize: '17px',
                fontWeight: 700,
                color: '#171D22',
              }}
            >
              Compte créé avec succès
            </h2>

            <p
              style={{
                margin: '0 0 22px',
                fontSize: '10px',
                color: '#526C84',
                lineHeight: 1.5,
              }}
            >
              L'utilisateur a été ajouté avec succès.
            </p>

            <button
              type="button"
              onClick={() => {
                setCompteCree(false)

                if (onNavigate) {
                  onNavigate('utilisateurs')
                }
              }}
              style={{
                height: '34px',
                border: 'none',
                borderRadius: '3px',
                backgroundColor: '#0F2942',
                color: '#FFFFFF',
                padding: '0 24px',
                fontSize: '10px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AjouterUtilisateur
