function SupprimerUtilisateur({
  utilisateur,
  onCancel,
  onConfirm,
}) {
  if (!utilisateur) {
    return null
  }

  const confirmerSuppression = async () => {
    try {
      await onConfirm()

      window.dispatchEvent(
        new CustomEvent('utilisateurSupprime')
      )
    } catch (error) {
      console.error(
        'Erreur lors de la suppression de l’utilisateur :',
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
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#172F43',
            margin: 0,
          }}
        >
          Supprimer l'utilisateur ?
        </h2>

        <p
          style={{
            fontSize: '11px',
            color: '#71808D',
            lineHeight: 1.6,
            margin: '10px 0 20px',
          }}
        >
          Vous êtes sur le point de supprimer définitivement le
          compte suivant :
        </p>

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
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {utilisateur.initiales}
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
              {utilisateur.nom}
            </div>

            <div
              style={{
                fontSize: '9px',
                color: '#7D91A3',
                marginTop: '3px',
              }}
            >
              #{utilisateur.identifiant}
            </div>
          </div>
        </div>

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
            onClick={confirmerSuppression}
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

export default SupprimerUtilisateur