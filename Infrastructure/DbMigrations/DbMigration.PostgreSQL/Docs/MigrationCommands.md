### ⚙️ BizFlow Database Migration Guide

### 📌 System Configuration

| Key | Value |
| --- | --- |
| **Migration Project** | `Infrastructure/DbMigrations/DbMigration.PostgreSQL` |
| **Startup Project** | `Infrastructure/DbMigrations/DbMigration.PostgreSQL` |
| **Context Class** | `PostgresPosDbContext` |
| **Target Framework** | `.NET 10.0` |

---

### ### Pre-Migration Requirements

1. **Version Alignment**: Ensure all EF Core packages (Design, Tools, PostgreSQL) are consolidated to version `10.0.5` via NuGet Manager.
2. **appsettings.json**: Ensure a copy of `appsettings.json` with your `DefaultConnection` is inside the `DbMigration.PostgreSQL` folder.
3. **Configurations**: Verify `OnModelCreating` uses `builder.ApplyConfigurationsFromAssembly` to load explicit Foreign Key mappings.

---

### ### Visual Studio: Package Manager Console (PMC)

```powershell
# 1. Add a New Migration
Add-Migration Initial_BizFlow_Fixed -Project DbMigration.PostgreSQL -StartupProject DbMigration.PostgreSQL -Context PostgresPosDbContext

# 2. Apply Changes to Database
Update-Database -Project DbMigration.PostgreSQL -StartupProject DbMigration.PostgreSQL -Context PostgresPosDbContext

# 3. Remove Last Migration (Undo)
Remove-Migration -Project DbMigration.PostgreSQL -StartupProject DbMigration.PostgreSQL -Context PostgresPosDbContext

```

### ### .NET CLI (Terminal/Command Prompt)

```
# 1. Add a New Migration
dotnet ef migrations add Initial_BizFlow_Fixed --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context PostgresPosDbContext --framework net10.0

# 2. Apply Changes to Database
dotnet ef database update --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context PostgresPosDbContext --framework net10.0

# 3. Generate SQL Script
dotnet ef migrations script --project Infrastructure/DbMigrations/DbMigration.PostgreSQL --startup-project Infrastructure/DbMigrations/DbMigration.PostgreSQL --context PostgresPosDbContext --output Migrations_Setup.sql
```