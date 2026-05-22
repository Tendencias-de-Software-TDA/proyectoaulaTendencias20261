# GRUPO 4: Gestion de ventas y facturacion


# Autenticación de Usuarios

Para hacer la autenticación se creó dos apps, una que contiene la base de datos de lo usuarios <br>
y otra que contiene la logica de autenticacion. Ambas apps tienen un endpoint para consumirlas, pero no <br>
todos los usuarios registrados tienen permisos para dicho consumo, por ejemplo, los usuarios registrados <br>
con rol contador, no pueden visualizar a los demas usuarios registrados, pero un usuario con rol administrador <br>
si puede visualzarlos.

El app de autenticacion no contiene un modelo, solo tiene una vista y un serialzer que indican al endpoint los <br>
campos requiriodos para hacer POST a la ruta /v1/login/. Para hacer solicitudes a las demás rutas se debe mandar un <br>
la solicitud HTTP con Basic Auth indicando el username y la password.

# CRUD clientes

Esta app registrada en el sistema contiene los campos: <br>

- nombre
- identificacion
- regimen_tributario
- direccion 
- email 
- telefono

Para hacer las operaciones CRUD existe el endpoint /v1/cliente y /v1/cliente/{id}, el cual recibe los 4 metodos HTTP <br>
GET para leer los datos, POST para crear un nuevo registro, DELETE para borrar un registro especificando el id, PUT o PATCH <br>
para actualizar un registro.

# CRUD Productos

Esta app registrada en el sistema contiene los campos: <br>

- nombre_producto
- codigo
- descripcion
- unidad_medida 
- precio_unitario
- porcentaje_iva
- estado

Para hacer las operaciones CRUD existe el endpoint /v1/producto y /v1/producto/{id}, el cual recibe los 4 metodos HTTP <br>
GET para leer los datos, POST para crear un nuevo registro, DELETE para borrar un registro especificando el id, PUT o PATCH <br>
para actualizar un registro.

# CRUD Cotizacion

Esta app estblece la relacion que existe entre un cliente y un producto, en el modelo queda un registro de una cotizacion, es decir,<br>
queda los clientes asociados a un producto que van a comprar, la cotizacion se calcula automaticamente dependiendo de los productos seleccionados<br>
y la cantidad a comprar. Detro del modelo se encuentran los campos: <br>

- cliente
- fecha_emision
- fecha_vencimiento
- subtotal 
- iva 
- total
- estado

Para hacer las operaciones CRUD existe el endpoint /v1/cotizacion y /v1/cotizacion/{id}, el cual recibe los 4 metodos HTTP <br>
GET para leer los datos, POST para crear un nuevo registro, DELETE para borrar un registro especificando el id, PUT o PATCH <br>
para actualizar un registro.

## Configuracion inicial:

Se procede con la ejecucion de los comandos que nos permitiran instalar todas las depencias y paquetes: <br>

Con esto tenemos los paquetes necesarios para el proyecto. Dentro de la jerarquia <br>
se encuentra un requirements.txt que contiene los paquetes en la version especificada. <br>

>NOTA: el proyecto fue configurado con python 3.14.3 y Node.js 22.22.2

>RECOMENDABLE: realizar la instalacion en un entorno virtual

Para instalar estos paquetes se puede ejecutar el comando <br>
dentro de la ruta: proyectoaulaTendencias20261\

`pip install -r requirements.txt `

Para instalar las dependencias de node se puede ejcutar el comando <br>
dentro de la ruta: proyectoaulaTendencias20261\frontend

`npm install`

Inicialmente se crearon los modelos:

-   Clientes
-   Productos
-   Cotizacion
-   ItemCotizacion
-   Usuario
-   Producto
-   Pago
-   Factura

Y para cada uno de ellos un serializer que permite la visualizacion de los datos
que se encuentran registrados en los modelos a través de un sus respectivos EndPoints
creados con django rest framework

La documentacion de los endpoints se ha realizado usando Swagger. Se puede iniciar
el servidor con el comando:

`python manage.py runserver`

Y para iniciar el FrontEnd se debe usar el comando:

`npm run dev`

Para acceder a la documentacion de la API visite el endopint *[http://127.0.0.1:8000/swagger/](http://127.0.0.1:8000/swagger/)*
cuando inicialice el servidor en la máquina local

# Front-End

Ha sido construido usando React + Vite

por defecto la aplicacion queda alojada en el puerto: http://localhost:5173

>NOTA: en la vista del login, si aun no has creado un super usuario, haslo en la terminal con: python manage.py createsuperuser
>con ese usuario y contraseña te puedes logear

## Flujo funcional implementado

1. LoginPage prueba conexion con GET /v1/health/.
2. Login con POST /v1/login/.
3. Tokens access/refresh guardados en localStorage.
4. Axios envia Authorization: Bearer <access>.
5. Si hay 401, se intenta refresh en POST /v1/login/refresh/.
6. Si el refresh falla, se limpia sesion y se retorna error normalizado.
7. Rutas protegidas solo accesibles con token.

## Estructura principal

- src/api/client.js: cliente axios + interceptores + refresh token.
- src/api/authService.js: login, health y logout.
- src/api/resourcesService.js: consumo de recursos de negocio.
- src/context/AuthContext.jsx: estado global de autenticacion.
- src/components/ProtectedRoute.jsx: guardia de rutas.
- src/layouts/AppLayout.jsx: layout base navegable.
- src/pages/*: paginas funcionales base para cada endpoint.

## Endpoints conectados

- GET /v1/health/
- POST /v1/login/
- POST /v1/login/refresh/
- GET /v1/cliente/
- GET /v1/producto/
- GET /v1/cotizacion/
- GET /v1/factura/
- GET /v1/pago/
