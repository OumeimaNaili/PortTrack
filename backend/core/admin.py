from django.contrib import admin

from .models import (
    Profil,
    Utilisateur,
    Navire,
    Produit,
    ProduitNavire,
    DetailDechargement,
)


admin.site.register(Profil)
admin.site.register(Utilisateur)
admin.site.register(Navire)
admin.site.register(Produit)
admin.site.register(ProduitNavire)
admin.site.register(DetailDechargement)