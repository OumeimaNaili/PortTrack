import { useState } from 'react'

import PageAccueil from './pages/PageAccueil'
import PageConnexion from './pages/PageConnexion'
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

function App() {
  const [pageActive, setPageActive] = useState('accueil')
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
      const token = localStorage.getItem('token')

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
      const token = localStorage.getItem('token')

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
    setPageActive('tableauDeBord')
  }

  const demanderDeconnexion = () => {
    setDeconnexionDemandee(true)
  }

  const annulerDeconnexion = () => {
    setDeconnexionDemandee(false)
  }

  const gererDeconnexion = async () => {
    const token = localStorage.getItem('token')

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
      localStorage.removeItem('token')
      setDeconnexionDemandee(false)
      setPageActive('connexion')
    }
  }

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
      <AjouterUtilisateur
        onNavigate={setPageActive}
      />
    )
  }

  if (pageActive === 'consulterUtilisateur') {
    return (
      <ConsulterUtilisateur
        utilisateur={utilisateurSelectionne}
        onNavigate={setPageActive}
      />
    )
  }

  if (pageActive === 'modifierUtilisateur') {
    return (
      <ModifierUtilisateur
        utilisateur={utilisateurSelectionne}
        onNavigate={setPageActive}
      />
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
        />

        <SupprimerUtilisateur
          utilisateur={utilisateurASupprimer}
          onCancel={() => setUtilisateurASupprimer(null)}
          onConfirm={confirmerSuppression}
        />
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
        />

        <SupprimerNavire
          navire={navireASupprimer}
          onCancel={() => setNavireASupprimer(null)}
          onConfirm={confirmerSuppressionNavire}
        />
      </>
    )
  }

  if (pageActive === 'ajouterNavire') {
    return (
      <AjouterNavire
        onNavigate={setPageActive}
      />
    )
  }

  if (pageActive === 'modifierNavire') {
    return (
      <ModifierNavire
        navire={navireSelectionne}
        onNavigate={setPageActive}
      />
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
        />

        <SupprimerProduit
          produit={produitASupprimer}
          onCancel={() => setProduitASupprimer(null)}
          onConfirm={confirmerSuppressionProduit}
        />
      </>
    )
  }

  if (pageActive === 'ajouterProduit') {
    return (
      <AjouterProduit
        onNavigate={setPageActive}
      />
    )
  }

  if (pageActive === 'consulterProduit') {
    return (
      <ConsulterProduit
        produit={produitSelectionne}
        onNavigate={setPageActive}
      />
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