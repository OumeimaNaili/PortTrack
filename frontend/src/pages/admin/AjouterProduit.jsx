import { useState } from 'react'
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

function AjouterProduit({ onNavigate, onDeconnexion }) {
  const [designation, setDesignation] = useState('')
  const [typeProduit, setTypeProduit] = useState('')
  const [produitCree, setProduitCree] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const token = sessionStorage.getItem('token')

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/produits/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            designation,
            type_produit: typeProduit,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(
          data.detail ||
            "Une erreur est survenue lors de la création du produit."
        )
        return
      }

      setProduitCree(true)
    } catch (error) {
      alert(
        'Impossible de contacter le serveur. Vérifiez que Django est démarré.'
      )
    }
  }

  return (
    <AdminLayout
      pageActive="marchandises"
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('marchandises')
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
            }}
          >
            <IconeRetour />
            Retour à la gestion des produits
          </button>
        </div>

        {/* Titre */}
        <div
          style={{
            marginBottom: '26px',
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
            Ajouter un produit
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: '#7189A1',
              margin: '6px 0 0',
            }}
          >
            Déclarez une nouvelle référence de produit dans le registre de la plateforme PortTrack.
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
          {/* Désignation */}
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
              Désignation du produit{' '}
              <span style={{ color: '#D63C3C' }}>*</span>
            </label>

            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Saisir la désignation du produit"
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

            <p
              style={{
                fontSize: '9px',
                color: '#8997A2',
                margin: '7px 0 0',
              }}
            >
              Indiquez l'intitulé officiel du produit tel que stipulé sur le connaissement maritime.
            </p>
          </div>

          {/* Type de produit */}
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
              Type de produit{' '}
              <span style={{ color: '#D63C3C' }}>*</span>
            </label>

            <select
              value={typeProduit}
              onChange={(e) => setTypeProduit(e.target.value)}
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
                Sélectionner une catégorie standardisée
              </option>

              <option value="Vrac solide">Vrac solide</option>
              <option value="Métallurgie">Métallurgie</option>
              <option value="Agroalimentaire">Agroalimentaire</option>
              <option value="Matières premières">Matières premières</option>
              <option value="Marchandise générale">Marchandise générale</option>
            </select>
          </div>

          {/* Boutons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('marchandises')
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
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Fenêtre de confirmation */}
      {produitCree && (
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
              Produit créé avec succès
            </h2>

            <p
              style={{
                margin: '0 0 22px',
                fontSize: '10px',
                color: '#526C84',
                lineHeight: 1.5,
              }}
            >
              Le produit a été ajouté avec succès.
            </p>

            <button
              type="button"
              onClick={() => {
                setProduitCree(false)

                if (onNavigate) {
                  onNavigate('marchandises')
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

export default AjouterProduit