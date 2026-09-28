import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

function IconeRetour() {
  return (
    <svg
      width="14"
      height="14"
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

function ModifierUtilisateur({
  utilisateur,
  onNavigate,
  onDeconnexion,
}) {
  const partiesNom = utilisateur.nom.split(' ')

  const [nom] = useState(partiesNom[1] || '')
  const [prenom] = useState(partiesNom[0] || '')
  const [identifiant] = useState(
    utilisateur.identifiant
  )
  const [email, setEmail] = useState(utilisateur.email)
  const [profil, setProfil] = useState(utilisateur.profilId)
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErreur('')
    setChargement(true)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://127.0.0.1:8000/api/utilisateurs/${utilisateur.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            email: email,
            profil: profil,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setErreur(
          data.detail ||
          data.profil?.[0] ||
          data.email?.[0] ||
          'Une erreur est survenue lors de la modification de l’utilisateur.'
        )
        return
      }

      if (onNavigate) {
        onNavigate('utilisateurs')
      }
    } catch (error) {
      console.error(
        'Erreur de connexion au serveur :',
        error
      )

      setErreur(
        'Impossible de contacter le serveur.'
      )
    } finally {
      setChargement(false)
    }
  }

  return (
    <AdminLayout
      pageActive="utilisateurs"
      nomAdministrateur="Nom admin"
      onNavigate={onNavigate}
      onDeconnexion={onDeconnexion}
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
            marginBottom: '22px',
          }}
        >
          <IconeRetour />
          Retour à la gestion des utilisateurs
        </button>

        {/* Titre */}
        <div
          style={{
            marginBottom: '28px',
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
            Modifier l’utilisateur : {utilisateur.nom}
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: '#7189A1',
              margin: '7px 0 0',
            }}
          >
            Modifiez les informations et les paramètres du compte utilisateur.
          </p>
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
                Nom
              </label>

              <input
                type="text"
                value={nom}
                disabled
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  backgroundColor: '#E9ECEF',
                  padding: '0 12px',
                  fontSize: '11px',
                  color: '#7A8791',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
                }}
              />
            </div>

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
                Prénom
              </label>

              <input
                type="text"
                value={prenom}
                disabled
                style={{
                  width: '100%',
                  height: '40px',
                  border: 'none',
                  backgroundColor: '#E9ECEF',
                  padding: '0 12px',
                  fontSize: '11px',
                  color: '#7A8791',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'not-allowed',
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
              Identifiant système
            </label>

            <input
              type="text"
              value={identifiant}
              disabled
              style={{
                width: '100%',
                height: '40px',
                border: 'none',
                backgroundColor: '#E9ECEF',
                padding: '0 12px',
                fontSize: '11px',
                color: '#7A8791',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'not-allowed',
              }}
            />
          </div>

          {/* Email */}
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
              onChange={(e) => setProfil(Number(e.target.value))}
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
              <option value={1}>
                Administrateur
              </option>

              <option value={2}>
                Chef Magasinier
              </option>

              <option value={3}>
                Responsable des Opérations
              </option>

              <option value={4}>
                Directeur
              </option>

              <option value={5}>
                Responsable des Statistiques
              </option>
            </select>
          </div>

          {/* Erreur */}
          {erreur && (
            <div
              style={{
                marginBottom: '18px',
                fontSize: '10px',
                color: '#D63C3C',
                backgroundColor: '#FDECEC',
                border: '1px solid #F5D0D0',
                borderRadius: '3px',
                padding: '9px 10px',
              }}
            >
              {erreur}
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
              disabled={chargement}
              style={{
                height: '34px',
                border: 'none',
                borderRadius: '2px',
                backgroundColor: '#0F2942',
                color: '#FFFFFF',
                padding: '0 18px',
                fontSize: '9px',
                fontWeight: 600,
                cursor: chargement ? 'not-allowed' : 'pointer',
                opacity: chargement ? 0.7 : 1,
              }}
            >
              {chargement
                ? 'Enregistrement...'
                : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default ModifierUtilisateur