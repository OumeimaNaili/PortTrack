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
            marginRight: '14px', 
          }} 
        > 
          <span 
            style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              color: '#344D66', 
              whiteSpace: 'nowrap', 
              letterSpacing: '0.06em', 
              background: '#EEF3F9', 
              padding: '5px 10px', 
              borderRadius: '999px', 
            }} 
          > 
            ADMINISTRATEUR 
          </span> 
        </div> 
 
        {/* Avatar */} 
        <div 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #1F3548 0%, #0F2942 100%)', 
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
 
      <style>{` 
        .hdr-notif-btn { 
          transition: background 0.15s ease, color 0.15s ease; 
        } 
 
        .hdr-notif-btn:hover { 
          background: #E9EEF5 !important; 
          color: #344D66 !important; 
        } 
      `}</style> 
    </header> 
  ) 
} 
 
export default AdminHeader