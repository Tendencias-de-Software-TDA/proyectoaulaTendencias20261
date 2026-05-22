# Gestor de Tareas y Productividad

Aplicación fullstack para la gestión integral de tareas personales y de equipo, organizada por proyectos, con colaboración en tiempo real, control de roles, etiquetas, comentarios, tablero Kanban interactivo y métricas de productividad.

---

## Integrantes

| Nombre | GitHub |
|---|---|
| Edison Trejos | [@Etrejos97](https://github.com/Etrejos97) |
| Juan David Cuervo | [@juandDavid](https://github.com/juandDavid) |
| Juan Felipe Marín | [@JuanFelipeMarin11](https://github.com/JuanFelipeMarin11) |
| Laura Osorio | — |

**Asignatura:** Tendencias del Desarrollo de Software  
**Institución:** Tecnológico de Antioquia  
**Docente:** Jeisson Ibargüen Maturana

---

## Despliegue en Producción

| Servicio | URL |
|---|---|
| Frontend (Vercel) | https://proyectoaula-tendencias20261-aq3d.vercel.app |
| Backend / API (Vercel) | https://proyectoaula-tendencias20261-two.vercel.app |
| Swagger UI | https://proyectoaula-tendencias20261-two.vercel.app/api/docs/ |

---

## Tecnologías

### Backend
- Python 3.12.9
- Django 4.2.14
- Django Rest Framework 3.15.2
- Simple JWT 5.3.1
- drf-spectacular 0.27.2 (Swagger)
- SQLite (desarrollo)

### Frontend
- React 18 + Vite
- JavaScript (ES6+)
- CSS personalizado (sin frameworks externos)
- Vitest + @testing-library/react (pruebas unitarias frontend)

---

## Estructura del Proyecto

```
proyectoaulaTendencias20261/
├── backend/
│   ├── api/            # URLs principales del router
│   ├── backend/        # Configuración Django (settings, wsgi)
│   ├── projects/       # Proyectos, membresías, roles, métricas
│   ├── tasks/          # Tareas, etiquetas, comentarios, historial
│   ├── users/          # Usuarios, autenticación, métricas de usuario
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── components/ # Auth, Proyectos, Tareas, Kanban, Métricas, UI
    │   ├── api/        # Llamadas a la API REST
    │   ├── constants/  # Estados y prioridades
    │   └── test/       # Pruebas unitarias frontend
    └── vite.config.js
```

---

## Requisitos Previos

- Python 3.12.9
- Node.js 18+
- pip

---

## Instalación y Configuración Local

### Backend

**1. Clonar el repositorio**
```bash
git clone https://github.com/Etrejos97/proyectoaulaTendencias20261.git
cd proyectoaulaTendencias20261
```

**2. Crear y activar el entorno virtual**

Windows:
```bash
python -m venv entorno
entorno\Scripts\activate
```

Linux/Mac:
```bash
python -m venv entorno
source entorno/bin/activate
```

**3. Instalar dependencias**
```bash
cd backend
pip install -r requirements.txt
```

**4. Aplicar migraciones**
```bash
python manage.py migrate
```

**5. Correr el servidor**
```bash
python manage.py runserver
```

La API estará disponible en `http://127.0.0.1:8000/`

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173/`

---

## Usuarios de Prueba

Crear los siguientes usuarios mediante `POST /api/users/`:

```json
{
  "username": "admin",
  "email": "admin@test.com",
  "password": "admin123",
  "role": "admin"
}
```

```json
{
  "username": "jdavid",
  "email": "jdavid@test.com",
  "password": "jdavid",
  "role": "member"
}
```

---

## Autenticación

La API usa JWT. Para autenticarse:

**Obtener token**
```
POST /api/token/
{
  "username": "admin",
  "password": "admin"
}
```

**Usar token en cada petición**
```
Authorization: Bearer <access_token>
```

**Renovar token**
```
POST /api/token/refresh/
```

---

## Endpoints

### Usuarios
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | /api/users/ | Registro de usuario | No |
| GET | /api/users/ | Listar usuarios | Sí (admin: todos / member: solo él) |
| GET | /api/users/{id}/ | Ver usuario | Sí |
| PUT/PATCH | /api/users/{id}/ | Editar usuario | Sí |
| GET | /api/users/profile/ | Ver perfil propio | Sí |
| POST | /api/users/logout/ | Cerrar sesión | Sí |
| GET | /api/users/{id}/metrics/ | Métricas de productividad del usuario | Sí |

### Proyectos
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | /api/projects/ | Crear proyecto | Sí |
| GET | /api/projects/ | Listar proyectos del usuario | Sí |
| GET | /api/projects/{id}/ | Ver proyecto | Sí (miembros) |
| PUT/PATCH | /api/projects/{id}/ | Editar proyecto | Sí (owner/editor) |
| DELETE | /api/projects/{id}/ | Eliminar proyecto | Sí (owner/admin) |
| POST | /api/projects/{id}/archive/ | Archivar proyecto | Sí (owner/admin) |
| POST | /api/projects/{id}/reactivate/ | Reactivar proyecto | Sí (owner/admin) |
| GET | /api/projects/{id}/metrics/ | Métricas del proyecto | Sí (miembros) |

### Membresías
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | /api/memberships/ | Listar membresías | Sí |
| POST | /api/memberships/ | Agregar miembro al proyecto | Sí (owner/admin) |
| PUT/PATCH | /api/memberships/{id}/ | Cambiar rol de miembro | Sí (owner/admin) |
| DELETE | /api/memberships/{id}/ | Eliminar miembro | Sí (owner/admin) |

### Tareas
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | /api/tasks/ | Crear tarea | Sí |
| GET | /api/tasks/ | Listar tareas | Sí |
| GET | /api/tasks/{id}/ | Ver tarea | Sí |
| PUT/PATCH | /api/tasks/{id}/ | Editar tarea | Sí |
| DELETE | /api/tasks/{id}/ | Eliminar tarea | Sí |

### Historial de Tareas *(entregable 3)*
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | /api/history/ | Listar historial general | Sí |
| GET | /api/history/?task={id} | Filtrar historial por tarea | Sí |

> El historial se genera automáticamente al cambiar `status` o `priority` de una tarea.

### Comentarios
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | /api/comments/ | Listar comentarios | Sí |
| POST | /api/comments/ | Agregar comentario | Sí |
| PUT/PATCH | /api/comments/{id}/ | Editar comentario | Sí (solo autor) |
| DELETE | /api/comments/{id}/ | Eliminar comentario | Sí (solo autor) |

### Etiquetas
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | /api/tags/ | Listar etiquetas | Sí |
| POST | /api/tags/ | Crear etiqueta | Sí |
| DELETE | /api/tags/{id}/ | Eliminar etiqueta | Sí |

### Filtros disponibles en /api/tasks/
| Parámetro | Ejemplo |
|---|---|
| status | ?status=pending |
| priority | ?priority=high |
| project | ?project=\<id\> |
| assigned_to | ?assigned_to=\<id\> |
| search | ?search=titulo |
| ordering | ?ordering=-created_at |

---

## Roles en Proyectos

| Rol | Permisos |
|---|---|
| `owner` | Crear, editar, archivar, reactivar proyecto; gestionar miembros y roles |
| `editor` | Crear y editar tareas dentro del proyecto |
| `observer` | Solo lectura: ver proyecto y tareas |

> Un usuario externo al proyecto recibe `404` al intentar acceder a él.

---

## Métricas disponibles

### Métricas de proyecto — `GET /api/projects/{id}/metrics/`
Retorna: total de tareas, desglose por estado, tareas vencidas, tasa de completitud (%), tiempo promedio de resolución en horas.

### Métricas de usuario — `GET /api/users/{id}/metrics/`
Retorna: total de tareas asignadas, tareas completadas, tareas vencidas, tasa de cumplimiento (%).

---

## Pruebas

### Backend (Django TestCase)

```bash
cd backend
python manage.py test
```

| App | Archivo | Tests | Qué valida |
|---|---|---|---|
| users | `users/tests.py` | 7 | Registro, login, perfil, métricas de usuario |
| projects | `projects/tests.py` | 3 | Permisos por rol: owner, editor, observer, externos |
| tasks | `tasks/tests.py` | 4 | Historial automático, bloqueo en proyecto archivado |

### Frontend (Vitest)

```bash
cd frontend
npm test
```

| Archivo | Tests | Qué valida |
|---|---|---|
| `roles.test.jsx` | 5 | Permisos por rol: owner, editor, observer |
| `tags.test.jsx` | 5 | Agregar, eliminar y validar etiquetas |
| `comments.test.jsx` | 7 | Crear, editar, eliminar y validar comentarios |

---

## Documentación Interactiva

Con el servidor backend corriendo:

- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- Schema OpenAPI: `http://127.0.0.1:8000/api/schema/`

---

## Ramas

| Rama | Descripción |
|---|---|
| `main` | Código estable y actualizado |
| `entregable1` | Entrega 1 — API REST base con autenticación JWT |
| `entregable2` | Entrega 2 — Frontend + colaboración + pruebas unitarias |
| `entregable3` | Entrega 3 — Métricas, historial, roles avanzados, archivado |
