import DirecteurHeader from './DirecteurHeader'
import DirecteurSidebar from './DirecteurSidebar'

function DirecteurLayout({
  children,
  pageActive = 'suiviDechargement',
  nom = 'Nom',
  prenom = 'Prénom',
  initiales = 'DI',
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
        <DirecteurSidebar
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
         <DirecteurHeader
            nom={nom}
            prenom={prenom}
            initiales={initiales}
            onNavigate={onNavigate}
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

export default DirecteurLayout