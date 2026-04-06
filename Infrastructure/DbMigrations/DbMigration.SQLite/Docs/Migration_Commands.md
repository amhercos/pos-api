### ⚙️ BizFlow Database Migration Guide

### 📌 System Configuration (SQLite)

| Key | Value |
| --- | --- |
| **Migration Project** | `Infrastructure/DbMigrations/DbMigration.SQLite` |
| **Startup Project** | `Infrastructure/DbMigrations/DbMigration.SQLite` |
| **Context Class** | `SqlitePosDbContext` |
| **Target Framework** | `.NET 10.0` |

---

### 📋 Pre-Migration Requirements

1. **Version Alignment**: Ensure all EF Core packages (Design, Tools, Sqlite) are consolidated to version `10.0.x` via NuGet Manager.
2. **appsettings.json**: Ensure a copy of `appsettings.json` with your `SQLiteConnection` is inside the `DbMigration.SQLite` folder.
3. **Configurations**: Verify `OnModelCreating` uses `builder.ApplyConfigurationsFromAssembly` to load explicit Foreign Key mappings.

---

### 💻 Visual Studio: Package Manager Console (PMC)

```powershell
# 1. Add a New Migration
Add-Migration InitialSQLite -Project DbMigration.SQLite -StartupProject DbMigration.SQLite -Context SqlitePosDbContext

# 2. Apply Changes to Database
Update-Database -Project DbMigration.SQLite -StartupProject DbMigration.SQLite -Context SqlitePosDbContext

# 3. Remove Last Migration (Undo)
Remove-Migration -Project DbMigration.SQLite -StartupProject DbMigration.SQLite -Context SqlitePosDbContext
```

---

### 🖥️ .NET CLI (Terminal/Command Prompt)

```bash
# 1. Add a New Migration
dotnet ef migrations add InitialSQLite --project Infrastructure/DbMigrations/DbMigration.SQLite --startup-project Infrastructure/DbMigrations/DbMigration.SQLite --context SqlitePosDbContext --framework net10.0

# 2. Apply Changes to Database
dotnet ef database update --project Infrastructure/DbMigrations/DbMigration.SQLite --startup-project Infrastructure/DbMigrations/DbMigration.SQLite --context SqlitePosDbContext --framework net10.0

# 3. Remove Last Migration
dotnet ef migrations remove --project Infrastructure/DbMigrations/DbMigration.SQLite --startup-project Infrastructure/DbMigrations/DbMigration.SQLite --context SqlitePosDbContext --framework net10.0
```