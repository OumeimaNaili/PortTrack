function IconeFleche() {  
  return (  
    <svg  
      width="15"  
      height="15"  
      viewBox="0 0 24 24"  
      fill="none"  
      stroke="#0F2942"  
      strokeWidth="2.2"  
      strokeLinecap="round"  
      strokeLinejoin="round"  
    >  
      <line x1="5" y1="12" x2="19" y2="12" />  
      <polyline points="12 5 19 12 12 19" />  
    </svg>  
  )  
}  
  
function PageAccueil({ onConnexion }) {  
  return (  
    <div  
      style={{  
        position: 'relative',  
        width: '100%',  
        minHeight: '100vh',  
        overflow: 'hidden',  
        boxSizing: 'border-box',  
      }}  
    >  
      {/* Image de fond */}  
      <div  
        style={{  
          position: 'absolute',  
          inset: 0,  
          backgroundImage: 'url(/page1.png)',  
          backgroundSize: 'cover',  
          backgroundPosition: 'center',  
          backgroundRepeat: 'no-repeat',  
        }}  
      />  
  
      {/* Contenu */}  
      <div  
        style={{  
          position: 'relative',  
          zIndex: 1,  
          width: '100%',  
          minHeight: '100vh',  
          display: 'flex',  
          flexDirection: 'column',  
          boxSizing: 'border-box',  
        }}  
      >  
        {/* En-tête / Logo */}  
        <header  
          style={{  
            width: '100%',  
            padding: '47px 40px 0',  
            boxSizing: 'border-box',  
            display: 'flex',  
            justifyContent: 'center',  
          }}  
        >  
          <img  
            src="/porttrack-logo.png"  
            alt="PortTrack"  
            style={{  
              height: '60px',  
              width: 'auto',  
              display: 'block',  
              objectFit: 'contain',  
            }}  
          />  
        </header>  
  
        {/* Bloc central */}  
        <div  
          style={{  
            flex: 1,  
            display: 'flex',  
            flexDirection: 'column',  
            alignItems: 'center',  
            justifyContent: 'center',  
            textAlign: 'center',  
            padding: '0 20px',  
          }}  
        >  
          {/* Badge */}  
          <div  
            style={{  
              display: 'inline-flex',  
              alignItems: 'center',  
              gap: '8px',  
              padding: '7px 16px',  
              borderRadius: '20px',  
              border: '1px solid rgba(255,255,255,0.35)',  
              backgroundColor: 'rgba(3,12,22,0.45)',  
              marginBottom: '22px',  
            }}  
          >  
            <span  
              style={{  
                width: '6px',  
                height: '6px',  
                borderRadius: '50%',  
                backgroundColor: '#4FA3FF',  
                flexShrink: 0,  
              }}  
            />  
            <span  
              style={{  
                fontSize: '11px',  
                fontWeight: 600,  
                letterSpacing: '1.2px',  
                textTransform: 'uppercase',  
                color: '#EDF3F9',  
                whiteSpace: 'nowrap',  
              }}  
            >  
              Système de gestion des opérations de déchargement  
            </span>  
          </div>  
  
          {/* Titre */}  
          <h1  
            style={{  
              fontSize: '40px',  
              fontWeight: 700,  
              color: '#FFFFFF',  
              lineHeight: 1.25,  
              margin: 0,  
              maxWidth: '780px',  
              letterSpacing: '-0.5px',  
            }}  
          >  
            Supervision &amp; Contrôle des Opérations  
            <br />  
            de Déchargement Portuaire  
          </h1>  
  
          {/* Bouton */}  
          <button  
            type="button"  
            onClick={() => {  
              if (onConnexion) {  
                onConnexion()  
              }  
            }}  
            style={{  
              marginTop: '36px',  
              display: 'inline-flex',  
              alignItems: 'center',  
              gap: '10px',  
              height: '46px',  
              padding: '0 22px',  
              backgroundColor: '#B9D9F7',  
              border: 'none',  
              borderRadius: '6px',  
              color: '#0F2942',  
              fontSize: '13px',  
              fontWeight: 600,  
              cursor: 'pointer',  
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',  
            }}  
          >  
            Se connecter à la plateforme  
            <IconeFleche />  
          </button>  
        </div>  
      </div>  
    </div>  
  )  
}  
  
export default PageAccueil