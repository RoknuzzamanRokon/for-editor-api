# Alembic Database Migrations

This project uses Alembic for database schema migrations.

## Common Commands

### Create a new migration (auto-generate from model changes)
```bash
pipenv run alembic revision --autogenerate -m "Description of changes"
```

### Create a blank migration (manual)
```bash
pipenv run alembic revision -m "Description of changes"
```

### Apply migrations (upgrade to latest)
```bash
pipenv run alembic upgrade head
```

### Apply migrations (upgrade one step)
```bash
pipenv run alembic upgrade +1
```

### Rollback migrations (downgrade one step)
```bash
pipenv run alembic downgrade -1
```

### Rollback to specific revision
```bash
pipenv run alembic downgrade <revision_id>
```

### Show current revision
```bash
pipenv run alembic current
```

### Show migration history
```bash
pipenv run alembic history
```

### Show pending migrations
```bash
pipenv run alembic history --verbose
```

## Workflow

1. **Make changes to your models** in `backend/db/models.py`

2. **Generate a migration**:
   ```bash
   pipenv run alembic revision --autogenerate -m "Add new column to users table"
   ```

3. **Review the generated migration** in `backend/alembic/versions/`
   - Check that the changes are correct
   - Edit if necessary

4. **Apply the migration**:
   ```bash
   pipenv run alembic upgrade head
   ```

5. **Commit the migration file** to version control

## Important Notes

- Always review auto-generated migrations before applying them
- Test migrations on a development database first
- Keep migrations in version control
- Never edit migrations that have been applied to production
- If you need to change an applied migration, create a new migration to modify it

## Configuration

- `alembic.ini` - Main configuration file
- `alembic/env.py` - Environment configuration (database connection)
- `alembic/versions/` - Migration files directory

The database URL is automatically loaded from your `.env` file via `core.config.settings`.
