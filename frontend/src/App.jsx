import { useEffect, useState } from 'react'

import PageAccueil from './pages/PageAccueil'
import PageConnexion from './pages/PageConnexion'
import PageProfil from './pages/PageProfil'

import AdminDashboard from './pages/admin/AdminDashboard'
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs'
import AjouterUtilisateur from './pages/admin/AjouterUtilisateur'
import ConsulterUtilisateur from './pages/admin/ConsulterUtilisateur'
import ModifierUtilisateur from './pages/admin/ModifierUtilisateur'
import SupprimerUtilisateur from './pages/admin/SupprimerUtilisateur'
import GestionNavires from './pages/admin/GestionNavires'
import AjouterNavire from './pages/admin/AjouterNavire'
import ModifierNavire from './pages/admin/ConsulterNavire'
import SupprimerNavire from './pages/admin/SupprimerNavire'
import GestionProduits from './pages/admin/GestionProduits'
import AjouterProduit from './pages/admin/AjouterProduit'
import ConsulterProduit from './pages/admin/ConsulterProduit'
import SupprimerProduit from './pages/admin/SupprimerProduit'

import FicheJournaliere from './pages/chefMagasinier/FicheJournaliere'
import HistoriqueSaisies from './pages/chefMagasinier/HistoriqueSaisies'
import ValidationFiche from './pages/responsableOperations/ValidationFiche'
import FichesParMois from './pages/responsableOperations/FichesParMois'

import AdminLayout from './components/admin/AdminLayout'
import ChefMagasinierLayout from './components/chefMagasinier/ChefMagasinierLayout'
import ResponsableOperationsLayout from './components/responsableOperations/ResponsableOperationsLayout'
import ConfirmationDeconnexion from './components/ConfirmationDeconnexion'
import DirecteurLayout from './components/directeur/DirecteurLayout'
import ResponsableStatistiquesLayout from './components/responsableStatistiques/ResponsableStatistiquesLayout'

import PageNotifications from './pages/PageNotifications'
import SuiviDechargement from './pages/SuiviDechargement'

function App() {
  const [pageActive, setPageActive] = useState('accueil')

  const [utilisateurConnecte, setUtilisateurConnecte] =
    useState(null)

  const [utilisateurSelectionne, setUtilisateurSelectionne] =
    useState(null)

  const [utilisateurASupprimer, setUtilisateurASupprimer] =
    useState(null)

  const [actualisationUtilisateurs, setActualisationUtilisateurs] =
    useState(0)

  const [navireSelectionne, setNavireSelectionne] =
    useState(null)

  const [navireASupprimer, setNavireASupprimer] =
    useState(null)

  const [actualisationNavires, setActualisationNavires] =
    useState(0)

  const [produitSelectionne, setProduitSelectionne] =
    useState(null)

  const [produitASupprimer, setProduitASupprimer] =
    useState(null)

  const [actualisationProduits, setActualisationProduits] =
    useState(0)

  const [deconnexionDemandee, setDeconnexionDemandee] =
    useState(false)

    const [pageChefMagasinier, setPageChefMagasinier] =
    useState('suiviDechargement')

  const [pageResponsableOperations, setPageResponsableOperations] =
    useState('suiviDechargement')

  const [pageDirecteur, setPageDirecteur] =
    useState('suiviDechargement')

  const [pageResponsableStatistiques, setPageResponsableStatistiques] =
    useState('suiviDechargement')

  const [moisNotificationDirecteur, setMoisNotificationDirecteur] =
    useState(null)

  const [ficheSelectionneePourValidation, setFicheSelectionneePourValidation] =
    useState(null)

  const [dateFicheNotificationChef, setDateFicheNotificationChef] =
    useState(null)

  useEffect(() => {
    const demanderDeconnexionDepuisSidebar = () => {
      setDeconnexionDemandee(true)
    }

    window.addEventListener(
      'demanderDeconnexion',
      demanderDeconnexionDepuisSidebar
    )

    return () => {
      window.removeEventListener(
        'demanderDeconnexion',
        demanderDeconnexionDepuisSidebar
      )
    }
  }, [])

  const ouvrirConsultation = (utilisateur) => {
    setUtilisateurSelectionne(utilisateur)
    setPageActive('consulterUtilisateur')
  }

  const ouvrirModification = (utilisateur) => {
    setUtilisateurSelectionne(utilisateur)
    setPageActive('modifierUtilisateur')
  }

  const ouvrirSuppression = (utilisateur) => {
    setUtilisateurASupprimer(utilisateur)
  }

  const confirmerSuppression = async () => {
    if (!utilisateurASupprimer) {
      return
    }

    try {
      const token = sessionStorage.getItem('token')

      const response = await fetch(
        `http://127.0.0.1:8000/api/utilisateurs/${utilisateurASupprimer.id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (response.status === 204) {
        setUtilisateurASupprimer(null)

        setActualisationUtilisateurs(
          (ancienneValeur) => ancienneValeur + 1
        )

        return
      }

      let data = {}

      try {
        data = await response.json()
      } catch (error) {
        console.error(
          'Impossible de lire la réponse du serveur :',
          error
        )
      }

      console.error(
        'Erreur lors de la suppression de l’utilisateur :',
        data
      )

      alert(
        data.detail ||
          'Impossible de supprimer cet utilisateur.'
      )
    } catch (error) {
      console.error(
        'Erreur de connexion au serveur :',
        error
      )

      alert('Erreur de connexion au serveur.')
    }
  }

  const ouvrirModificationNavire = (navire) => {
    setNavireSelectionne(navire)
    setPageActive('modifierNavire')
  }

  const ouvrirSuppressionNavire = (navire) => {
    setNavireASupprimer(navire)
  }

  const confirmerSuppressionNavire = () => {
    setNavireASupprimer(null)

    setActualisationNavires(
      (ancienneValeur) => ancienneValeur + 1
    )
  }

  const ouvrirConsultationProduit = (produit) => {
    setProduitSelectionne(produit)
    setPageActive('consulterProduit')
  }

  const ouvrirSuppressionProduit = (produit) => {
    setProduitASupprimer(produit)
  }

  const confirmerSuppressionProduit = async () => {
    if (!produitASupprimer) {
      return
    }

    try {
      const token = sessionStorage.getItem('token')

      const response = await fetch(
        `http://127.0.0.1:8000/api/produits/${produitASupprimer.id}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      )

      if (response.status === 204) {
        setProduitASupprimer(null)

        setActualisationProduits(
          (ancienneValeur) => ancienneValeur + 1
        )

        return
      }

      let data = {}

      try {
        data = await response.json()
      } catch (error) {
        console.error(
          'Impossible de lire la réponse du serveur :',
          error
        )
      }

      console.error(
        'Erreur lors de la suppression du produit :',
        data
      )

      alert(
        data.detail ||
          'Impossible de supprimer ce produit.'
      )
    } catch (error) {
      console.error(
        'Erreur de connexion au serveur :',
        error
      )

      alert('Erreur de connexion au serveur.')
    }
  }

  const gererConnexion = (donnees) => {
    const utilisateur = donnees.utilisateur

    setUtilisateurConnecte(utilisateur)

    const profil = utilisateur?.profil?.nom_profil

       if (profil === 'Chef Magasinier') {
      setPageChefMagasinier('suiviDechargement')
      setPageActive('chefMagasinier')
      return
    }

    if (profil === 'Responsable des Opérations') {
      setPageResponsableOperations('suiviDechargement')
      setPageActive('responsableOperations')
      return
    }

    if (profil === 'Directeur') {
      setPageDirecteur('suiviDechargement')
      setPageActive('directeur')
      return
    }

    if (profil === 'Responsable des Statistiques') {
      setPageResponsableStatistiques('suiviDechargement')
      setPageActive('responsableStatistiques')
      return
    }

    setPageActive('tableauDeBord')
  }

  const demanderDeconnexion = () => {
    setDeconnexionDemandee(true)
  }

  const annulerDeconnexion = () => {
    setDeconnexionDemandee(false)
  }

  const gererDeconnexion = async () => {
    const token = sessionStorage.getItem('token')

    try {
      if (token) {
        await fetch(
          'http://127.0.0.1:8000/api/logout/',
          {
            method: 'POST',
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        )
      }
    } catch (error) {
      console.error(
        'Erreur lors de la déconnexion :',
        error
      )
    } finally {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('utilisateur')

      setUtilisateurConnecte(null)
      setDeconnexionDemandee(false)
      setPageActive('connexion')
    }
  }

  const ouvrirFicheDepuisNotification = (notification) => {
    const ficheId =
      notification && typeof notification === 'object'
        ? notification.fiche
        : notification

    setFicheSelectionneePourValidation(ficheId)
    setPageResponsableOperations('validationFiche')
  }

  const ouvrirNotificationChef = (notification) => {
    if (notification && typeof notification === 'object') {
      setDateFicheNotificationChef(
        notification.fiche_date || null
      )
    } else {
      setDateFicheNotificationChef(null)
    }

    setPageChefMagasinier('fichesJournalieres')
  }

  const ouvrirNotificationDirecteur = (notification) => {
    const moisNotification =
      notification &&
      typeof notification === 'object' &&
      notification.fiche_date
        ? notification.fiche_date.slice(0, 7)
        : null

    setMoisNotificationDirecteur(moisNotification)
    setPageDirecteur('fichesParMois')
  }

  const afficherConfirmationDeconnexion = () => {
    if (!deconnexionDemandee) {
      return null
    }

    return (
      <ConfirmationDeconnexion
        onCancel={annulerDeconnexion}
        onConfirm={gererDeconnexion}
      />
    )
  }

  /*
   * ============================
   * CHEF MAGASINIER
   * ============================
   */

  if (pageActive === 'chefMagasinier') {
    if (!utilisateurConnecte) {
      setPageActive('connexion')
      return null
    }

    const initiales = (
      (utilisateurConnecte.prenom?.charAt(0) || '') +
      (utilisateurConnecte.nom?.charAt(0) || '')
    ).toUpperCase()

    return (
      <ChefMagasinierLayout
        pageActive={pageChefMagasinier}
        nom={utilisateurConnecte.nom}
        prenom={utilisateurConnecte.prenom}
        initiales={initiales}
        onNavigate={setPageChefMagasinier}
        onDeconnexion={demanderDeconnexion}
      >
        {pageChefMagasinier === 'notifications' ? (
          <PageNotifications
            onNotificationClick={ouvrirNotificationChef}
          />
        ) : pageChefMagasinier === 'fichesJournalieres' ? (
          <FicheJournaliere
            onNavigate={setPageChefMagasinier}
            onDeconnexion={demanderDeconnexion}
            dateFicheInitiale={dateFicheNotificationChef}
          />
                ) : pageChefMagasinier === 'suiviDechargement' ? (
          <SuiviDechargement />
        ) : pageChefMagasinier === 'historique' ? (
          <HistoriqueSaisies />
        ) : pageChefMagasinier === 'profil' ? (
          <PageProfil utilisateur={utilisateurConnecte} />
        ) : (
          <div>
            <h1
              style={{
                margin: 0,
                color: '#172F43',
                fontSize: '24px',
              }}
            >
              Tableau de bord
            </h1>

            <p
              style={{
                color: '#6A7C92',
                marginTop: '8px',
              }}
            >
              Bienvenue {utilisateurConnecte.prenom}{' '}
              {utilisateurConnecte.nom}
            </p>
          </div>
        )}

        {deconnexionDemandee && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
          >
            <div
              style={{
                width: '360px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontSize: '18px',
                  color: '#172F43',
                }}
              >
                Déconnexion
              </h2>

              <p
                style={{
                  margin: '0 0 22px',
                  fontSize: '13px',
                  color: '#6A7C92',
                }}
              >
                Voulez-vous vraiment vous déconnecter ?
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={annulerDeconnexion}
                  style={{
                    padding: '9px 16px',
                    border: '1px solid #D9E1E8',
                    borderRadius: '5px',
                    backgroundColor: '#FFFFFF',
                    color: '#5F7388',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={gererDeconnexion}
                  style={{
                    padding: '9px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: '#0F2942',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </ChefMagasinierLayout>
    )
  }

  /*
   * ============================
   * RESPONSABLE DES OPÉRATIONS
   * ============================
   */

  if (pageActive === 'responsableOperations') {
    if (!utilisateurConnecte) {
      setPageActive('connexion')
      return null
    }

    const initiales = (
      (utilisateurConnecte.prenom?.charAt(0) || '') +
      (utilisateurConnecte.nom?.charAt(0) || '')
    ).toUpperCase()

    return (
      <ResponsableOperationsLayout
        pageActive={pageResponsableOperations}
        nom={utilisateurConnecte.nom}
        prenom={utilisateurConnecte.prenom}
        initiales={initiales}
        onNavigate={setPageResponsableOperations}
        onDeconnexion={demanderDeconnexion}
        onNotificationClick={ouvrirFicheDepuisNotification}
      >
        {pageResponsableOperations === 'notifications' ? (
          <PageNotifications
            onNotificationClick={ouvrirFicheDepuisNotification}
          />
        ) : pageResponsableOperations === 'validationFiche' ? (
          <ValidationFiche
            ficheId={ficheSelectionneePourValidation}
            onNavigate={setPageResponsableOperations}
            onDeconnexion={demanderDeconnexion}
          />
        ) : pageResponsableOperations === 'suiviDechargement' ? (
          <SuiviDechargement />
                ) : pageResponsableOperations === 'fichesParMois' ? (
          <FichesParMois />
        ) : pageResponsableOperations === 'profil' ? (
          <PageProfil utilisateur={utilisateurConnecte} />
        ) : pageResponsableOperations === 'parametres' ? (
          <div>
            <h1
              style={{
                margin: 0,
                color: '#172F43',
                fontSize: '24px',
              }}
            >
              Paramètres
            </h1>
          </div>
        ) : null}

        {deconnexionDemandee && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
          >
            <div
              style={{
                width: '360px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontSize: '18px',
                  color: '#172F43',
                }}
              >
                Déconnexion
              </h2>

              <p
                style={{
                  margin: '0 0 22px',
                  fontSize: '13px',
                  color: '#6A7C92',
                }}
              >
                Voulez-vous vraiment vous déconnecter ?
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={annulerDeconnexion}
                  style={{
                    padding: '9px 16px',
                    border: '1px solid #D9E1E8',
                    borderRadius: '5px',
                    backgroundColor: '#FFFFFF',
                    color: '#5F7388',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={gererDeconnexion}
                  style={{
                    padding: '9px 16px',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: '#0F2942',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        )}
      </ResponsableOperationsLayout>
    )
  }

  /*
   * ============================
   * DIRECTEUR
   * ============================
   */

  if (pageActive === 'directeur') {
    if (!utilisateurConnecte) {
      setPageActive('connexion')
      return null
    }

    const initiales = (
      (utilisateurConnecte.prenom?.charAt(0) || '') +
      (utilisateurConnecte.nom?.charAt(0) || '')
    ).toUpperCase()

    return (
      <DirecteurLayout
        pageActive={pageDirecteur}
        nom={utilisateurConnecte.nom}
        prenom={utilisateurConnecte.prenom}
        initiales={initiales}
        onNavigate={setPageDirecteur}
        onDeconnexion={demanderDeconnexion}
      >
        {pageDirecteur === 'notifications' ? (
          <PageNotifications
            onNotificationClick={ouvrirNotificationDirecteur}
          />
        ) : pageDirecteur === 'fichesParMois' ? (
          <FichesParMois
            lectureSeule
            moisInitial={moisNotificationDirecteur}
          />
        ) : pageDirecteur === 'suiviDechargement' ? (
          <SuiviDechargement />
        ) : pageDirecteur === 'profil' ? (
          <PageProfil utilisateur={utilisateurConnecte} />
        ) : pageDirecteur === 'parametres' ? (
          <div>
            <h1
              style={{
                margin: 0,
                color: '#172F43',
                fontSize: '24px',
              }}
            >
              Paramètres
            </h1>
          </div>
        ) : null}

        {afficherConfirmationDeconnexion()}
      </DirecteurLayout>
    )
  }

  /*
   * ============================
   * RESPONSABLE DES STATISTIQUES
   * ============================
   */

  if (pageActive === 'responsableStatistiques') {
    if (!utilisateurConnecte) {
      setPageActive('connexion')
      return null
    }

    const initiales = (
      (utilisateurConnecte.prenom?.charAt(0) || '') +
      (utilisateurConnecte.nom?.charAt(0) || '')
    ).toUpperCase()

    return (
      <ResponsableStatistiquesLayout
        pageActive={pageResponsableStatistiques}
        nom={utilisateurConnecte.nom}
        prenom={utilisateurConnecte.prenom}
        initiales={initiales}
        onNavigate={setPageResponsableStatistiques}
        onDeconnexion={demanderDeconnexion}
      >
        {pageResponsableStatistiques === 'suiviDechargement' ? (
          <SuiviDechargement />
        ) : pageResponsableStatistiques === 'profil' ? (
          <PageProfil utilisateur={utilisateurConnecte} />
        ) : pageResponsableStatistiques === 'parametres' ? (
          <div>
            <h1
              style={{
                margin: 0,
                color: '#172F43',
                fontSize: '24px',
              }}
            >
              Paramètres
            </h1>
          </div>
        ) : null}

        {afficherConfirmationDeconnexion()}
      </ResponsableStatistiquesLayout>
    )
  }

  /*
   * ============================
   * FICHE JOURNALIÈRE
   * ============================
   */

  if (pageActive === 'ficheJournaliere') {
    return (
      <>
        <FicheJournaliere
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  /*
   * ============================
   * PAGES PRINCIPALES
   * ============================
   */

  if (pageActive === 'accueil') {
    return (
      <PageAccueil
        onConnexion={() => setPageActive('connexion')}
      />
    )
  }

  if (pageActive === 'connexion') {
    return (
      <PageConnexion
        onConnexion={gererConnexion}
      />
    )
  }

  if (pageActive === 'ajouterUtilisateur') {
    return (
      <>
        <AjouterUtilisateur
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'consulterUtilisateur') {
    return (
      <>
        <ConsulterUtilisateur
          utilisateur={utilisateurSelectionne}
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'modifierUtilisateur') {
    return (
      <>
        <ModifierUtilisateur
          utilisateur={utilisateurSelectionne}
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'utilisateurs') {
    return (
      <>
        <GestionUtilisateurs
          onNavigate={setPageActive}
          onConsulter={ouvrirConsultation}
          onModifier={ouvrirModification}
          onSupprimer={ouvrirSuppression}
          actualisation={actualisationUtilisateurs}
          onDeconnexion={demanderDeconnexion}
        />

        <SupprimerUtilisateur
          utilisateur={utilisateurASupprimer}
          onCancel={() => setUtilisateurASupprimer(null)}
          onConfirm={confirmerSuppression}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'navires') {
    return (
      <>
        <GestionNavires
          onNavigate={setPageActive}
          onModifierNavire={ouvrirModificationNavire}
          onSupprimerNavire={ouvrirSuppressionNavire}
          actualisation={actualisationNavires}
          onDeconnexion={demanderDeconnexion}
        />

        <SupprimerNavire
          navire={navireASupprimer}
          onCancel={() => setNavireASupprimer(null)}
          onConfirm={confirmerSuppressionNavire}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'ajouterNavire') {
    return (
      <>
        <AjouterNavire
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'modifierNavire') {
    return (
      <>
        <ModifierNavire
          navire={navireSelectionne}
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'marchandises') {
    return (
      <>
        <GestionProduits
          onNavigate={setPageActive}
          onModifierProduit={ouvrirConsultationProduit}
          onSupprimerProduit={ouvrirSuppressionProduit}
          actualisation={actualisationProduits}
          onDeconnexion={demanderDeconnexion}
        />

        <SupprimerProduit
          produit={produitASupprimer}
          onCancel={() => setProduitASupprimer(null)}
          onConfirm={confirmerSuppressionProduit}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'ajouterProduit') {
    return (
      <>
        <AjouterProduit
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'consulterProduit') {
    return (
      <>
        <ConsulterProduit
          produit={produitSelectionne}
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        />

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  if (pageActive === 'profil') {
    if (!utilisateurConnecte) {
      setPageActive('connexion')
      return null
    }

    return (
      <>
        <AdminLayout
          pageActive="profil"
          nomAdministrateur={`${utilisateurConnecte.prenom || ''} ${utilisateurConnecte.nom || ''}`.trim()}
          onNavigate={setPageActive}
          onDeconnexion={demanderDeconnexion}
        >
          <PageProfil utilisateur={utilisateurConnecte} />
        </AdminLayout>

        {afficherConfirmationDeconnexion()}
      </>
    )
  }

  return (
    <AdminDashboard
      onNavigate={setPageActive}
      onModifier={ouvrirModification}
      onDeconnexion={demanderDeconnexion}
      deconnexionDemandee={deconnexionDemandee}
      onAnnulerDeconnexion={annulerDeconnexion}
      onConfirmerDeconnexion={gererDeconnexion}
    />
  )
}

export default App
