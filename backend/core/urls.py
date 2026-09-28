from django.urls import path

from rest_framework.routers import DefaultRouter

from .views import (
    ProfilViewSet,
    UtilisateurViewSet,
    NavireViewSet,
    ProduitViewSet,
    ProduitNavireViewSet,
    FicheJournaliereViewSet,
    DetailDechargementViewSet,
    login,
    logout,
    dashboard,
)


router = DefaultRouter()

router.register(r'profils', ProfilViewSet)
router.register(r'utilisateurs', UtilisateurViewSet)
router.register(r'navires', NavireViewSet)
router.register(r'produits', ProduitViewSet)
router.register(r'produits-navire', ProduitNavireViewSet)
router.register(r'fiches-journalieres', FicheJournaliereViewSet)
router.register(r'details-dechargement', DetailDechargementViewSet)


urlpatterns = [
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    path('dashboard/', dashboard, name='dashboard'),
]

urlpatterns += router.urls