function ConfirmationDeconnexion({
  onCancel,
  onConfirm,
}) {
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
      }}
    >
      <div
        style={{
          width: '400px',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          padding: '28px',
          boxSizing: 'border-box',
          boxShadow: '0 8px 30px rgba(15, 41, 66, 0.15)',
        }}
      >
        {/* Titre */}
        <h2
          style={{
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: 600,
            color: '#0F2942',
          }}
        >
          Déconnexion
        </h2>

        {/* Message */}
        <p
          style={{
            margin: '0',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#6B7075',
          }}
        >
          Êtes-vous sûr de vouloir vous déconnecter ?
        </p>

        {/* Boutons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '28px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              height: '38px',
              padding: '0 18px',
              border: '1px solid #D9E0E7',
              borderRadius: '5px',
              backgroundColor: '#FFFFFF',
              color: '#344D66',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirm}
            style={{
              height: '38px',
              padding: '0 18px',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: '#0F2942',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDeconnexion
