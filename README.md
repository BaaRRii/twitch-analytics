# Cómo ejecutar la aplicación

1. Clonar el repositorio:

```bash
git clone https://github.com/BaaRRii/twitch-analytics
cd twitch-analytics
```

2. Crear un archivo .env siguiendo el ejemplo de .env.example:

```bash
cp .env.example .env
```

3. Instalar dependencias y ejecutar la aplicación:

```bash
npm i 
node server.js
```

## Decisiones técnicas

### Lenguaje y framework

He utilizado JavaScript y node.js con express.js. Es común para desarrollo de APIs y tengo experiencia previa. No diría que es el lenguaje con el que tengo más soltura pero sí que creo que es el más cómodo. Estoy seguro de que hay mejores opciones en cuanto rendimiento, uso de memoria y demás pero JS es claro y permite desarrollar funcionalidades rápidamente.

### Token OAuth

Twitch permite varios flujos para obtener credenciales. Como los endpoints de Twitch que vamos a utilizar no necesitan acceder a recursos asociados a cuentas de twitch he decidido utilizar el [Client credentials grant flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#client-credentials-grant-flow). La aplicación se autentica a sí misma. Peticiones server-server. Es el más sencillo (sin redirecciones, sin sesiones)

[twitchAuth.js](twitch/twitchAuth.js) se encarga de gestionar el token. Lo cachea después de pedirlo y no lo vuelve a pedir a no se que haya expirado o haya sido invalidado. Lo guardo en memoria. Es lo más sencillo de implementar, es rápido... Al reiniciar el servidor se pierde el token. Al utilizar un token de aplicación, que no depende de un usuario, asumo que las claves no se van a rotar y validarlo en cada petición añadiría latencia extra por lo que solo lo renuevo si en una de las peticiones obtengo un 401 o haya expirado.

### Healthcheck

Aunque no se pide, hay un healtcheck en / que devuelve un "healthy" esto de por sí no tiene mucho sentido si no hay mas servicios. La idea es que si en un futuro la API crece o añadimos una base de datos o cosas por el estilo, se pueda hacer aqui un check y devolver si todos los componentes funcionan bien o no.

### Llamadas a la API de twitch

Para gestionar las llamadas a la API de twitch he utilizado axios. Se podría haber utilizado fetch, que es nativa pero axios tiene sus beneficios como parsear json automáticamente o lanzar errores si la petición HTTP da error.

[twitchApi.js](twitch/twitchApi.js) se encarga de gestionar estas llamadas. Obtiene el token de [twitchAuth.js](twitch/twitchAuth.js) y lo utiliza para acceder a la api de twitch. Devolvemos la respuesta de twitch tal cual y en caso de error lo propagamos también (gestionaremos los errores y el formato de los datos en nuestra ruta, salvo si obtenemos un 401 que entonces renovaremos el token y haremos la petición otra vez).

### Ruta analytics

Tal y como se especifica vamos a crear la ruta /analytics con dos subrutas /user y /streams. [analytics.js](routes/analytics.js) se encarga de gestionar la ruta. Se utiliza un router de express que después importaremos desde el server principal.

La ruta /user acepta un parámetro id. Lo primero que hacemos es hacer un check del parámetro. Si no está establecido devolvemos un HTTP 400 con el error correspondiente. Una vez recibida la respuesta de la api comprobamos si nos ha devuelto datos, si no hay ningún usuario devolvemos un HTTP 404. Si la respuesta de la API de twitch fuese un HTTP 500, devolveríamos el mismo código con su mensaje. Los datos devueltos por la API de twitch están en el mismo formato que se espera por lo que devolvemos exactamente lo mismo.

Según la documentación de twitch, las respuestas esperadas son 200, 400 o 401. Sin embargo, he añadido

```js
return res.status(status).json({
    error: data?.error || "Twitch API error."
});
```

por si ocurriese un error inesperado.

La ruta /streams de la API no espera ningún parámetro (aunque la de twitch sí que admite algunos opcionales). Seguimos el mismo esquema de respuesta que en la ruta /user con una diferencia. En este caso no se espera devolver un 404 (o no se especifica al menos) por lo que nos aseguramos devolver al menos una lista vacía. La api de twitch nos da más datos que los que se espera devolver por lo que filtramos la lista de streams y cogemos solo el title y el user_name.

La gestión de errores se podría unificar pero al tener solo dos rutas no lo he visto necesario.

### Logging

Se utiliza un middleware sencillo para loggear las peticiones y el tiempo de respuesta. Puede ser útil para identificar problemas en el futuro como cuuellos de botella, intentos de enumeración, intentos de descubrir ficheros (.env, backups, etc)

### .gitignore y .env

El archivo .gitignore incluye node_modules/ ya que las dependencias no necesitan subirse al repositorio (se pueden instalar con npm i). También se incluye el archivo .env para evitar exponer credenciales. En su lugar, se proporciona un archivo .env.example como plantilla.
