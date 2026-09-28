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

function ConsulterUtilisateur({
  utilisateur,
  onNavigate,
  onDeconnexion,
}) {
  return (
    <AdminLayout
      pageActive="utilisateurs"
      nomAdministrateur="Nom admin"
      onNavigate={onNavigate}
      onDeconnexion={onDeconnexion}
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
              onNavigate('utilisateurs')
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
          Retour à la gestion des utilisateurs
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
            Détails de l’utilisateur : {utilisateur.nom}
          </h1>

          <p
            style={{
              fontSize: '12px',
              color: '#7189A1',
              margin: '7px 0 0',
            }}
          >
            Consultez les informations du compte utilisateur.
          </p>
        </div>

        {/* Carte utilisateur */}
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
          {/* Identité */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingBottom: '26px',
              borderBottom: '1px solid #E8EDF2',
              marginBottom: '26px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '3px',
                backgroundColor: '#0F2942',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '15px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {utilisateur.initiales}
            </div>

            <div
              style={{
                marginLeft: '15px',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#263D4E',
                  margin: 0,
                }}
              >
                {utilisateur.nom}
              </h2>

              <p
                style={{
                  fontSize: '11px',
                  color: '#7D91A3',
                  margin: '5px 0 0',
                }}
              >
                {utilisateur.email}
              </p>
            </div>
          </div>

          {/* Informations */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '24px 30px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '8px',
                }}
              >
                Nom & prénom
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#263D4E',
                  fontWeight: 500,
                }}
              >
                {utilisateur.nom}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '8px',
                }}
              >
                Identifiant système
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#263D4E',
                  fontWeight: 500,
                }}
              >
                #{utilisateur.identifiant}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '8px',
                }}
              >
                Adresse e-mail
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#263D4E',
                  fontWeight: 500,
                }}
              >
                {utilisateur.email}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '8px',
                }}
              >
                Profil d'accès
              </div>

              <span
                style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: 500,
                  color:
                    utilisateur.profil === 'Administrateur'
                      ? '#D63C3C'
                      : utilisateur.profil === 'Responsable des Statistiques'
                        ? '#1764B0'
                        : utilisateur.profil === 'Responsable des Opérations'
                          ? '#B4650B'
                          : utilisateur.profil === 'Chef Magasinier'
                            ? '#7A4FA3'
                            : utilisateur.profil === 'Directeur'
                              ? '#FFFFFF'
                              : '#526573',
                  backgroundColor:
                    utilisateur.profil === 'Administrateur'
                      ? '#FDECEC'
                      : utilisateur.profil === 'Responsable des Statistiques'
                        ? '#E6F0FC'
                        : utilisateur.profil === 'Responsable des Opérations'
                          ? '#FDF1E3'
                          : utilisateur.profil === 'Chef Magasinier'
                            ? '#F4EEFA'
                            : utilisateur.profil === 'Directeur'
                              ? '#17364F'
                              : '#F0F3F6',
                  border:
                    utilisateur.profil === 'Administrateur'
                      ? '1px solid #F5D0D0'
                      : utilisateur.profil === 'Responsable des Statistiques'
                        ? '1px solid #D5E5F7'
                        : utilisateur.profil === 'Responsable des Opérations'
                          ? '1px solid #F5DEBF'
                          : utilisateur.profil === 'Chef Magasinier'
                            ? '1px solid #E2D4EF'
                            : utilisateur.profil === 'Directeur'
                              ? 'none'
                              : '1px solid #E5E9ED',
                  borderRadius: '3px',
                  padding: '5px 10px',
                }}
              >
                {utilisateur.profil}
              </span>
            </div>

            <div>
              <div
                style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#526C84',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: '8px',
                }}
              >
                Statut du compte
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor:
                    utilisateur.statut === 'Actif'
                      ? '#ECFDF5'
                      : utilisateur.statut === 'Inactif'
                        ? '#FEF2F2'
                        : '#FFF7ED',
                  color:
                    utilisateur.statut === 'Actif'
                      ? '#159B62'
                      : utilisateur.statut === 'Inactif'
                        ? '#D64545'
                        : '#C76A12',
                  border:
                    utilisateur.statut === 'Actif'
                      ? '1px solid #C7F2DE'
                      : utilisateur.statut === 'Inactif'
                        ? '1px solid #F6D0D0'
                        : '1px solid #FEDDB8',
                  borderRadius: '12px',
                  padding: '4px 9px',
                  fontSize: '10px',
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor:
                      utilisateur.statut === 'Actif'
                        ? '#18B978'
                        : utilisateur.statut === 'Inactif'
                          ? '#E05252'
                          : '#E88A28',
                  }}
                />

                {utilisateur.statut}
              </span>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default ConsulterUtilisateur