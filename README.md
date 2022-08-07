<div align="center" style="text-align: center;">

# BingWall

</div>

Ce projet est une preuve de concept, il a pour but d'utiliser une fonctionnalité du site [bing.com](https://bing.com/) qui chaque jour partout dans le monde fournis une image quotidiennnement pour chaque régions du monde. L'objectif est de récupérer ces images pour chacune des régions.

En plus de cette simple preuve de concept, ce programme permet d'avoir une banque d'image pour des tests ou des placeholders lors du développement d'application, de plus un petit "exploit" permet de récupérer les images sans le watermark de bing, en effet les images avec une résolution de `1920x1080` n'ont pas le watermark.

Le programme est lancer tous les jours à `9H06` via les github actions, je vous invite à consulter l'onglet `Actions` du repository pour les voir. Cependant vous pouvez aussi l'utiliser localement très simplement en suivant les étapes suivantes :
 1. Assurez-vous d'avoir les dépendances suivantes :
    | Dépendances    | version |
	|----------------|---------|
	| docker         | ^20.10  |
	| docker-compose | ^1.29   |
	| npm            | ^8.11   |
	| git            | _any_   |

 2. Télécharger le projet :
    ```bash
    git clone https://github.com/StrategFirst/BingWall.git
	cd BingWall
	```

 3. Installer le projet :
    ```bash
	cd src
	npm ci
	```

 4. Lancer le projet :
	```bash
	docker-compose up
	```
    _commande que vous pouvez relancer à chaque fois que vous souhaitez récupérer les images et donc que vous pouvez par exemple mettre dans une crontab_