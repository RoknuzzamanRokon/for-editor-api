# Permission Check Flow Diagram

## Visual Flow

```
User attempts conversion (e.g., PDF to Word)
                |
                v
        Is user super_user?
                |
        +-------+-------+
        |               |
       YES             NO
        |               |
        v               v
    ✅ ALLOW      Is user demo_user?
                        |
                +-------+-------+
                |               |
               YES             NO
                |               |
                v               v
            ❌ DENY      Check permission in DB
                              |
                              v
                    Query UserConversionPermission
                    WHERE user_id = ? AND action = ?
                              |
                +-------------+-------------+
                |                           |
           Found record                Not found
                |                           |
                v                           v
        is_allowed = true?            ❌ DENY
                |
        +-------+-------+
        |               |
       YES             NO
        |               |
        v               v
    ✅ ALLOW        ❌ DENY
```

## Role Hierarchy

```
┌─────────────────────────────────────────────────────┐
│ super_user                                          │
│ • Bypass ALL permission checks                      │
│ • Can do anything                                   │
│ • Cannot be restricted                              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ admin_user                                          │
│ • Needs explicit permissions for conversions        │
│ • Can manage permissions for general/demo users     │
│ • Cannot manage other admins or super users         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ general_user                                        │
│ • Needs explicit permissions for conversions        │
│ • Default role for new users                        │
│ • Permissions managed by admins                     │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ demo_user                                           │
│ • READ-ONLY - cannot perform conversions            │
│ • Always blocked regardless of permissions          │
│ • Used for trials/demos                             │
└─────────────────────────────────────────────────────┘
```

## Permission States

```
┌──────────────────────────────────────────────────────┐
│ Permission Record Exists                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  is_allowed = TRUE  ──→  ✅ User can convert        │
│                                                      │
│  is_allowed = FALSE ──→  ❌ User cannot convert     │
│                                                      │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ No Permission Record                                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  (No record found)  ──→  ❌ User cannot convert     │
│                                                      │
│  Default: DENY                                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Example Scenarios

### Scenario A: Super User
```
User: john@example.com (super_user)
Action: pdf_to_docs

Check Flow:
1. Is super_user? → YES
2. Result: ✅ ALLOWED (bypass all checks)
```

### Scenario B: General User with Permission
```
User: alice@example.com (general_user)
Action: pdf_to_docs

Check Flow:
1. Is super_user? → NO
2. Is demo_user? → NO
3. Check DB:
   - user_id: 5
   - action: "pdf_to_docs"
   - is_allowed: TRUE
4. Result: ✅ ALLOWED
```

### Scenario C: General User without Permission
```
User: bob@example.com (general_user)
Action: pdf_to_excel

Check Flow:
1. Is super_user? → NO
2. Is demo_user? → NO
3. Check DB:
   - user_id: 7
   - action: "pdf_to_excel"
   - Record NOT FOUND
4. Result: ❌ DENIED
```

### Scenario D: Demo User
```
User: demo@example.com (demo_user)
Action: pdf_to_docs

Check Flow:
1. Is super_user? → NO
2. Is demo_user? → YES
3. Result: ❌ DENIED (demo users are read-only)
```

### Scenario E: User with Revoked Permission
```
User: charlie@example.com (general_user)
Action: docx_to_pdf

Check Flow:
1. Is super_user? → NO
2. Is demo_user? → NO
3. Check DB:
   - user_id: 8
   - action: "docx_to_pdf"
   - is_allowed: FALSE
4. Result: ❌ DENIED
```

## Database Relationships

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │◄──────┐
│ email           │       │
│ role            │       │
│ ...             │       │
└─────────────────┘       │
                          │
                          │ user_id (FK)
                          │
        ┌─────────────────┴──────────────────────┐
        │ user_conversion_permissions            │
        │────────────────────────────────────────│
        │ id (PK)                                │
        │ user_id (FK) ──→ users.id              │
        │ action (e.g., "pdf_to_docs")           │
        │ is_allowed (TRUE/FALSE)                │
        │ created_by (FK) ──→ users.id           │
        │ updated_by (FK) ──→ users.id           │
        │ created_at                             │
        │ updated_at                             │
        │                                        │
        │ UNIQUE(user_id, action)                │
        └────────────────────────────────────────┘
```

## API Call Flow

```
1. Client Request
   POST /api/v3/converters/pdf-to-docs
   Authorization: Bearer <token>
   
        ↓

2. Authentication
   Verify JWT token
   Load current_user
   
        ↓

3. Permission Check
   ensure_permission(db, current_user, "pdf_to_docs")
   
        ↓

4. Points Check (if applicable)
   charge_points(db, current_user, "pdf_to_docs", request_id)
   
        ↓

5. Conversion
   Perform the actual PDF to DOCX conversion
   
        ↓

6. Response
   Return converted file or error
```

## Quick Reference

| User Role | Permission Check | Can Be Restricted |
|-----------|------------------|-------------------|
| super_user | ❌ Bypassed | ❌ No |
| admin_user | ✅ Required | ✅ Yes |
| general_user | ✅ Required | ✅ Yes |
| demo_user | ❌ Always Denied | N/A |

| Permission State | Result |
|-----------------|--------|
| No record exists | ❌ DENY |
| is_allowed = TRUE | ✅ ALLOW |
| is_allowed = FALSE | ❌ DENY |
| User is super_user | ✅ ALLOW (bypass) |
| User is demo_user | ❌ DENY (always) |
