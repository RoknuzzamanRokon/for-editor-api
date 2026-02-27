# Alembic Migration Setup - Complete Guide

## What Was Done

1. **Installed Alembic** - Added to Pipfile and installed
2. **Initialized Alembic** - Created alembic directory structure
3. **Configured Alembic** - Set up to use your database connection from .env
4. **Fixed SQLAlchemy relationship issue** - Added `foreign_keys` parameter to resolve ambiguous foreign key error
5. **Created initial migration** - Marked current database state as baseline
6. **Tested with example migration** - Added `last_login` column to users table

## Fixed Issues

### 1. Ambiguous Foreign Key Error
**Problem**: `User.conversion_permissions` relationship had multiple foreign keys pointing to users table.

**Solution**: Added `foreign_keys="UserConversionPermission.user_id"` to the relationship in `backend/db/models.py`:

```python
conversion_permissions = relationship(
    "UserConversionPermission",
    back_populates="user",
    foreign_keys="UserConversionPermission.user_id",
    cascade="all, delete-orphan",
)
```

### 2. Database Migration System
**Problem**: No migration system in place - changes to models didn't update database.

**Solution**: Set up Alembic for automatic schema migrations.

## How to Use Alembic

### When You Add/Modify Model Fields

1. **Edit your model** in `backend/db/models.py`:
   ```python
   class User(Base):
       # ... existing fields ...
       new_field = Column(String(100), nullable=True)
   ```

2. **Generate migration**:
   ```bash
   cd backend
   pipenv run alembic revision --autogenerate -m "Add new_field to User"
   ```

3. **Review the migration** in `backend/alembic/versions/`:
   - Check the generated file
   - Remove any unwanted changes (like conversion_history table operations)
   - Ensure the changes match your intent

4. **Apply the migration**:
   ```bash
   pipenv run alembic upgrade head
   ```

### Common Commands

```bash
# Check current migration version
pipenv run alembic current

# View migration history
pipenv run alembic history

# Apply all pending migrations
pipenv run alembic upgrade head

# Rollback one migration
pipenv run alembic downgrade -1

# Rollback to specific version
pipenv run alembic downgrade <revision_id>
```

## Important Notes

### About conversion_history Table

Your database has a `conversion_history` table that's not in your models. Alembic will try to drop it in auto-generated migrations. Always review and remove these operations from generated migrations if you want to keep the table.

To ignore this table permanently, you can:
1. Add it to your models if you need it
2. Or manually edit each migration to remove operations on this table

### Migration Best Practices

1. **Always review auto-generated migrations** - They may include unwanted changes
2. **Test on development first** - Never run migrations directly on production
3. **Keep migrations in version control** - Commit them with your code
4. **One logical change per migration** - Makes rollbacks easier
5. **Never edit applied migrations** - Create new migrations to fix issues

## Example: Adding a New Column

Let's say you want to add a `phone_number` field to users:

```python
# 1. Edit backend/db/models.py
class User(Base):
    # ... existing fields ...
    phone_number = Column(String(20), nullable=True)
```

```bash
# 2. Generate migration
cd backend
pipenv run alembic revision --autogenerate -m "Add phone_number to users"

# 3. Review the generated file in alembic/versions/
# Remove any conversion_history operations if present

# 4. Apply migration
pipenv run alembic upgrade head
```

## Troubleshooting

### Error: "Can't locate revision identified by..."
- Run `pipenv run alembic current` to check current state
- Run `pipenv run alembic history` to see available migrations
- You may need to run `pipenv run alembic stamp head` to mark current state

### Error: "Target database is not up to date"
- Run `pipenv run alembic upgrade head` to apply pending migrations

### Error: "Can't determine join condition"
- Check that relationships have proper `foreign_keys` parameter when multiple FKs exist

## Files Structure

```
backend/
├── alembic/
│   ├── versions/          # Migration files
│   ├── env.py            # Alembic environment config
│   ├── README            # Alembic default readme
│   └── script.py.mako    # Migration template
├── alembic.ini           # Alembic configuration
└── db/
    └── models.py         # Your SQLAlchemy models
```

## Next Steps

Your server should now start without errors. You can:

1. Start the server: `pipenv run uvicorn main:app --reload --port 8000`
2. Make model changes and generate migrations as needed
3. Keep your database schema in sync with your code

## Summary

✅ Fixed ambiguous foreign key error in User model
✅ Installed and configured Alembic
✅ Created baseline migration
✅ Successfully added last_login column as test
✅ Database is now under version control with migrations
