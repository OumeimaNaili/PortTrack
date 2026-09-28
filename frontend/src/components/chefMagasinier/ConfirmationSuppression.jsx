import React from 'react'

export default function ConfirmationSuppression({
  navireNom,
  onAnnuler,
  onConfirmer,
  suppression = false,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 41, 66, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#FFFFFF',
          borderRadius: '7px',
          padding: '28px',
          boxShadow:
            '0 8px 30px rgba(15, 41, 66, 0.15)',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            margin: '0 0 10px',
            fontSize: '18px',
            fontWeight: '700',
            color: '#172F43',
          }}
        >
          Supprimer le tableau ?
        </h2>

        <p
          style={{
            margin: '0 0 18px',
            fontSize: '12px',
            color: '#71808D',
            lineHeight: '1.6',
          }}
        >
          Vous êtes sur le point de supprimer
          définitivement le tableau de déchargement
          du navire suivant :
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: '#F5F7FA',
            border: '1px solid #E5EBF0',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '5px',
              background: '#E8F0FA',
              color: '#344D66',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 17L5 19H19L21 17"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 19L7 21H17L19 19"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 17L7 7H17L19 17"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 7V4H15V7"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 11H17"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#263D4E',
              }}
            >
              {navireNom}
            </div>

            <div
              style={{
                fontSize: '10px',
                color: '#7D91A3',
                marginTop: '3px',
              }}
            >
              Tableau de déchargement
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: '11px',
            color: '#D63C3C',
            marginBottom: '22px',
          }}
        >
          Cette action est définitive et ne pourra
          pas être annulée.
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={onAnnuler}
            disabled={suppression}
            style={{
              height: '34px',
              padding: '0 15px',
              border: 'none',
              borderRadius: '2px',
              background: '#F0F2F4',
              color: '#526C84',
              fontSize: '11px',
              cursor: suppression
                ? 'not-allowed'
                : 'pointer',
              opacity: suppression ? 0.6 : 1,
            }}
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onConfirmer}
            disabled={suppression}
            style={{
              height: '34px',
              padding: '0 15px',
              border: 'none',
              borderRadius: '2px',
              background: '#D63C3C',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '600',
              cursor: suppression
                ? 'not-allowed'
                : 'pointer',
              opacity: suppression ? 0.7 : 1,
            }}
          >
            {suppression
              ? 'Suppression...'
              : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  )
}
