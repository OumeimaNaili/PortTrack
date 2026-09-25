from django.db.models import Q
import re

from rest_framework import viewsets, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .authentication import CustomTokenAuthentication
from .permissions import IsAdministrateur

from .models import (
    AuthToken,
    Profil,
    Utilisateur,
    Navire,
    Produit,
    ProduitNavire,
    DetailDechargement,
)

from .serializers import (
    ProfilSerializer,
    UtilisateurSerializer,
    NavireSerializer,
    ProduitSerializer,
    ProduitNavireSerializer,
    DetailDechargementSerializer,
)


class ProfilViewSet(viewsets.ModelViewSet):
    queryset = Profil.objects.all()
    serializer_class = ProfilSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdministrateur]


class UtilisateurViewSet(viewsets.ModelViewSet):
    queryset = Utilisateur.objects.select_related('profil').all()
    serializer_class = UtilisateurSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdministrateur]

    def get_queryset(self):
        queryset = Utilisateur.objects.select_related('profil').all()

        recherche = self.request.query_params.get('search', '').strip()

        if recherche:
            queryset = queryset.filter(
                Q(nom__icontains=recherche) |
                Q(prenom__icontains=recherche) |
                Q(identifiant__icontains=recherche) |
                Q(email__icontains=recherche)
            )

        return queryset

    def update(self, request, *args, **kwargs):
        utilisateur = self.get_object()

        if utilisateur.profil.nom_profil == 'Administrateur':
            return Response(
                {
                    'detail': 'La modification d’un Administrateur est interdite.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        utilisateur = self.get_object()

        if utilisateur.profil.nom_profil == 'Administrateur':
            return Response(
                {
                    'detail': 'La modification d’un Administrateur est interdite.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        utilisateur = self.get_object()

        if utilisateur.profil.nom_profil == 'Administrateur':
            return Response(
                {
                    'detail': 'La suppression d’un Administrateur est interdite.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)


class NavireViewSet(viewsets.ModelViewSet):
    queryset = Navire.objects.all()
    serializer_class = NavireSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdministrateur]

    def get_queryset(self):
        queryset = Navire.objects.all()

        recherche = self.request.query_params.get('search', '').strip()

        if recherche:
            queryset = queryset.filter(
                Q(nom_navire__icontains=recherche) |
                Q(numero_navire__icontains=recherche) |
                Q(numero_escale__icontains=recherche)
            )

        return queryset

    def perform_create(self, serializer):
        nom = serializer.validated_data['nom_navire'].strip()

        # Remplacer les espaces par des tirets
        nom_formate = re.sub(r'\s+', '-', nom)

        # Récupérer tous les numéros déjà utilisés
        numeros_existants = Navire.objects.values_list(
            'numero_navire',
            flat=True
        )

        numeros_utilises = set()

        for numero_existant in numeros_existants:
            match = re.search(r'-(\d+)$', numero_existant)

            if match:
                numeros_utilises.add(int(match.group(1)))

        # Chercher le premier numéro disponible globalement
        compteur = 1

        while compteur in numeros_utilises:
            compteur += 1

        # Numéro sur 5 chiffres
        numero = f"{nom_formate}-{compteur:05d}"

        serializer.save(numero_navire=numero)

    def destroy(self, request, *args, **kwargs):
        navire = self.get_object()

        self.perform_destroy(navire)

        return Response(
            {
                'message': 'Navire supprimé avec succès.'
            },
            status=status.HTTP_204_NO_CONTENT
        )


class ProduitViewSet(viewsets.ModelViewSet):
    queryset = Produit.objects.all()
    serializer_class = ProduitSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated, IsAdministrateur]

    def get_queryset(self):
        queryset = Produit.objects.all()

        recherche = self.request.query_params.get('search', '').strip()

        if recherche:
            queryset = queryset.filter(
                Q(designation__icontains=recherche) |
                Q(type_produit__icontains=recherche)
            )

        return queryset


class ProduitNavireViewSet(viewsets.ModelViewSet):
    queryset = ProduitNavire.objects.all()
    serializer_class = ProduitNavireSerializer


class DetailDechargementViewSet(viewsets.ModelViewSet):
    queryset = DetailDechargement.objects.all()
    serializer_class = DetailDechargementSerializer


@api_view(['POST'])
def login(request):
    identifiant = request.data.get('identifiant')
    mot_de_passe = request.data.get('mot_de_passe')

    if not identifiant or not mot_de_passe:
        return Response(
            {
                'detail': 'Identifiant et mot de passe sont obligatoires.'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        utilisateur = Utilisateur.objects.select_related('profil').get(
            identifiant=identifiant
        )
    except Utilisateur.DoesNotExist:
        return Response(
            {
                'detail': 'Identifiant ou mot de passe incorrect.'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not utilisateur.check_password(mot_de_passe):
        return Response(
            {
                'detail': 'Identifiant ou mot de passe incorrect.'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )

    auth_token, created = AuthToken.objects.get_or_create(
        utilisateur=utilisateur
    )

    return Response(
        {
            'message': 'Connexion réussie.',
            'token': auth_token.token,
            'utilisateur': {
                'id': utilisateur.id,
                'identifiant': utilisateur.identifiant,
                'nom': utilisateur.nom,
                'prenom': utilisateur.prenom,
                'email': utilisateur.email,
                'profil': {
                    'id': utilisateur.profil.id,
                    'nom_profil': utilisateur.profil.nom_profil,
                },
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@authentication_classes([CustomTokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    request.auth.delete()

    return Response(
        {
            'message': 'Déconnexion réussie.'
        },
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
def dashboard(request):
    nombre_utilisateurs = Utilisateur.objects.count()
    nombre_navires = Navire.objects.count()
    nombre_produits = Produit.objects.count()
    nombre_comptes_actifs = Utilisateur.objects.filter(
        actif=True
    ).count()

    utilisateurs = Utilisateur.objects.select_related(
        'profil'
    ).order_by('-id')

    utilisateurs_data = []

    for utilisateur in utilisateurs:
        initiales = (
            utilisateur.prenom[:1] +
            utilisateur.nom[:1]
        ).upper()

        utilisateurs_data.append({
            'initiales': initiales,
            'nom': f'{utilisateur.prenom} {utilisateur.nom}',
            'email': utilisateur.email,
            'identifiant': utilisateur.identifiant,
            'profil': utilisateur.profil.nom_profil,
            'actif': utilisateur.actif,
        })

    return Response({
        'nombre_utilisateurs': nombre_utilisateurs,
        'nombre_navires': nombre_navires,
        'nombre_produits': nombre_produits,
        'nombre_comptes_actifs': nombre_comptes_actifs,
        'utilisateurs': utilisateurs_data,
    })