from rest_framework import serializers

from .models import (
    Profil,
    Utilisateur,
    Navire,
    Produit,
    ProduitNavire,
    DetailDechargement,
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
    class Meta:
        model = ProduitNavire
        fields = [
            'id',
            'navire',
            'produit',
            'quantite_initiale',
        ]


class DetailDechargementSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetailDechargement
        fields = [
            'id',
            'date_dechargement',
            'produit_navire',
            'shift',
            'quantite_dechargee',
            'nombre_equipes',
        ]