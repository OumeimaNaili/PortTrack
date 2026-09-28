import { useState } from 'react'

function IconeIdentifiant() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8996A3"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconeOeil({ visible }) {
  if (visible) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#5F7388"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.6 18.6 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    )
  }

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#5F7388"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconeConnexion() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 3v18" />
    </svg>
  )
}

function PageConnexion({ onConnexion }) {
  const [identifiant, setIdentifiant] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [motDePasseVisible, setMotDePasseVisible] = useState(false)
  const [erreur, setErreur] = useState('')
  const [connexionEnCours, setConnexionEnCours] = useState(false)

  const gererConnexion = async (e) => {
    e.preventDefault()

    setErreur('')
    setConnexionEnCours(true)

    try {
      const reponse = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifiant: identifiant,
          mot_de_passe: motDePasse,
        }),
      })

      const donnees = await reponse.json()

      console.log('Réponse login :', reponse.status, donnees)

      if (!reponse.ok) {
        setErreur(
          donnees.detail ||
          donnees.message ||
          'Identifiant ou mot de passe incorrect.'
        )
        return
      }

      if (!donnees.token) {
        setErreur('Le serveur a répondu sans envoyer de token.')
        console.error('Réponse reçue sans token :', donnees)
        return
      }

      localStorage.setItem('token', donnees.token)

      localStorage.setItem(
        'utilisateur',
        JSON.stringify(donnees.utilisateur)
      )

      console.log('Token enregistré :', donnees.token)

      if (onConnexion) {
        onConnexion(donnees)
      }
    } catch (error) {
      console.error('Erreur de connexion :', error)

      setErreur(
        'Impossible de contacter le serveur. Vérifiez que Django est en cours d’exécution.'
      )
    } finally {
      setConnexionEnCours(false)
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
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
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <header
          style={{
            width: '100%',
            padding: '47px 40px 0',
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src="/porttrack-logo.png"
            alt="PortTrack"
            style={{
              height: '60px',
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
        </header>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.35)',
              backgroundColor: 'rgba(3,12,22,0.45)',
              marginBottom: '22px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#4FA3FF',
                flexShrink: 0,
              }}
            />

            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: '#EDF3F9',
                whiteSpace: 'nowrap',
              }}
            >
              Système de gestion des opérations de déchargement
            </span>
          </div>

          <form
            onSubmit={gererConnexion}
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5EBF1',
              borderRadius: '8px',
              padding: '26px 28px 24px',
              boxSizing: 'border-box',
              boxShadow: '0 4px 16px rgba(15, 41, 66, 0.05)',
            }}
          >
            <h1
              style={{
                fontSize: '17px',
                fontWeight: 700,
                color: '#172F43',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '-0.2px',
              }}
            >
              Connexion à la plateforme
            </h1>

            <p
              style={{
                fontSize: '11px',
                color: '#8997A2',
                margin: '6px 0 22px',
                textAlign: 'center',
              }}
            >
              Accédez à votre espace de gestion des opérations de déchargement
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#3C4B58',
                  marginBottom: '7px',
                  textAlign: 'left',
                }}
              >
                Identifiant <span style={{ color: '#D63C3C' }}>*</span>
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  placeholder="Entrez votre identifiant"
                  style={{
                    width: '100%',
                    height: '38px',
                    border: '1px solid #E3E9EF',
                    borderRadius: '4px',
                    backgroundColor: '#FFFFFF',
                    paddingLeft: '12px',
                    paddingRight: '34px',
                    fontSize: '11px',
                    color: '#3C4B58',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <span
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <IconeIdentifiant />
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label
                style={{
                  display: 'block',
                  width: '100%',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#3C4B58',
                  marginBottom: '7px',
                  textAlign: 'left',
                }}
              >
                Mot de passe <span style={{ color: '#D63C3C' }}>*</span>
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={motDePasseVisible ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    height: '38px',
                    border: '1px solid #E3E9EF',
                    borderRadius: '4px',
                    backgroundColor: '#FFFFFF',
                    paddingLeft: '12px',
                    paddingRight: '68px',
                    fontSize: '11px',
                    color: '#3C4B58',
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
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <IconeOeil visible={motDePasseVisible} />

                  <span
                    style={{
                      fontSize: '10px',
                      color: '#5F7388',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {motDePasseVisible ? 'Masquer' : 'Afficher'}
                  </span>
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '18px',
              }}
            >
              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'none',
                  padding: 0,
                  fontSize: '10px',
                  color: '#5B7086',
                  cursor: 'pointer',
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {erreur && (
              <div
                style={{
                  fontSize: '10px',
                  color: '#D63C3C',
                  textAlign: 'center',
                  marginBottom: '12px',
                }}
              >
                {erreur}
              </div>
            )}

            <button
              type="submit"
              disabled={connexionEnCours}
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#0F2942',
                border: 'none',
                borderRadius: '5px',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '9px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: connexionEnCours ? 'wait' : 'pointer',
                boxShadow: '0 2px 6px rgba(15, 41, 66, 0.18)',
              }}
            >
              <IconeConnexion />
              {connexionEnCours ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PageConnexion
