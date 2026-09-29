function LigneInfo({ libelle, valeur }) {
  return (
    <div
      style={{
        background: '#F8F9FB',
        borderRadius: '10px',
        padding: '14px 18px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          color: '#667085',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        {libelle}
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: '15px',
          color: '#172F43',
          wordBreak: 'break-word',
        }}
      >
        {valeur || '-'}
      </div>
    </div>
  )
}

function PageProfil({ utilisateur }) {
  const nom = utilisateur?.nom || ''
  const prenom = utilisateur?.prenom || ''

  const initiales = (
    (prenom.charAt(0) || '') + (nom.charAt(0) || '')
  ).toUpperCase()

  return (
    <div>
      <div
        style={{
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
        <h1
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#101828',
            margin: '0 0 6px 0',
          }}
        >
          Mon profil
        </h1>

        <p style={{ fontSize: '14px', color: '#667085', margin: 0 }}>
          Informations de votre compte.
        </p>
      </div>

      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '14px',
          padding: '28px',
          boxShadow:
            '0 1px 3px rgba(16,24,40,0.08), 0 1px 2px rgba(16,24,40,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            marginBottom: '26px',
            paddingBottom: '22px',
            borderBottom: '1px solid #EAECF0',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
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
                fontSize: '22px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {initiales}
            </span>
          </div>

          <div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#101828',
                marginBottom: '6px',
              }}
            >
              {prenom} {nom}
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#344D66',
                letterSpacing: '0.06em',
                background: '#EEF3F9',
                padding: '4px 10px',
                borderRadius: '999px',
                textTransform: 'uppercase',
              }}
            >
              {utilisateur?.profil?.nom_profil || '-'}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <LigneInfo libelle="Email" valeur={utilisateur?.email} />
          <LigneInfo
            libelle="Identifiant"
            valeur={utilisateur?.identifiant}
          />
          <LigneInfo
            libelle="Rôle"
            valeur={utilisateur?.profil?.nom_profil}
          />
        </div>
      </div>
    </div>
  )
}

export default PageProfil