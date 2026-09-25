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

function ConsulterProduit({
  produit,
  onNavigate,
}) {
  return (
    <AdminLayout
      pageActive="marchandises"
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
              onNavigate('marchandises')
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
          Retour à la gestion des produits
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
            Consulter le produit : {produit.designation}
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: '#7189A1',
              margin: '7px 0 0',
            }}
          >
            Consultez les informations du produit.
          </p>
        </div>

        {/* Informations du produit */}
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
          {/* Désignation + Type */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '18px',
              marginBottom: '32px',
            }}
          >
            {/* Désignation */}
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
                Désignation
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
                {produit.designation}
              </div>
            </div>

            {/* Type de produit */}
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
                Type de produit
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
                {produit.type_produit}
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
                  onNavigate('marchandises')
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

export default ConsulterProduit