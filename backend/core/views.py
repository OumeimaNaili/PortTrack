from django.db import transaction
from django.db.models import Q
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from datetime import timedelta
import logging
import re
import secrets
import unicodedata

from rest_framework import viewsets, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    action,
)
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from .authentication import CustomTokenAuthentication
from .permissions import IsAdministrateur

from .models import (
    AuthToken,
    Profil,
    Utilisateur,
    Navire,
    Produit,
    ProduitNavire,
    FicheJournaliere,
    FicheProduit,
    DetailDechargement,
    ValidationFiche,
    Notification,
    CodeReinitialisation,
)

from .serializers import (
    ProfilSerializer,
    UtilisateurSerializer,
    NavireSerializer,
    ProduitSerializer,
    ProduitNavireSerializer,
    FicheJournaliereSerializer,
    DetailDechargementSerializer,
    ValidationFicheSerializer,
    NotificationSerializer,
)


def normaliser_texte(texte):
    texte = unicodedata.normalize('NFD', texte or '')
    texte = ''.join(
        caractere
        for caractere in texte
        if unicodedata.category(caractere) != 'Mn'
    )
    return ' '.join(texte.lower().split())


def est_responsable_operations(utilisateur):
    try:
        nom_profil = utilisateur.profil.nom_profil
    except Exception:
        return False

    return (
        normaliser_texte(nom_profil)
        == 'responsable des operations'
    )


def est_chef_magasinier(utilisateur):
    try:
        nom_profil = utilisateur.profil.nom_profil
    except Exception:
        return False

    texte = normaliser_texte(nom_profil)

    return 'chef' in texte and 'magasin' in texte


def est_directeur(utilisateur):
    try:
        nom_profil = utilisateur.profil.nom_profil
    except Exception:
        return False

    return normaliser_texte(nom_profil) == 'directeur'


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


class NavireViewSet(viewsets.ModelViewSet):
    queryset = Navire.objects.all()
    serializer_class = NavireSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated]

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

        nom_formate = re.sub(r'\s+', '-', nom)

        numeros_existants = Navire.objects.values_list(
            'numero_navire',
            flat=True
        )

        numeros_utilises = set()

        for numero_existant in numeros_existants:
            match = re.search(r'-(\d+)$', numero_existant)

            if match:
                numeros_utilises.add(int(match.group(1)))

        compteur = 1

        while compteur in numeros_utilises:
            compteur += 1

        numero = f"{nom_formate}-{compteur:05d}"

        serializer.save(numero_navire=numero)

    def destroy(self, request, *args, **kwargs):
        navire = self.get_object()

        with transaction.atomic():
            DetailDechargement.objects.filter(
                Q(fiche__navire=navire) |
                Q(produit_navire__navire=navire)
            ).delete()

            FicheProduit.objects.filter(
                Q(fiche__navire=navire) |
                Q(produit_navire__navire=navire)
            ).delete()

            FicheJournaliere.objects.filter(
                navire=navire
            ).delete()

            ProduitNavire.objects.filter(
                navire=navire
            ).delete()

            navire.delete()

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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Produit.objects.all()

        recherche = self.request.query_params.get('search', '').strip()

        if recherche:
            queryset = queryset.filter(
                Q(designation__icontains=recherche) |
                Q(type_produit__icontains=recherche)
            )

        return queryset

    def destroy(self, request, *args, **kwargs):
        produit = self.get_object()

        with transaction.atomic():
            DetailDechargement.objects.filter(
                produit_navire__produit=produit
            ).delete()

            FicheProduit.objects.filter(
                produit_navire__produit=produit
            ).delete()

            ProduitNavire.objects.filter(
                produit=produit
            ).delete()

            produit.delete()

        return Response(
            {
                'message': 'Produit supprimé avec succès.'
            },
            status=status.HTTP_204_NO_CONTENT
        )


class ProduitNavireViewSet(viewsets.ModelViewSet):
    queryset = ProduitNavire.objects.select_related(
        'navire',
        'produit'
    ).all()
    serializer_class = ProduitNavireSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        produit_navire = self.get_object()

        with transaction.atomic():
            DetailDechargement.objects.filter(
                produit_navire=produit_navire
            ).delete()

            FicheProduit.objects.filter(
                produit_navire=produit_navire
            ).delete()

            produit_navire.delete()

        return Response(
            {
                'message': 'Produit navire supprimé avec succès.'
            },
            status=status.HTTP_204_NO_CONTENT
        )


class FicheJournaliereViewSet(viewsets.ModelViewSet):
    queryset = FicheJournaliere.objects.select_related(
        'navire'
    ).prefetch_related(
        'produits__produit_navire__produit'
    ).all()

    serializer_class = FicheJournaliereSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        fiche = self.get_object()

        with transaction.atomic():
            DetailDechargement.objects.filter(
                fiche=fiche
            ).delete()

            FicheProduit.objects.filter(
                fiche=fiche
            ).delete()

            fiche.delete()

        return Response(
            {
                'message':
                    'Le navire a été supprimé du suivi de la journée.'
            },
            status=status.HTTP_204_NO_CONTENT
        )

    @action(
        detail=False,
        methods=['post'],
        url_path='soumettre'
    )
    def soumettre(self, request):
        date_fiche = request.data.get('date_fiche')

        if not date_fiche:
            return Response(
                {
                    'detail':
                        'La date de la fiche est obligatoire.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not est_chef_magasinier(request.user):
            return Response(
                {
                    'detail':
                        f'Seul le Chef Magasinier peut soumettre une fiche. '
                        f'(compte reçu : {request.user.identifiant} - '
                        f'{request.user.profil.nom_profil})'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        fiches = FicheJournaliere.objects.filter(
            date_fiche=date_fiche
        )

        if not fiches.exists():
            return Response(
                {
                    'detail':
                        'Aucun navire n’est présent dans le suivi de cette journée.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        fiches_non_soumises = fiches.filter(
            statut__in=[
                FicheJournaliere.STATUT_BROUILLON,
                FicheJournaliere.STATUT_REFUSEE,
            ]
        )

        if not fiches_non_soumises.exists():
            return Response(
                {
                    'detail':
                        'Le suivi de cette journée est déjà soumis ou validé.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            fiches_a_soumettre = list(
                fiches_non_soumises.select_related('navire')
            )

            for fiche in fiches_a_soumettre:

                fiche.soumise = True
                fiche.statut = FicheJournaliere.STATUT_SOUMISE
                fiche.motif_refus = None
                fiche.save(
                    update_fields=[
                        'soumise',
                        'statut',
                        'motif_refus',
                    ]
                )

            responsables = [
                utilisateur
                for utilisateur in Utilisateur.objects.select_related(
                    'profil'
                ).filter(
                    actif=True
                )
                if est_responsable_operations(utilisateur)
            ]

            fiche_reference = fiches_a_soumettre[0]

            nombre_navires = len(fiches_a_soumettre)

            for responsable in responsables:
                Notification.objects.create(
                    utilisateur=responsable,
                    fiche=fiche_reference,
                    type_notification=Notification.TYPE_FICHE_SOUMISE,
                    titre='Fiche journalière soumise',
                    message=(
                        f'La fiche journalière du '
                        f'{date_fiche} a été soumise '
                        f'et attend votre validation. '
                        f'{nombre_navires} navire(s) sont concernés.'
                    )
                )

        fiches = FicheJournaliere.objects.select_related(
            'navire'
        ).prefetch_related(
            'produits__produit_navire__produit'
        ).filter(
            date_fiche=date_fiche
        )

        serializer = self.get_serializer(
            fiches,
            many=True
        )

        return Response(
            {
                'message':
                    'Le suivi de la journée a été soumis avec succès.',
                'date_fiche':
                    date_fiche,
                'fiches':
                    serializer.data,
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=False,
        methods=['post'],
        url_path='soumettre-mois'
    )
    def soumettre_mois(self, request):
        if not est_responsable_operations(request.user):
            return Response(
                {
                    'detail':
                        'Seul le Responsable des Opérations peut soumettre un mois.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        mois = str(request.data.get('mois') or '')

        try:
            annee = int(mois[:4])
            numero_mois = int(mois[5:7])
        except ValueError:
            return Response(
                {
                    'detail':
                        'Le mois est invalide (format attendu : AAAA-MM).'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        fiches = FicheJournaliere.objects.filter(
            date_fiche__year=annee,
            date_fiche__month=numero_mois,
            statut__in=[
                FicheJournaliere.STATUT_SOUMISE,
                FicheJournaliere.STATUT_VALIDEE,
            ]
        ).order_by('-date_fiche')

        if not fiches.exists():
            return Response(
                {
                    'detail':
                        'Aucune fiche soumise ou validée pour ce mois.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        fiche_reference = fiches.first()

        directeurs = [
            utilisateur
            for utilisateur in Utilisateur.objects.select_related(
                'profil'
            ).filter(
                actif=True
            )
            if est_directeur(utilisateur)
        ]

        with transaction.atomic():
            for directeur in directeurs:
                Notification.objects.create(
                    utilisateur=directeur,
                    fiche=fiche_reference,
                    type_notification=Notification.TYPE_MOIS_SOUMIS,
                    titre='Fiches du mois soumises',
                    message=(
                        f'Le Responsable des Opérations a soumis '
                        f'les fiches du mois {mois}.'
                    )
                )

        return Response(
            {
                'message': 'Le mois a été soumis avec succès.'
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='valider'
    )
    def valider(self, request, pk=None):
        fiche = self.get_object()

        if not est_responsable_operations(request.user):
            return Response(
                {
                    'detail':
                        'Seul le Responsable des Opérations peut valider une fiche.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if fiche.statut != FicheJournaliere.STATUT_SOUMISE:
            return Response(
                {
                    'detail':
                        'Cette fiche n’est pas en attente de validation.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            fiches_du_jour = list(
                FicheJournaliere.objects.select_related(
                    'navire'
                ).filter(
                    date_fiche=fiche.date_fiche
                )
            )

            for fiche_du_jour in fiches_du_jour:
                fiche_du_jour.soumise = True
                fiche_du_jour.statut = FicheJournaliere.STATUT_VALIDEE
                fiche_du_jour.motif_refus = None
                fiche_du_jour.save(
                    update_fields=[
                        'soumise',
                        'statut',
                        'motif_refus',
                    ]
                )

                ValidationFiche.objects.create(
                    fiche=fiche_du_jour,
                    responsable=request.user,
                    action=ValidationFiche.ACTION_VALIDEE,
                    motif=None
                )

            chefs_magasiniers = [
                utilisateur
                for utilisateur in Utilisateur.objects.select_related(
                    'profil'
                ).filter(
                    actif=True
                )
                if est_chef_magasinier(utilisateur)
            ]

            for chef_magasinier in chefs_magasiniers:
                Notification.objects.create(
                    utilisateur=chef_magasinier,
                    fiche=fiche,
                    type_notification=Notification.TYPE_FICHE_VALIDEE,
                    titre='Fiche validée',
                    message=(
                        f'La fiche journalière du '
                        f'{fiche.date_fiche} a été validée.'
                    )
                )

        fiches_du_jour = FicheJournaliere.objects.select_related(
            'navire'
        ).prefetch_related(
            'produits__produit_navire__produit'
        ).filter(
            date_fiche=fiche.date_fiche
        )

        serializer = self.get_serializer(
            fiches_du_jour,
            many=True
        )

        return Response(
            {
                'message':
                    'La fiche a été validée avec succès.',
                'date_fiche':
                    fiche.date_fiche,
                'fiches':
                    serializer.data,
            },
            status=status.HTTP_200_OK
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='refuser'
    )
    def refuser(self, request, pk=None):
        fiche = self.get_object()

        if not est_responsable_operations(request.user):
            return Response(
                {
                    'detail':
                        'Seul le Responsable des Opérations peut refuser une fiche.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if fiche.statut != FicheJournaliere.STATUT_SOUMISE:
            return Response(
                {
                    'detail':
                        'Cette fiche n’est pas en attente de validation.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        motif_refus = request.data.get(
            'motif_refus',
            ''
        ).strip()

        if not motif_refus:
            return Response(
                {
                    'motif_refus':
                        'Le motif du refus est obligatoire.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():

            fiches_du_jour = list(
                FicheJournaliere.objects.select_related(
                    'navire'
                ).filter(
                    date_fiche=fiche.date_fiche
                )
            )

            for fiche_du_jour in fiches_du_jour:
                fiche_du_jour.soumise = False
                fiche_du_jour.statut = FicheJournaliere.STATUT_REFUSEE
                fiche_du_jour.motif_refus = motif_refus
                fiche_du_jour.save(
                    update_fields=[
                        'soumise',
                        'statut',
                        'motif_refus',
                    ]
                )

                ValidationFiche.objects.create(
                    fiche=fiche_du_jour,
                    responsable=request.user,
                    action=ValidationFiche.ACTION_REFUSEE,
                    motif=motif_refus
                )

            chefs_magasiniers = [
                utilisateur
                for utilisateur in Utilisateur.objects.select_related(
                    'profil'
                ).filter(
                    actif=True
                )
                if est_chef_magasinier(utilisateur)
            ]

            for chef_magasinier in chefs_magasiniers:
                Notification.objects.create(
                    utilisateur=chef_magasinier,
                    fiche=fiche,
                    type_notification=Notification.TYPE_FICHE_REFUSEE,
                    titre='Fiche refusée',
                    message=(
                        f'La fiche journalière du '
                        f'{fiche.date_fiche} a été refusée. '
                        f'Motif : {motif_refus}'
                    )
                )

        fiches_du_jour = FicheJournaliere.objects.select_related(
            'navire'
        ).prefetch_related(
            'produits__produit_navire__produit'
        ).filter(
            date_fiche=fiche.date_fiche
        )

        serializer = self.get_serializer(
            fiches_du_jour,
            many=True
        )

        return Response(
            {
                'message':
                    'La fiche a été refusée avec succès.',
                'date_fiche':
                    fiche.date_fiche,
                'fiches':
                    serializer.data,
            },
            status=status.HTTP_200_OK
        )


class DetailDechargementViewSet(viewsets.ModelViewSet):
    queryset = DetailDechargement.objects.select_related(
        'fiche',
        'fiche__navire',
        'produit_navire',
        'produit_navire__produit'
    ).all()

    serializer_class = DetailDechargementSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        detail = self.get_object()

        if detail.fiche:
            if detail.fiche.statut == FicheJournaliere.STATUT_VALIDEE:
                return Response(
                    {
                        'detail':
                            'Cette fiche journalière a été validée et ce détail ne peut plus être supprimé.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            if detail.fiche.statut == FicheJournaliere.STATUT_SOUMISE:
                return Response(
                    {
                        'detail':
                            'Cette fiche journalière est en attente de validation et ce détail ne peut pas être supprimé.'
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        return super().destroy(request, *args, **kwargs)


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.select_related(
        'utilisateur',
        'fiche',
        'fiche__navire'
    ).all()

    serializer_class = NotificationSerializer
    authentication_classes = [CustomTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.select_related(
            'utilisateur',
            'fiche',
            'fiche__navire'
        ).filter(
            utilisateur=self.request.user
        ).order_by(
            '-date_creation'
        )

    def create(self, request, *args, **kwargs):
        return Response(
            {
                'detail':
                    'Les notifications sont créées automatiquement.'
            },
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(
        detail=True,
        methods=['post'],
        url_path='lire'
    )
    def lire(self, request, pk=None):
        notification = self.get_object()

        notification.lue = True
        notification.save(
            update_fields=['lue']
        )

        return Response(
            {
                'message':
                    'Notification marquée comme lue.'
            },
            status=status.HTTP_200_OK
        )


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

    AuthToken.objects.filter(
        utilisateur=utilisateur
    ).delete()

    auth_token = AuthToken.objects.create(
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
                }
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


@api_view(['PATCH'])
@authentication_classes([CustomTokenAuthentication])
@permission_classes([IsAuthenticated])
def mon_profil(request):
    utilisateur = request.user

    email = str(request.data.get('email') or '').strip()

    if not email:
        return Response(
            {'email': 'L’email est obligatoire.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_email(email)
    except ValidationError:
        return Response(
            {'email': 'Veuillez saisir une adresse email valide.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if Utilisateur.objects.filter(
        email__iexact=email
    ).exclude(pk=utilisateur.pk).exists():
        return Response(
            {'email': 'Cet email est déjà utilisé.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Seul l'email peut être modifié par l'utilisateur connecté.
    utilisateur.email = email
    utilisateur.save(update_fields=['email'])

    return Response(
        {
            'message': 'Email modifié avec succès.',
            'utilisateur': {
                'id': utilisateur.id,
                'identifiant': utilisateur.identifiant,
                'nom': utilisateur.nom,
                'prenom': utilisateur.prenom,
                'email': utilisateur.email,
                'profil': {
                    'id': utilisateur.profil.id,
                    'nom_profil': utilisateur.profil.nom_profil,
                }
            }
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@authentication_classes([CustomTokenAuthentication])
@permission_classes([IsAuthenticated])
def changer_mot_de_passe(request):
    utilisateur = request.user

    ancien = request.data.get('ancien_mot_de_passe') or ''
    nouveau = request.data.get('nouveau_mot_de_passe') or ''
    confirmation = request.data.get('confirmation') or ''

    erreurs = {}

    if not utilisateur.check_password(ancien):
        erreurs['ancien_mot_de_passe'] = (
            'Le mot de passe actuel est incorrect.'
        )

    if len(nouveau) < 8:
        erreurs['nouveau_mot_de_passe'] = (
            'Le nouveau mot de passe doit contenir au moins 8 caractères.'
        )
    elif nouveau == ancien:
        erreurs['nouveau_mot_de_passe'] = (
            'Le nouveau mot de passe doit être différent de l’ancien.'
        )

    if nouveau != confirmation:
        erreurs['confirmation'] = (
            'La confirmation ne correspond pas au nouveau mot de passe.'
        )

    if erreurs:
        return Response(
            erreurs,
            status=status.HTTP_400_BAD_REQUEST
        )

    utilisateur.set_password(nouveau)
    utilisateur.save(update_fields=['mot_de_passe'])

    return Response(
        {
            'message': 'Mot de passe modifié avec succès.'
        },
        status=status.HTTP_200_OK
    )


DUREE_VALIDITE_CODE_MINUTES = 10
NOMBRE_MAX_TENTATIVES_CODE = 5
DELAI_RENVOI_CODE_SECONDES = 60


def trouver_utilisateur_par_identifiant_ou_email(valeur):
    valeur = str(valeur or '').strip()

    if not valeur:
        return None

    return Utilisateur.objects.select_related('profil').filter(
        Q(identifiant__iexact=valeur) | Q(email__iexact=valeur),
        actif=True
    ).first()


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def mot_de_passe_oublie(request):
    # Réponse identique que le compte existe ou non,
    # pour ne pas révéler quels comptes existent.
    reponse_generique = Response(
        {
            'message':
                'Si un compte correspond à cette saisie, un code à '
                '6 chiffres vient d’être envoyé à son adresse email.'
        },
        status=status.HTTP_200_OK
    )

    utilisateur = trouver_utilisateur_par_identifiant_ou_email(
        request.data.get('identifiant_ou_email')
    )

    if utilisateur is None:
        return reponse_generique

    dernier_code = CodeReinitialisation.objects.filter(
        utilisateur=utilisateur
    ).order_by('-date_creation').first()

    if dernier_code and (
        timezone.now() - dernier_code.date_creation
        < timedelta(seconds=DELAI_RENVOI_CODE_SECONDES)
    ):
        return reponse_generique

    code = f"{secrets.randbelow(1000000):06d}"

    CodeReinitialisation.objects.filter(
        utilisateur=utilisateur,
        utilise=False
    ).update(utilise=True)

    code_reinitialisation = CodeReinitialisation.objects.create(
        utilisateur=utilisateur,
        code=make_password(code)
    )

    try:
        send_mail(
            subject='PortTrack - Code de réinitialisation du mot de passe',
            message=(
                f'Bonjour {utilisateur.prenom} {utilisateur.nom},\n\n'
                f'Votre code de réinitialisation est : {code}\n\n'
                f'Ce code est valable {DUREE_VALIDITE_CODE_MINUTES} minutes.\n'
                f'Si vous n’êtes pas à l’origine de cette demande, '
                f'ignorez ce message.\n\n'
                f'PortTrack'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[utilisateur.email],
            fail_silently=False,
        )
    except Exception:
        logging.getLogger(__name__).exception(
            'Échec de l’envoi du code de réinitialisation.'
        )

        code_reinitialisation.delete()

        return Response(
            {
                'detail':
                    'Impossible d’envoyer l’email pour le moment. '
                    'Réessayez plus tard.'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return reponse_generique


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def reinitialiser_mot_de_passe(request):
    code = str(request.data.get('code') or '').strip()
    nouveau = request.data.get('nouveau_mot_de_passe') or ''
    confirmation = request.data.get('confirmation') or ''

    erreurs = {}

    if len(nouveau) < 8:
        erreurs['nouveau_mot_de_passe'] = (
            'Le nouveau mot de passe doit contenir au moins 8 caractères.'
        )

    if nouveau != confirmation:
        erreurs['confirmation'] = (
            'La confirmation ne correspond pas au nouveau mot de passe.'
        )

    if erreurs:
        return Response(
            erreurs,
            status=status.HTTP_400_BAD_REQUEST
        )

    erreur_code = Response(
        {'code': 'Code incorrect ou expiré. Demandez un nouveau code.'},
        status=status.HTTP_400_BAD_REQUEST
    )

    utilisateur = trouver_utilisateur_par_identifiant_ou_email(
        request.data.get('identifiant_ou_email')
    )

    if utilisateur is None:
        return erreur_code

    limite = timezone.now() - timedelta(
        minutes=DUREE_VALIDITE_CODE_MINUTES
    )

    code_reinitialisation = CodeReinitialisation.objects.filter(
        utilisateur=utilisateur,
        utilise=False,
        date_creation__gte=limite
    ).order_by('-date_creation').first()

    if code_reinitialisation is None:
        return erreur_code

    if code_reinitialisation.tentatives >= NOMBRE_MAX_TENTATIVES_CODE:
        code_reinitialisation.utilise = True
        code_reinitialisation.save(update_fields=['utilise'])

        return Response(
            {'code': 'Trop de tentatives. Demandez un nouveau code.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not check_password(code, code_reinitialisation.code):
        code_reinitialisation.tentatives += 1
        code_reinitialisation.save(update_fields=['tentatives'])

        return erreur_code

    with transaction.atomic():
        utilisateur.set_password(nouveau)
        utilisateur.save(update_fields=['mot_de_passe'])

        code_reinitialisation.utilise = True
        code_reinitialisation.save(update_fields=['utilise'])

        AuthToken.objects.filter(
            utilisateur=utilisateur
        ).delete()

    return Response(
        {
            'message': 'Mot de passe réinitialisé avec succès.'
        },
        status=status.HTTP_200_OK
    )