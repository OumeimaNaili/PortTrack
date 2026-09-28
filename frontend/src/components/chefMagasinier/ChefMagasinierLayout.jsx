import ChefMagasinierHeader from './ChefMagasinierHeader'
import ChefMagasinierSidebar from './ChefMagasinierSidebar'

function ChefMagasinierLayout({
  children,
  pageActive = 'tableauDeBord',
  nom = 'Nom',
  prenom = 'Prénom',
  initiales = 'CM',
  onNavigate,
  onDeconnexion,
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F7FA',
        overflow: 'hidden',
      }}
    >
      {/* Barre latérale fixe */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '220px',
          zIndex: 1000,
        }}
      >
        <ChefMagasinierSidebar
          pageActive={pageActive}
          onNavigate={onNavigate}
          onDeconnexion={onDeconnexion}
        />
      </div>

      {/* Zone principale */}
      <div
        style={{
          marginLeft: '220px',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* En-tête fixe */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: '220px',
            right: 0,
            height: '64px',
            zIndex: 999,
          }}
        >
          <ChefMagasinierHeader
            nom={nom}
            prenom={prenom}
            initiales={initiales}
          />
        </div>

        {/* Contenu qui peut défiler */}
        <main
          style={{
            marginTop: '64px',
            minHeight: 'calc(100vh - 64px)',
            padding: '28px 32px',
            boxSizing: 'border-box',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default ChefMagasinierLayout