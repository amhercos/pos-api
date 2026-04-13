```markdown
# BizFlow Sidecar Deployment Guide

This guide outlines the process of building, naming, and placing your .NET backend for production use within the Tauri application.

---

## 1. Compile the .NET Backend
Execute this command in your Backend project directory (where the `.csproj` file lives). This creates a single executable that includes the .NET runtime, so the client doesn't need to install anything.

```powershell
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:DebugType=None -p:DebugSymbols=false
```

### Flag Breakdown:
* **`-r win-x64`**: Sets the target architecture for Windows 64-bit.
* **`--self-contained`**: Bundles the .NET runtime into the EXE.
* **`PublishSingleFile`**: Merges all dependencies into a single file.
* **`IncludeNativeLibraries`**: Ensures SQLite native drivers work within the single EXE.

---

## 2. Prepare the Tauri Project
Sidecars must be placed in a specific folder inside your Rust directory.

1.  Navigate to: `C:\Working Directory\pos-api\Presentation\pos-webui\src-tauri\`
2.  Create a folder named `binaries` if it does not exist.
3.  Go to your Backend publish output:
    `{BackendRoot}\bin\Release\net9.0\win-x64\publish\`

---

## 3. The Naming Convention
Tauri requires the binary name to match the target triple of the machine it was built for. For a 64-bit Windows machine, use the suffix below:

* **Original Name:** `BizFlow.Backend.exe`
* **Rename To:** `BizFlow.Backend-x86_64-pc-windows-msvc.exe`

---

## 4. Final Folder Structure
Ensure your `src-tauri` folder looks like this. **Do not forget the appsettings.json**, as the sidecar needs it to read JWT keys and CORS settings.

```text
src-tauri/
├── binaries/
│   ├── BizFlow.Backend-x86_64-pc-windows-msvc.exe
│   └── appsettings.json
├── src/
│   └── lib.rs (Contains our dynamic path logic)
└── tauri.conf.json
```

---

## 5. Build the Installer
Once the files are renamed and placed in the `binaries` folder, generate your final production installer (MSI/EXE) by running this in the root of your frontend project:

```bash
npm run tauri build
```

The installer will be generated in `src-tauri/target/release/bundle/msi/`.

---

```
