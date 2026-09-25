import AdminLayout from '../../components/admin/AdminLayout'

function IconeRetour() {
  return (
    <svg
      width="14"
      height="14"
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

function ConsulterNavire({
  navire,
  onNavigate,
}) {
  return (
    <AdminLayout
      pageActive="navires"
      nomAdministrateur="Nom admin"
      onNavigate={onNavigate}
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
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate('navires')
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
            marginBottom: '22px',
          }}
        >
          <IconeRetour />
          Retour à la gestion des navires
        </button>

        {/* Titre */}
        <div
          style={{
            marginBottom: '28px',
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
            Consulter le navire : {navire.nom_navire}
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: '#7189A1',
              margin: '7px 0 0',
            }}
          >
            Consultez les informations du navire.
          </p>
        </div>

        {/* Informations du navire */}
        <section
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
          {/* Nom + Numéro */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '18px',
              marginBottom: '32px',
            }}
          >
            {/* Nom du navire */}
            <div>
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
                Nom du navire
              </label>

              <div
                style={{
                  width: '100%',
                  minHeight: '40px',
                  backgroundColor: '#F0F2F4',
                  padding: '11px 12px',
                  fontSize: '11px',
                  color: '#374957',
                  boxSizing: 'border-box',
                }}
              >
                {navire.nom_navire}
              </div>
            </div>

            {/* Numéro du navire */}
            <div>
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
                Numéro du navire
              </label>

              <div
                style={{
                  width: '100%',
                  minHeight: '40px',
                  backgroundColor: '#F0F2F4',
                  padding: '11px 12px',
                  fontSize: '11px',
                  color: '#374957',
                  boxSizing: 'border-box',
                }}
              >
                {navire.numero_navire}
              </div>
            </div>
          </div>

          {/* Bouton */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('navires')
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
              Retour
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default ConsulterNavire
