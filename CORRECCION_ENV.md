# CORRECCIÓN: Archivos .env en el repositorio

## Hallazgo

El archivo `backend/.env` estaba siendo trackeado por Git, exponiendo credenciales en el historial del repositorio:
- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `DATABASE_URL` con contraseña de PostgreSQL

Además, `.env.example` contenía valores que parecían ser credenciales reales (no placeholders).

## Corrección aplicada

1. **`backend/.env` — removido del tracking** (`git rm --cached`)
2. **`.gitignore` — agregada regla `.env`** para evitar que vuelva a trackearse
3. **`.env.example` — reemplazados valores sensibles por placeholders** (`CHANGE_ME_*`)

## Estado

| Archivo | Antes | Después |
|---------|-------|---------|
| `backend/.env` | Trackeado con secretos reales | Untracked, ignorado por .gitignore |
| `.gitignore` | No cubría `.env` | Cubre `.env` |
| `.env.example` | Valores parecían reales | Placeholders explícitos |

## Recomendaciones

- Rotar todas las credenciales expuestas en el historial de Git (JWT secrets, DB password)
- Considerar `git filter-repo` o `BFG Repo-Cleaner` para eliminar secretos del historial
- No commitear `.env` en ningún repositorio futuro
