# STAGE 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy all project files to maintain folder structure
COPY ["Presentation/pos-webapi/pos-webapi.csproj", "Presentation/pos-webapi/"]
COPY ["Core/Application/Application.csproj", "Core/Application/"]
COPY ["Core/Domain/Domain.csproj", "Core/Domain/"]
COPY ["Infrastructure/Infrastructure/Infrastructure.csproj", "Infrastructure/Infrastructure/"]
COPY ["Infrastructure/DbMigrations/DbMigration.PostgreSQL/DbMigration.PostgreSQL.csproj", "Infrastructure/DbMigrations/DbMigration.PostgreSQL/"]

# Restore dependencies
RUN dotnet restore "Presentation/pos-webapi/pos-webapi.csproj"

# Copy full source and publish
COPY . .
WORKDIR "/src/Presentation/pos-webapi"
RUN dotnet publish "pos-webapi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# STAGE 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_ENVIRONMENT=Production

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "pos-webapi.dll"]