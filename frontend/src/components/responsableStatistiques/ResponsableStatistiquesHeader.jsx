function ResponsableStatistiquesHeader({
  nom = 'Nom',
  prenom = 'Prénom',
  initiales = 'RS',
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
        position: 'relative',
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {/* Nom et prénom */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            marginRight: '14px',
            lineHeight: '1.2',
          }}
        >
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#101828',
              whiteSpace: 'nowrap',
            }}
          >
            {prenom} {nom}
          </span>

          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: '#344D66',
              whiteSpace: 'nowrap',
              marginTop: '4px',
              letterSpacing: '0.06em',
              background: '#EEF3F9',
              padding: '3px 9px',
              borderRadius: '999px',
            }}
          >
            RESPONSABLE DES STATISTIQUES
          </span>
        </div>

        {/* Avatar */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, #1F3548 0%, #0F2942 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(15,41,66,0.28)',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            {initiales}
          </span>
        </div>
      </div>
    </header>
  )
}

export default ResponsableStatistiquesHeader