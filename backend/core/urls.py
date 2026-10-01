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

    NotificationViewSet,

    login,

    logout,

    dashboard,

    mon_profil,

    changer_mot_de_passe,

    mot_de_passe_oublie,

    reinitialiser_mot_de_passe,

)


router = DefaultRouter()

router.register(r'profils', ProfilViewSet)

router.register(r'utilisateurs', UtilisateurViewSet)

router.register(r'navires', NavireViewSet)

router.register(r'produits', ProduitViewSet)

router.register(r'produits-navire', ProduitNavireViewSet)

router.register(r'fiches-journalieres', FicheJournaliereViewSet)

router.register(r'details-dechargement', DetailDechargementViewSet)

router.register(r'notifications', NotificationViewSet, basename='notification')


urlpatterns = [

    path('login/', login, name='login'),

    path('logout/', logout, name='logout'),

    path('dashboard/', dashboard, name='dashboard'),

    path('mon-profil/', mon_profil, name='mon_profil'),

    path('changer-mot-de-passe/', changer_mot_de_passe, name='changer_mot_de_passe'),

    path('mot-de-passe-oublie/', mot_de_passe_oublie, name='mot_de_passe_oublie'),

    path('reinitialiser-mot-de-passe/', reinitialiser_mot_de_passe, name='reinitialiser_mot_de_passe'),

]

urlpatterns += router.urls