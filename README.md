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
- Django REST Framework 3.15.2
- Simple JWT 5.3.1
- drf-spectacular 0.27.2 (Swagger / OpenAPI)
- django-filters 24.x (filtros por query params)
- SQLite (desarrollo local)
- PostgreSQL vía Supabase (producción) + dj-database-url + psycopg2-binary
- WhiteNoise (archivos estáticos en producción sin nginx)

### Frontend
- React 18 + Vite
- JavaScript (ES6+)
- Axios (cliente HTTP con interceptores JWT)
- CSS personalizado (sin frameworks externos)
- Vitest + @testing-library/react (pruebas unitarias frontend)

---

## Estructura del Proyecto

```
proyectoaulaTendencias20261/
├── backend/
│   ├── api/                  # URLs principales del router (DefaultRouter)
│   ├── backend/              # Configuración Django (settings.py, wsgi.py)
│   ├── projects/             # Proyectos, membresías, roles, permisos, métricas
│   ├── tasks/                # Tareas, etiquetas, comentarios, historial, signals
│   ├── users/                # Usuarios, autenticación JWT, métricas de usuario
│   ├── vercel.json           # Configuración de despliegue serverless
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── api.js        # Axios instance + interceptores JWT (refresh automático)
    │   ├── components/
    │   │   ├── auth/         # LoginPage, RegisterPage
    │   │   ├── common/       # Toast, ConfirmModal, componentes reutilizables
    │   │   ├── layout/       # Navbar, Layout principal
    │   │   ├── projects/     # ProjectsPage, ProjectMetrics
    │   │   ├── tasks/        # KanbanBoard, KanbanColumn, TaskCard, TaskModal,
    │   │   │                 # TaskHistory, CommentsSection, MembersModal, DeleteTaskModal
    │   │   └── users/        # AdminPage, ProfilePage
    │   ├── hooks/
    │   │   ├── useKanbanBoard.js   # Estado y lógica completa del tablero Kanban
    │   │   └── useTaskComments.js  # Estado y operaciones CRUD de comentarios
    │   ├── constants/        # Estados (TASK_STATUSES) y prioridades (PRIORITIES)
    │   └── test/             # Pruebas unitarias frontend (Vitest)
    ├── vite.config.js
    └── package.json
```

---

## Variables de Entorno

### Backend — archivo `backend/.env`

```env
SECRET_KEY=django-insecure-cambia-esto-en-produccion
DEBUG=True
ALLOWED_HOSTS=localhost 127.0.0.1
DATABASE_URL=                        # dejar vacío para usar SQLite en local
CORS_ALLOWED_ORIGINS=http://localhost:5173 http://127.0.0.1:5173
```

En producción (Vercel), configurar las mismas variables como **Environment Variables** del proyecto, con:
- `DEBUG=False`
- `DATABASE_URL=postgresql://...` (URL de Supabase)
- `ALLOWED_HOSTS=tudominio.vercel.app`
- `CORS_ALLOWED_ORIGINS=https://tufrontend.vercel.app`

### Frontend — archivo `frontend/.env`

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

En producción:
```env
VITE_API_URL=https://tubackend.vercel.app/api
```

> Las variables de frontend **deben comenzar con `VITE_`** para ser accesibles desde el código del browser.

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

### En producción (ya disponibles en https://proyectoaula-tendencias20261-aq3d.vercel.app)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin` | Administrador (ve todos los proyectos y usuarios) |
| `jdavid` | `jdavid` | Member (ve solo sus proyectos) |

### En local (crear mediante `POST /api/users/`)

Requiere autenticación de admin. El primer usuario admin se puede crear con:
```bash
python manage.py createsuperuser
```

O directamente en el shell de Django:
```bash
python manage.py shell
>>> from users.models import User
>>> User.objects.create_user(username='admin', password='admin123', email='admin@test.com', role='admin')
```

Luego crear el member desde el frontend o Swagger:
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

La API usa JWT (JSON Web Tokens). Los tokens se gestionan automáticamente en el frontend mediante interceptores de Axios.

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
{
  "refresh": "<refresh_token>"
}
```

> El access token tiene vigencia de **60 minutos**. El refresh token tiene vigencia de **7 días**. Con `ROTATE_REFRESH_TOKENS=True`, cada uso del refresh token genera un nuevo par de tokens.

---

## Endpoints

### Usuarios
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| POST | /api/users/ | Registro de usuario | Sí (solo admin) |
| GET | /api/users/ | Listar usuarios | Sí (admin: todos / member: solo él) |
| GET | /api/users/{id}/ | Ver usuario | Sí |
| PUT/PATCH | /api/users/{id}/ | Editar usuario | Sí (propio o admin) |
| GET | /api/users/profile/ | Ver perfil propio | Sí |
| POST | /api/users/logout/ | Cerrar sesión (blacklist del refresh token) | Sí |
| GET | /api/users/{id}/metrics/ | Métricas de productividad del usuario | Sí (propio o admin) |
| POST | /api/users/{id}/toggle-active/ | Activar / desactivar cuenta de usuario | Sí (solo admin) |

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
| POST | /api/tasks/ | Crear tarea | Sí (owner/editor) |
| GET | /api/tasks/ | Listar tareas | Sí |
| GET | /api/tasks/{id}/ | Ver tarea | Sí |
| PUT/PATCH | /api/tasks/{id}/ | Editar tarea | Sí (owner/editor) |
| DELETE | /api/tasks/{id}/ | Eliminar tarea | Sí (owner/editor) |

### Historial de Tareas
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | /api/history/ | Listar historial general | Sí |
| GET | /api/history/?task={id} | Filtrar historial por tarea | Sí |
| GET | /api/history/?field_changed=status | Filtrar por campo modificado | Sí |

> El historial se genera **automáticamente** mediante Django signals (`pre_save`) al cambiar `status`, `priority` o `assigned_to` de una tarea.

### Comentarios
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | /api/comments/ | Listar comentarios | Sí |
| GET | /api/comments/?task={id} | Filtrar comentarios por tarea | Sí |
| POST | /api/comments/ | Agregar comentario | Sí (miembro del proyecto) |
| PUT/PATCH | /api/comments/{id}/ | Editar comentario | Sí (solo autor o admin) |
| DELETE | /api/comments/{id}/ | Eliminar comentario | Sí (solo autor o admin) |

### Etiquetas
| Método | Endpoint | Descripción | Auth |
|---|---|---|---|
| GET | /api/tags/ | Listar etiquetas | Sí |
| POST | /api/tags/ | Crear etiqueta | Sí |
| DELETE | /api/tags/{id}/ | Eliminar etiqueta | Sí |

### Filtros disponibles en /api/tasks/
| Parámetro | Ejemplo | Tipo |
|---|---|---|
| project | ?project=\<uuid\> | Exacto |
| status | ?status=pending | Exacto |
| priority | ?priority=high | Exacto |
| assigned_to | ?assigned_to=\<uuid\> | Exacto |
| is_active | ?is_active=true | Exacto |
| tags__name | ?tags__name=backend | Exacto |
| search | ?search=titulo | Parcial (title, description, tags) |
| ordering | ?ordering=-created_at | Orden (created_at, due_date, priority, status) |

---

## Estados de Tarea

| Valor | Etiqueta | Descripción |
|---|---|---|
| `pending` | Pendiente | Tarea creada, sin iniciar |
| `in_progress` | En progreso | Tarea en desarrollo activo |
| `in_review` | En revisión | Tarea en proceso de revisión/QA |
| `completed` | Completada | Tarea finalizada (registra `completed_at` automáticamente) |
| `cancelled` | Cancelada | Tarea descartada (excluida de métricas de cumplimiento) |

## Prioridades de Tarea

| Valor | Etiqueta |
|---|---|
| `low` | Baja |
| `medium` | Media (default) |
| `high` | Alta |
| `critical` | Crítica |

---

## Roles en Proyectos

| Rol | Permisos |
|---|---|
| `owner` | Crear, editar, archivar, reactivar proyecto; gestionar miembros y roles; todas las operaciones sobre tareas |
| `editor` | Crear, editar y eliminar tareas dentro del proyecto |
| `observer` | Solo lectura: ver proyecto y tareas (no puede crear ni modificar) |

> Un usuario sin membresía recibe `403 Forbidden` o `404 Not Found` al intentar acceder a un proyecto.

---

## Métricas disponibles

### Métricas de proyecto — `GET /api/projects/{id}/metrics/`

```json
{
  "project_id": "uuid",
  "project_name": "Mi proyecto",
  "total_tasks": 20,
  "by_status": {"pending": 5, "in_progress": 3, "completed": 10, "cancelled": 2},
  "completed": 10,
  "pending": 5,
  "in_progress": 3,
  "in_review": 0,
  "cancelled": 2,
  "overdue": 1,
  "avg_resolution_hours": 12.5,
  "completion_rate_percent": 50.0
}
```

### Métricas de usuario — `GET /api/users/{id}/metrics/`

```json
{
  "user_id": "uuid",
  "username": "jdavid",
  "total_assigned": 15,
  "completed": 10,
  "in_progress": 2,
  "pending": 2,
  "cancelled": 1,
  "overdue": 1,
  "fulfillment_rate_percent": 71.4
}
```

> `fulfillment_rate_percent` = `completed / (total - cancelled) * 100`. Las tareas canceladas no penalizan el rendimiento del usuario.

---

## Pruebas

### Backend (Django TestCase)

```bash
cd backend
python manage.py test
```

| App | Archivo | Tests | Qué valida |
|---|---|---|---|
| users | `users/tests.py` | 7 | Registro, login correcto/incorrecto, perfil autenticado/no autenticado, métricas propias, acceso a métricas ajenas |
| projects | `projects/tests.py` | 3 | Permisos por rol: owner, editor, observer, usuarios externos |
| tasks | `tasks/tests.py` | 4 | Historial automático por status y priority, endpoint de historial, bloqueo en proyecto archivado |

### Frontend (Vitest)

```bash
cd frontend
npm test
```

| Archivo | Tests | Qué valida |
|---|---|---|
| `roles.test.jsx` | 5 | Permisos por rol: owner puede editar, observer no puede |
| `tags.test.jsx` | 5 | Agregar, eliminar y validar etiquetas duplicadas |
| `comments.test.jsx` | 7 | Crear, editar, eliminar y validar comentarios vacíos |

---

## Documentación Interactiva

Con el servidor backend corriendo:

- Swagger UI: `http://127.0.0.1:8000/api/docs/`
- Schema OpenAPI (JSON): `http://127.0.0.1:8000/api/schema/`

En producción:
- Swagger UI: https://proyectoaula-tendencias20261-two.vercel.app/api/docs/

---

## Ramas

| Rama | Descripción |
|---|---|
| `main` | Código estable, actualizado y listo para producción |
| `dev` | Rama de integración continua (features en desarrollo) |
| `Entregable1` | Entrega 1 — API REST base con autenticación JWT |
| `entregable2` | Entrega 2 — Frontend React + colaboración + pruebas unitarias |
| `entregable3` | Entrega 3 — Métricas, historial automático, roles avanzados, archivado |
