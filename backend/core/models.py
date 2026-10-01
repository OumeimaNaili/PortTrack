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
    tonnage_initial = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )
    actif = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.navire} - {self.produit}"


class FicheJournaliere(models.Model):

    STATUT_BROUILLON = 'BROUILLON'
    STATUT_SOUMISE = 'SOUMISE'
    STATUT_VALIDEE = 'VALIDEE'
    STATUT_REFUSEE = 'REFUSEE'

    STATUT_CHOICES = [
        (STATUT_BROUILLON, 'Brouillon'),
        (STATUT_SOUMISE, 'Soumise'),
        (STATUT_VALIDEE, 'Validée'),
        (STATUT_REFUSEE, 'Refusée'),
    ]

    date_fiche = models.DateField()

    navire = models.ForeignKey(
        Navire,
        on_delete=models.PROTECT,
        related_name='fiches_journalieres'
    )

    # Le numéro d'escale est mémorisé dans la fiche.
    # Ainsi, si le numéro d'escale du navire change,
    # les anciennes fiches gardent leur ancien numéro.
    numero_escale = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    soumise = models.BooleanField(default=False)

    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default=STATUT_BROUILLON
    )

    motif_refus = models.TextField(
        null=True,
        blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['date_fiche', 'navire'],
                name='unique_fiche_navire_date'
            )
        ]

    def __str__(self):
        return (
            f"{self.navire} - "
            f"{self.numero_escale} - "
            f"{self.date_fiche}"
        )


class FicheProduit(models.Model):
    fiche = models.ForeignKey(
        FicheJournaliere,
        on_delete=models.PROTECT,
        related_name='produits'
    )

    produit_navire = models.ForeignKey(
        ProduitNavire,
        on_delete=models.CASCADE,
        related_name='fiches'
    )

    quantite_initiale = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    tonnage_initial = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['fiche', 'produit_navire'],
                name='unique_fiche_produit'
            )
        ]

    def __str__(self):
        return (
            f"{self.fiche.navire} - "
            f"{self.produit_navire.produit} - "
            f"{self.fiche.date_fiche}"
        )


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

    date_dechargement = models.DateField(
        null=True,
        blank=True
    )

    fiche = models.ForeignKey(
        FicheJournaliere,
        on_delete=models.PROTECT,
        related_name='details_dechargement',
        null=True,
        blank=True
    )

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

    tonnage_decharge = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    nombre_equipes = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['fiche', 'produit_navire', 'shift'],
                name='unique_detail_fiche_produit_shift'
            )
        ]

    def __str__(self):
        if self.fiche:
            return (
                f"{self.fiche.navire} - "
                f"{self.produit_navire.produit} - "
                f"{self.fiche.date_fiche} - "
                f"{self.shift}"
            )

        return (
            f"{self.produit_navire.navire} - "
            f"{self.produit_navire.produit} - "
            f"{self.date_dechargement} - "
            f"{self.shift}"
        )


class ValidationFiche(models.Model):

    ACTION_VALIDEE = 'VALIDEE'
    ACTION_REFUSEE = 'REFUSEE'

    ACTION_CHOICES = [
        (ACTION_VALIDEE, 'Validée'),
        (ACTION_REFUSEE, 'Refusée'),
    ]

    fiche = models.ForeignKey(
        FicheJournaliere,
        on_delete=models.CASCADE,
        related_name='historique_validations'
    )

    responsable = models.ForeignKey(
        Utilisateur,
        on_delete=models.PROTECT,
        related_name='validations_fiches'
    )

    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES
    )

    motif = models.TextField(
        null=True,
        blank=True
    )

    date_action = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.fiche} - "
            f"{self.action} - "
            f"{self.responsable}"
        )


class Notification(models.Model):

    TYPE_FICHE_SOUMISE = 'FICHE_SOUMISE'
    TYPE_FICHE_VALIDEE = 'FICHE_VALIDEE'
    TYPE_FICHE_REFUSEE = 'FICHE_REFUSEE'
    TYPE_MOIS_SOUMIS = 'MOIS_SOUMIS'

    TYPE_CHOICES = [
        (
            TYPE_FICHE_SOUMISE,
            'Fiche soumise'
        ),
        (
            TYPE_FICHE_VALIDEE,
            'Fiche validée'
        ),
        (
            TYPE_FICHE_REFUSEE,
            'Fiche refusée'
        ),
        (
            TYPE_MOIS_SOUMIS,
            'Mois soumis'
        ),
    ]

    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    fiche = models.ForeignKey(
        FicheJournaliere,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    type_notification = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES
    )

    titre = models.CharField(
        max_length=255
    )

    message = models.TextField()

    lue = models.BooleanField(
        default=False
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"{self.titre} - "
            f"{self.utilisateur} - "
            f"{self.fiche}"
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


class CodeReinitialisation(models.Model):
    utilisateur = models.ForeignKey(
        Utilisateur,
        on_delete=models.CASCADE,
        related_name='codes_reinitialisation'
    )

    # Le code à 6 chiffres est stocké haché, jamais en clair.
    code = models.CharField(
        max_length=255
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    tentatives = models.PositiveIntegerField(
        default=0
    )

    utilise = models.BooleanField(
        default=False
    )

    def __str__(self):
        return (
            f"Code - {self.utilisateur.identifiant} - "
            f"{self.date_creation}"
        )