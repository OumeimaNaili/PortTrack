from django.db import models
from django.contrib.auth.hashers import make_password, check_password
import secrets


class Profil(models.Model):
    nom_profil = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.nom_profil


class Utilisateur(models.Model):
    identifiant = models.CharField(max_length=100, unique=True)
    mot_de_passe = models.CharField(max_length=255)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    profil = models.ForeignKey(
        Profil,
        on_delete=models.PROTECT,
        related_name='utilisateurs'
    )
    actif = models.BooleanField(default=True)

    def set_password(self, raw_password):
        self.mot_de_passe = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.mot_de_passe)

    @property
    def is_authenticated(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Navire(models.Model):
    nom_navire = models.CharField(max_length=100)
    numero_navire = models.CharField(max_length=100, unique=True)
    numero_escale = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True
    )
    date_arrivee = models.DateField(
        null=True,
        blank=True
    )
    date_depart = models.DateField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.nom_navire


class Produit(models.Model):
    designation = models.CharField(max_length=150)
    type_produit = models.CharField(max_length=100)

    def __str__(self):
        return self.designation


class ProduitNavire(models.Model):
    navire = models.ForeignKey(
        Navire,
        on_delete=models.PROTECT,
        related_name='produits_navire'
    )
    produit = models.ForeignKey(
        Produit,
        on_delete=models.PROTECT,
        related_name='navires_produit'
    )
    quantite_initiale = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.navire} - {self.produit}"


class DetailDechargement(models.Model):

    SHIFT_MATIN = 'MATIN'
    SHIFT_SOIR = 'SOIR'
    SHIFT_NUIT = 'NUIT'
    SHIFT_NUIT2 = 'NUIT2'

    SHIFT_CHOICES = [
        (SHIFT_MATIN, 'Matin'),
        (SHIFT_SOIR, 'Soir'),
        (SHIFT_NUIT, 'Nuit'),
        (SHIFT_NUIT2, 'Nuit 2'),
    ]

    date_dechargement = models.DateField()

    produit_navire = models.ForeignKey(
        ProduitNavire,
        on_delete=models.PROTECT,
        related_name='details_dechargement'
    )

    shift = models.CharField(
        max_length=10,
        choices=SHIFT_CHOICES
    )

    quantite_dechargee = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    nombre_equipes = models.PositiveIntegerField()

    def __str__(self):
        return (
            f"{self.produit_navire.navire} - "
            f"{self.produit_navire.produit} - "
            f"{self.date_dechargement}"
        )


class AuthToken(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='auth_token'
    )

    token = models.CharField(
        max_length=64,
        unique=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_hex(32)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Token - {self.utilisateur.identifiant}"