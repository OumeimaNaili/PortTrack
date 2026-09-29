from django.db import transaction
from django.db.models import Q
import re
import unicodedata

from rest_framework import viewsets, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
    action,
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
    FicheJournaliere,
    FicheProduit,
    DetailDechargement,
    ValidationFiche,
    Notification,
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