function FicheHeader({
  title = 'Fiches journalières de déchargement',
  subtitle = "Saisie contradictoire des opérations par shift pour l'ensemble des navires à quai.",
}) {
  return (
    <div
      className="fh-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap',
        marginBottom: '24px',
        padding: '22px 28px',
        background: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E7EB',
        borderLeft: '5px solid #172F43',
        boxShadow:
          '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
      }}
    >
      {/* Titre + sous-titre */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '620px',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #1F3548 0%, #172F43 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(23,47,67,0.25)',
          }}
        >
          🚢
        </div>

        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#101828',
              margin: '0 0 6px 0',
              lineHeight: 1.3,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: '#667085',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <style>{`
        .fh-export-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
        }

        .fh-export-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
          box-shadow: 0 6px 16px rgba(20,83,45,0.35);
        }

        .fh-export-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(20,83,45,0.3);
        }
      `}</style>
    </div>
  )
}

export default FicheHeader