function IconeNavire() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 18l2 2h14l2-2" />
      <path d="M5 18l1.5-7h11L19 18" />
      <path d="M8 11V7h8v4" />
      <path d="M10 7V4h4v3" />
    </svg>
  )
}

function SupprimerNavire({
  navire,
  onCancel,
  onConfirm,
}) {
  if (!navire) {
    return null
  }

  const supprimerNavire = async () => {
    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `http://127.0.0.1:8000/api/navires/${navire.id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))

        console.error(
          'Erreur lors de la suppression du navire :',
          data
        )

        return
      }

      if (onConfirm) {
        onConfirm()
      }
    } catch (error) {
      console.error(
        'Erreur de connexion au serveur :',
        error
      )
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 41, 66, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#FFFFFF',
          borderRadius: '7px',
          padding: '28px',
          boxSizing: 'border-box',
          boxShadow: '0 8px 30px rgba(15, 41, 66, 0.15)',
        }}
      >
        {/* Titre */}
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#172F43',
            margin: 0,
          }}
        >
          Supprimer le navire ?
        </h2>

        {/* Message */}
        <p
          style={{
            fontSize: '11px',
            color: '#71808D',
            lineHeight: 1.6,
            margin: '10px 0 20px',
          }}
        >
          Vous êtes sur le point de supprimer définitivement le
          navire suivant :
        </p>

        {/* Navire */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F5F7FA',
            border: '1px solid #E5EBF0',
            borderRadius: '4px',
            padding: '12px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '3px',
              backgroundColor: '#0F2942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconeNavire />
          </div>

          <div
            style={{
              marginLeft: '11px',
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#263D4E',
              }}
            >
              {navire.nom_navire}
            </div>

            <div
              style={{
                fontSize: '9px',
                color: '#7D91A3',
                marginTop: '3px',
              }}
            >
              {navire.numero_navire}
            </div>
          </div>
        </div>

        {/* Avertissement */}
        <p
          style={{
            fontSize: '10px',
            color: '#D63C3C',
            margin: '16px 0 24px',
            lineHeight: 1.5,
          }}
        >
          Cette action est définitive et ne pourra pas être annulée.
        </p>

        {/* Boutons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: '34px',
              border: 'none',
              borderRadius: '2px',
              backgroundColor: '#F0F2F4',
              color: '#526C84',
              padding: '0 15px',
              fontSize: '10px',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={supprimerNavire}
            style={{
              height: '34px',
              border: 'none',
              borderRadius: '2px',
              backgroundColor: '#D63C3C',
              color: '#FFFFFF',
              padding: '0 15px',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default SupprimerNavire