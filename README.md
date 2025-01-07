# ApiChistes
Proyecto de Tópicos Especiales de Programación

Integrantes:
- Christopher Acosta
- Hugo Cuenca
- Israel Mejias

## Prerequisitos para correr
- Docker
- Docker Compose
- Archivo `.env` (corre `cp .env.sample .env` y modifique según su conveniencia)
- Conexión a internet

## Como correr
Ejecutar el siguiente comando para correr:

```bash
docker compose up
```

Después de que se genera la imagen (su duración depende de la calidad del internet) el contenedor se empezará a ejecutar unos pocos segundos después. Ver la sección de [Tests](#tests) si se quieren correr las pruebas.

### Detener ejecución
Para parar la ejecución presionar `Ctrl`+`C` y correr los siguientes dos comandos (no importa si el último arroja error):

```bash
docker compose down --rmi all
docker image rm topicos-web
```

## Tests
Siendo un proyecto TDD cada requisito tiene sus pruebas asociadas. Para correrlas abrir un nuevo terminal mientras se corre el proyecto. De aquí en adelante las instrucciones difieren dependiendo del intérprete:

### Bash, Zsh, o cualquier shell compatible con POSIX SH (recomendado)
Ejecutar el siguiente comando para correr los tests:

```bash
docker exec -it $(docker ps -aqf "name=^node_chistes$") sh -c 'npm run test'
```

### Powershell, cmd.exe, o shell no compatible con POSIX SH
Se necesita el ID del contenedor `node_chistes`. Una manera de obtenerlo es el resultado al ejecutar:

```powershell
docker ps -aqf "name=^node_chistes$"
```

Con el ID del contenedor en mano, ejecutar el siguiente comando (sustituyendo `<ID-CONTENEDOR>` con el ID obtenido):

```powershell
docker exec -it "<ID-CONTENEDOR>" sh -c "npm run test"
```

### Todos
Para correr los tests con código nuevo, seguir los pasos de [Detener ejecución](#detener-ejecución) para remover la imagen con el código viejo. Luego volver a seguir los pasos en [Como correr](#como-correr) para comenzar la ejecución del código nuevo, y [Tests](#tests) para correr las pruebas. Nota que cada ejecución le asigna un ID distinto a los contenedores, por lo cual no es válido usar el ID del contenedor `node_chistes` de la ejecución anterior para correr las pruebas de esta ejecución.