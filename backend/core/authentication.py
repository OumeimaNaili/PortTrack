from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import AuthToken


class CustomTokenAuthentication(BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != 'Token':
            raise AuthenticationFailed(
                'Format du token invalide.'
            )

        token = parts[1]

        try:
            auth_token = AuthToken.objects.select_related(
                'utilisateur__profil'
            ).get(token=token)
        except AuthToken.DoesNotExist:
            raise AuthenticationFailed(
                'Token invalide.'
            )

        request.utilisateur = auth_token.utilisateur

        return (auth_token.utilisateur, auth_token)