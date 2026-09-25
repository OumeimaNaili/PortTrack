function IconeProduit() {
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function SupprimerProduit({
  produit,
  onCancel,
  onConfirm,
}) {
  if (!produit) {
    return null
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
          Supprimer le produit ?
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
          produit suivant :
        </p>

        {/* Produit */}
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
            <IconeProduit />
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
              {produit.designation}
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
            onClick={onConfirm}
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

export default SupprimerProduit