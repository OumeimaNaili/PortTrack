from django.db import transaction
from django.db.models import Sum

from rest_framework import serializers

from .models import (
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


class ProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profil
        fields = [
            'id',
            'nom_profil',
            'description',
        ]


class UtilisateurSerializer(serializers.ModelSerializer):
    profil_nom = serializers.CharField(
        source='profil.nom_profil',
        read_only=True
    )

    class Meta:
        model = Utilisateur
        fields = [
            'id',
            'identifiant',
            'mot_de_passe',
            'nom',
            'prenom',
            'email',
            'profil',
            'profil_nom',
            'actif',
        ]
        extra_kwargs = {
            'mot_de_passe': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        password = validated_data.pop('mot_de_passe')

        utilisateur = Utilisateur(**validated_data)
        utilisateur.set_password(password)
        utilisateur.save()

        return utilisateur

    def update(self, instance, validated_data):
        password = validated_data.pop('mot_de_passe', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance


class NavireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Navire
        fields = [
            'id',
            'nom_navire',
            'numero_navire',
            'numero_escale',
            'date_arrivee',
            'date_depart',
        ]
        read_only_fields = [
            'numero_navire',
        ]


class ProduitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produit
        fields = [
            'id',
            'designation',
            'type_produit',
        ]


class ProduitNavireSerializer(serializers.ModelSerializer):
    navire_nom = serializers.CharField(
        source='navire.nom_navire',
        read_only=True
    )

    produit_designation = serializers.CharField(
        source='produit.designation',
        read_only=True
    )

    class Meta:
        model = ProduitNavire
        fields = [
            'id',
            'navire',
            'navire_nom',
            'produit',
            'produit_designation',
            'quantite_initiale',
            'tonnage_initial',
        ]


class DetailDechargementSerializer(serializers.ModelSerializer):
    navire_nom = serializers.CharField(
        source='fiche.navire.nom_navire',
        read_only=True
    )

    produit_designation = serializers.CharField(
        source='produit_navire.produit.designation',
        read_only=True
    )

    date_fiche = serializers.DateField(
        source='fiche.date_fiche',
        read_only=True
    )

    class Meta:
        model = DetailDechargement
        fields = [
            'id',
            'fiche',
            'date_fiche',
            'navire_nom',
            'produit_navire',
            'produit_designation',
            'shift',
            'quantite_dechargee',
            'tonnage_decharge',
            'nombre_equipes',
        ]

    def validate(self, attrs):
        fiche = attrs.get(
            'fiche',
            getattr(
                self.instance,
                'fiche',
                None
            )
        )

        if fiche and fiche.statut == FicheJournaliere.STATUT_VALIDEE:
            raise serializers.ValidationError(
                {
                    'detail':
                        'Cette fiche journalière a été validée et ne peut plus être modifiée.'
                }
            )

        if fiche and fiche.statut == FicheJournaliere.STATUT_SOUMISE:
            raise serializers.ValidationError(
                {
                    'detail':
                        'Cette fiche journalière est en attente de validation et ne peut pas être modifiée.'
                }
            )

        produit_navire = attrs.get(
            'produit_navire',
            getattr(
                self.instance,
                'produit_navire',
                None
            )
        )

        quantite_dechargee = attrs.get(
            'quantite_dechargee',
            getattr(
                self.instance,
                'quantite_dechargee',
                0
            )
        )

        tonnage_decharge = attrs.get(
            'tonnage_decharge',
            getattr(
                self.instance,
                'tonnage_decharge',
                0
            )
        )

        if fiche and produit_navire:

            if fiche.navire_id != produit_navire.navire_id:
                raise serializers.ValidationError(
                    {
                        'produit_navire':
                            'Le produit doit appartenir au navire de la fiche.'
                    }
                )

            try:
                fiche_produit = FicheProduit.objects.get(
                    fiche=fiche,
                    produit_navire=produit_navire
                )
            except FicheProduit.DoesNotExist:
                raise serializers.ValidationError(
                    {
                        'produit_navire':
                            'Ce produit ne fait pas partie de la fiche journalière.'
                    }
                )

            details_existants = DetailDechargement.objects.filter(
                fiche=fiche,
                produit_navire=produit_navire
            )

            if self.instance:
                details_existants = details_existants.exclude(
                    id=self.instance.id
                )

            total_quantite = details_existants.aggregate(
                total=Sum('quantite_dechargee')
            )['total'] or 0

            total_tonnage = details_existants.aggregate(
                total=Sum('tonnage_decharge')
            )['total'] or 0

            nouveau_total_quantite = (
                total_quantite +
                quantite_dechargee
            )

            nouveau_total_tonnage = (
                total_tonnage +
                tonnage_decharge
            )

            erreurs = {}

            if nouveau_total_quantite > fiche_produit.quantite_initiale:
                erreurs['quantite_dechargee'] = (
                    'La quantité déchargée cumulée ne peut pas '
                    'dépasser la quantité manifeste.'
                )

            if nouveau_total_tonnage > fiche_produit.tonnage_initial:
                erreurs['tonnage_decharge'] = (
                    'Le tonnage déchargé cumulé ne peut pas '
                    'dépasser le tonnage manifeste.'
                )

            if erreurs:
                raise serializers.ValidationError(erreurs)

        return attrs


class FicheProduitSerializer(serializers.ModelSerializer):

    produit = serializers.PrimaryKeyRelatedField(
        queryset=Produit.objects.all(),
        write_only=True,
        required=False
    )

    quantite_initiale = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        write_only=True,
        required=True
    )

    tonnage_initial = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        write_only=True,
        required=True
    )

    produit_id = serializers.IntegerField(
        source='produit_navire.produit.id',
        read_only=True
    )

    designation = serializers.CharField(
        source='produit_navire.produit.designation',
        read_only=True
    )

    quantite_manifeste = serializers.DecimalField(
        source='quantite_initiale',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    tonnage_manifeste = serializers.DecimalField(
        source='tonnage_initial',
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    total_decharge_quantite = serializers.SerializerMethodField()
    total_decharge_tonnage = serializers.SerializerMethodField()
    reste_a_bord_quantite = serializers.SerializerMethodField()
    reste_a_bord_tonnage = serializers.SerializerMethodField()

    class Meta:
        model = FicheProduit
        fields = [
            'id',
            'produit',
            'produit_navire',
            'produit_id',
            'designation',
            'quantite_initiale',
            'tonnage_initial',
            'quantite_manifeste',
            'tonnage_manifeste',
            'total_decharge_quantite',
            'total_decharge_tonnage',
            'reste_a_bord_quantite',
            'reste_a_bord_tonnage',
        ]

        read_only_fields = [
            'produit_navire',
            'produit_id',
            'designation',
            'quantite_manifeste',
            'tonnage_manifeste',
            'total_decharge_quantite',
            'total_decharge_tonnage',
            'reste_a_bord_quantite',
            'reste_a_bord_tonnage',
        ]

    def _get_total_quantite(self, obj):
        total = DetailDechargement.objects.filter(
            fiche__navire=obj.fiche.navire,
            fiche__numero_escale=obj.fiche.numero_escale,
            produit_navire=obj.produit_navire
        ).aggregate(
            total=Sum('quantite_dechargee')
        )['total']

        return total or 0

    def _get_total_tonnage(self, obj):
        total = DetailDechargement.objects.filter(
            fiche__navire=obj.fiche.navire,
            fiche__numero_escale=obj.fiche.numero_escale,
            produit_navire=obj.produit_navire
        ).aggregate(
            total=Sum('tonnage_decharge')
        )['total']

        return total or 0

    def get_total_decharge_quantite(self, obj):
        return self._get_total_quantite(obj)

    def get_total_decharge_tonnage(self, obj):
        return self._get_total_tonnage(obj)

    def get_reste_a_bord_quantite(self, obj):
        return max(
            0,
            obj.quantite_initiale -
            self._get_total_quantite(obj)
        )

    def get_reste_a_bord_tonnage(self, obj):
        return max(
            0,
            obj.tonnage_initial -
            self._get_total_tonnage(obj)
        )


class FicheJournaliereSerializer(serializers.ModelSerializer):
    navire_nom = serializers.CharField(
        source='navire.nom_navire',
        read_only=True
    )

    produits = FicheProduitSerializer(
        many=True
    )

    class Meta:
        model = FicheJournaliere
        fields = [
            'id',
            'date_fiche',
            'navire',
            'navire_nom',
            'numero_escale',
            'soumise',
            'statut',
            'motif_refus',
            'produits',
        ]

        read_only_fields = [
            'soumise',
            'statut',
            'motif_refus',
        ]

    def validate(self, attrs):
        if self.instance:
            if self.instance.statut == FicheJournaliere.STATUT_VALIDEE:
                raise serializers.ValidationError(
                    {
                        'detail':
                            'Cette fiche journalière a été validée et ne peut plus être modifiée.'
                    }
                )

            if self.instance.statut == FicheJournaliere.STATUT_SOUMISE:
                raise serializers.ValidationError(
                    {
                        'detail':
                            'Cette fiche journalière est en attente de validation et ne peut pas être modifiée.'
                    }
                )

        navire = attrs.get(
            'navire',
            getattr(
                self.instance,
                'navire',
                None
            )
        )

        produits = attrs.get('produits', [])

        produit_ids = set()

        for produit_data in produits:
            produit = produit_data.get('produit')

            if produit is None:
                produit_navire = produit_data.get(
                    'produit_navire'
                )

                if produit_navire is None:
                    raise serializers.ValidationError(
                        {
                            'produits':
                                'Chaque produit doit être sélectionné.'
                        }
                    )

                produit = produit_navire.produit

            if produit.id in produit_ids:
                raise serializers.ValidationError(
                    {
                        'produits':
                            'Un même produit ne peut pas être ajouté plusieurs fois à la fiche.'
                    }
                )

            produit_ids.add(produit.id)

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        produits_data = validated_data.pop(
            'produits',
            []
        )

        navire = validated_data['navire']

        numero_escale_saisi = validated_data.get('numero_escale')

        validated_data['numero_escale'] = (
            numero_escale_saisi
            or navire.numero_escale
        )

        fiche = FicheJournaliere.objects.create(
            **validated_data
        )

        for produit_data in produits_data:
            produit = produit_data.pop(
                'produit',
                None
            )

            if produit is not None:
                produit_navire, created = (
                    ProduitNavire.objects.get_or_create(
                        navire=fiche.navire,
                        produit=produit,
                        defaults={
                            'quantite_initiale':
                                produit_data['quantite_initiale'],
                            'tonnage_initial':
                                produit_data['tonnage_initial'],
                        }
                    )
                )
            else:
                produit_navire = produit_data.pop(
                    'produit_navire'
                )

            FicheProduit.objects.create(
                fiche=fiche,
                produit_navire=produit_navire,
                **produit_data
            )

        return fiche

    @transaction.atomic
    def update(self, instance, validated_data):
        if instance.statut == FicheJournaliere.STATUT_VALIDEE:
            raise serializers.ValidationError(
                {
                    'detail':
                        'Cette fiche journalière a été validée et ne peut plus être modifiée.'
                }
            )

        if instance.statut == FicheJournaliere.STATUT_SOUMISE:
            raise serializers.ValidationError(
                {
                    'detail':
                        'Cette fiche journalière est en attente de validation et ne peut pas être modifiée.'
                }
            )

        produits_data = validated_data.pop(
            'produits',
            None
        )

        instance.date_fiche = validated_data.get(
            'date_fiche',
            instance.date_fiche
        )

        instance.navire = validated_data.get(
            'navire',
            instance.navire
        )

        numero_escale_saisi = validated_data.get('numero_escale')

        if numero_escale_saisi:
            instance.numero_escale = numero_escale_saisi
        elif not instance.numero_escale:
            instance.numero_escale = (
                instance.navire.numero_escale
            )

        instance.motif_refus = None
        instance.save()

        if produits_data is not None:
            instance.produits.all().delete()

            for produit_data in produits_data:
                produit = produit_data.pop(
                    'produit',
                    None
                )

                if produit is not None:
                    produit_navire, created = (
                        ProduitNavire.objects.get_or_create(
                            navire=instance.navire,
                            produit=produit,
                            defaults={
                                'quantite_initiale':
                                    produit_data['quantite_initiale'],
                                'tonnage_initial':
                                    produit_data['tonnage_initial'],
                            }
                        )
                    )
                else:
                    produit_navire = produit_data.pop(
                        'produit_navire'
                    )

                FicheProduit.objects.create(
                    fiche=instance,
                    produit_navire=produit_navire,
                    **produit_data
                )

        return instance


class ValidationFicheSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValidationFiche
        fields = [
            'id',
            'fiche',
            'responsable',
            'action',
            'motif',
            'date_action',
        ]
        read_only_fields = [
            'id',
            'fiche',
            'responsable',
            'date_action',
        ]


class NotificationSerializer(serializers.ModelSerializer):
    fiche_navire = serializers.CharField(
        source='fiche.navire.nom_navire',
        read_only=True
    )

    fiche_date = serializers.DateField(
        source='fiche.date_fiche',
        read_only=True
    )

    class Meta:
        model = Notification
        fields = [
            'id',
            'fiche',
            'fiche_navire',
            'fiche_date',
            'type_notification',
            'titre',
            'message',
            'lue',
            'date_creation',
        ]
        read_only_fields = [
            'id',
            'fiche',
            'fiche_navire',
            'fiche_date',
            'type_notification',
            'titre',
            'message',
            'date_creation',
        ]