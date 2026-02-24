# Database Migrations

This directory contains SQL migration scripts for the PDF Converter API database.

## Migration Files

- `001_initial_schema.sql` - PostgreSQL version of the initial database schema
- `001_initial_schema_mysql.sql` - MySQL version of the initial database schema
- `001_rollback.sql` - Rollback script to undo the initial schema

## Database Schema

### Tables

#### users
Stores user account information for authentication and authorization.

**Columns:**
- `id` - Primary key (auto-increment)
- `email` - Unique email address (indexed)
- `username` - Optional unique username
- `hashed_password` - Bcrypt hashed password
- `role` - User role (super_user, admin_user, general_user, demo_user)
- `is_active` - Account status flag
- `created_at` - Account creation timestamp

#### refresh_tokens
Stores JWT refresh tokens with expiration and revocation tracking.

**Columns:**
- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users table
- `token_jti` - JWT ID (jti) claim for token identification (unique, indexed)
- `revoked` - Token revocation status
- `expires_at` - Token expiration timestamp
- `created_at` - Token creation timestamp

#### conversion_history (Optional)
Tracks file conversion operations for analytics and user history.

**Columns:**
- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users table (nullable)
- `conversion_type` - Type of conversion (e.g., pdf_to_docx, image_to_pdf)
- `original_filename` - Original uploaded file name
- `converted_filename` - Generated output file name
- `file_size_bytes` - File size in bytes
- `status` - Conversion status (completed, failed, processing)
- `error_message` - Error details if conversion failed
- `created_at` - Conversion timestamp

## Running Migrations

### PostgreSQL

```bash
# Apply migration
psql -U your_username -d your_database -f backend/db/migrations/001_initial_schema.sql

# Rollback migration
psql -U your_username -d your_database -f backend/db/migrations/001_rollback.sql
```

### MySQL

```bash
# Apply migration
mysql -u your_username -p your_database < backend/db/migrations/001_initial_schema_mysql.sql

# Rollback migration
mysql -u your_username -p your_database < backend/db/migrations/001_rollback.sql
```

### SQLite (Development)

```bash
# Apply migration
sqlite3 your_database.db < backend/db/migrations/001_initial_schema.sql

# Note: SQLite doesn't support all PostgreSQL features like ENUM types
# The application uses SQLAlchemy ORM which handles these differences
```

## Using SQLAlchemy (Recommended)

The application uses SQLAlchemy ORM, which can automatically create tables:

```python
from db.session import init_db

# Initialize database (creates all tables)
init_db()
```

Or via command line:

```bash
cd backend
python -c "from db.session import init_db; init_db()"
```

## Migration Best Practices

1. Always backup your database before running migrations
2. Test migrations in a development environment first
3. Keep rollback scripts for every migration
4. Document schema changes in this README
5. Use transactions when possible to ensure atomicity

## Future Migrations

When adding new migrations, follow this naming convention:
- `00X_description.sql` - Forward migration
- `00X_rollback.sql` - Rollback migration
- Update this README with schema changes
