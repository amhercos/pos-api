
---

### ⚙️ BizFlow Database Migration Guide

### 📌 System Configuration

| Key | Value |
| --- | --- |
| **Migration Project** | `Infrastructure/DbMigrations/DbMigration.PostgreSQL` |
| **Startup Project** | `Infrastructure/DbMigrations/DbMigration.PostgreSQL` |
| **Target Framework** | `.NET 10.0` |

---

### 🗄️ Context Map
| Context Name | Responsibility | Schema |
| :--- | :--- | :--- |
| **`AppIdentityDbContext`** | Global Stores, Users, Roles, Identity | `public` |
| **`PostgresPosDbContext`** | Business Logic (Products, Sales, Inventory) | `tenant_xxx` |

---

### 🚀 Migration Commands (.NET CLI)

#### 1. System/Global Migration (`AppIdentityDbContext`)
**Run this first.** This creates the `Stores` and `Identity` tables in the `public` schema. This is required for registration and login to function.

```bash
# Add System Migration
dotnet ef migrations add Initial_Identity --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context AppIdentityDbContext --framework net10.0

# Update System Database
dotnet ef database update --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context AppIdentityDbContext --framework net10.0
```

#### 2. Tenant Migration (`PostgresPosDbContext`)
**Run this second.** This generates the "Template" for merchant schemas. Note: You generally **do not** run `database update` for this context manually in production; the `StoreMigrationService` handles it.

```bash
# Add Tenant Migration
dotnet ef migrations add Initial_Tenant_Schema --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context PostgresPosDbContext --framework net10.0

# Optional: Update 'public' schema for development testing
dotnet ef database update --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context PostgresPosDbContext --framework net10.0
```

---

### 🛠️ Visual Studio: Package Manager Console (PMC)

```powershell
# --- AppIdentityDbContext (SYSTEM) ---
Add-Migration Initial_Identity -Context AppIdentityDbContext -Project DbMigration.PostgreSQL -StartupProject DbMigration.PostgreSQL
Update-Database -Context AppIdentityDbContext -Project DbMigration.PostgreSQL -StartupProject DbMigration.PostgreSQL

# --- PostgresPosDbContext (TENANT) ---
Add-Migration Initial_Tenant -Context PostgresPosDbContext -Project DbMigration.PostgreSQL -StartupProject DbMigration.PostgreSQL
# Only run update-database if you want to apply migrations to the default 'public' schema
Update-Database -Context PostgresPosDbContext -Project DbMigration.PostgreSQL -StartupProject DbMigration.PostgreSQL
```

---
### Create Identity Migration (public schema)
```

dotnet ef migrations add Initial_Identity --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context AppIdentityDbContext --output-dir Migrations/Identity --framework net10.0
```

###Create POS Migrations (Tenant Schema)
```
dotnet ef migrations add Initial_Tenant_Schema --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context PostgresPosDbContext --output-dir Migrations/PostgresPosDb --framework net10.0
```