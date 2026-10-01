import os

from django.core.management.base import BaseCommand

from core.models import Profil, Utilisateur


class Command(BaseCommand):
    help = 'Crée les profils et le compte Administrateur initial.'

    def handle(self, *args, **options):
        identifiant = os.environ.get('ADMIN_IDENTIFIANT')
        mot_de_passe = os.environ.get('ADMIN_MOT_DE_PASSE')
        nom = os.environ.get('ADMIN_NOM', 'Administrateur')
        prenom = os.environ.get('ADMIN_PRENOM', 'Admin')
        email = os.environ.get(
            'ADMIN_EMAIL',
            'admin@porttrack.local'
        )

        if not identifiant or not mot_de_passe:
            self.stdout.write(
                self.style.ERROR(
                    'ADMIN_IDENTIFIANT et ADMIN_MOT_DE_PASSE '
                    'doivent être définis.'
                )
            )
            return

        profils = [
            {
                'nom_profil': 'Administrateur',
                'description': 'Administrateur de PortTrack'
            },
            {
                'nom_profil': 'Chef Magasinier',
                'description': 'Chef Magasinier de PortTrack'
            },
            {
                'nom_profil': 'Responsable des Opérations',
                'description': 'Responsable des Opérations de PortTrack'
            },
            {
                'nom_profil': 'Directeur',
                'description': 'Directeur de PortTrack'
            },
            {
                'nom_profil': 'Responsable des Statistiques',
                'description': 'Responsable des Statistiques de PortTrack'
            },
        ]

        for profil_data in profils:
            profil, profil_cree = Profil.objects.get_or_create(
                nom_profil=profil_data['nom_profil'],
                defaults={
                    'description': profil_data['description']
                }
            )

            if profil_cree:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Profil '{profil.nom_profil}' créé."
                    )
                )

        profil = Profil.objects.get(
            nom_profil='Administrateur'
        )

        utilisateur = Utilisateur.objects.filter(
            identifiant=identifiant
        ).first()

        if utilisateur:
            self.stdout.write(
                self.style.WARNING(
                    f"L'utilisateur '{identifiant}' existe déjà."
                )
            )
            return

        utilisateur = Utilisateur(
            identifiant=identifiant,
            nom=nom,
            prenom=prenom,
            email=email,
            profil=profil,
            actif=True
        )

        utilisateur.set_password(mot_de_passe)
        utilisateur.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Administrateur '{identifiant}' créé avec succès."
            )
        )