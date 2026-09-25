function IconeNotification() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#6B7075"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}

function AdminHeader({
  initiales = 'AD',
}) {
  return (
    <header
      style={{
        height: '64px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E9EDF1',
        boxShadow: '0 1px 3px rgba(15, 41, 66, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px',
        flexShrink: 0,
        boxSizing: 'border-box',
        gap: '20px',
      }}
    >
      {/* Partie droite */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {/* Notification */}
        <button
          type="button"
          style={{
            border: 'none',
            background: 'transparent',
            padding: '4px',
            marginRight: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconeNotification />
        </button>

        {/* Séparateur */}
        <div
          style={{
            width: '1px',
            height: '28px',
            backgroundColor: '#E2E5EA',
            marginRight: '16px',
          }}
        />

        {/* Rôle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '10px',
          }}
        >
          <span
            style={{
              fontSize: '9px',
              fontWeight: 600,
              color: '#6A7C92',
              whiteSpace: 'nowrap',
            }}
          >
            ADMINISTRATEUR
          </span>
        </div>

        {/* Avatar */}
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: '#0F2942',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#FFFFFF',
            }}
          >
            {initiales}
          </span>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader