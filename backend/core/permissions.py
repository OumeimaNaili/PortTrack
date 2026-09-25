from rest_framework.permissions import BasePermission


class IsAdministrateur(BasePermission):
    """
    Autorise uniquement les utilisateurs ayant le profil Administrateur.
    """

    def has_permission(self, request, view):
        utilisateur = getattr(request, 'utilisateur', None)

        return (
            utilisateur is not None
            and utilisateur.profil.nom_profil == 'Administrateur'
        )


class IsChefMagasinier(BasePermission):
    """
    Autorise uniquement les utilisateurs ayant le profil Chef Magasinier.
    """

    def has_permission(self, request, view):
        utilisateur = getattr(request, 'utilisateur', None)

        return (
            utilisateur is not None
            and utilisateur.profil.nom_profil == 'Chef Magasinier'
        )


class IsResponsableOperations(BasePermission):
    """
    Autorise uniquement les utilisateurs ayant le profil Responsable des Opérations.
    """

    def has_permission(self, request, view):
        utilisateur = getattr(request, 'utilisateur', None)

        return (
            utilisateur is not None
            and utilisateur.profil.nom_profil == 'Responsable des Opérations'
        )


class IsDirecteur(BasePermission):
    """
    Autorise uniquement les utilisateurs ayant le profil Directeur.
    """

    def has_permission(self, request, view):
        utilisateur = getattr(request, 'utilisateur', None)

        return (
            utilisateur is not None
            and utilisateur.profil.nom_profil == 'Directeur'
        )


class IsResponsableStatistiques(BasePermission):
    """
    Autorise uniquement les utilisateurs ayant le profil Responsable des Statistiques.
    """

    def has_permission(self, request, view):
        utilisateur = getattr(request, 'utilisateur', None)

        return (
            utilisateur is not None
            and utilisateur.profil.nom_profil == 'Responsable des Statistiques'
        )