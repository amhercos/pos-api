# Stage 1: Build and Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /src

# Copy everything from the local directory
COPY . .

# Restore and Publish in one go to be safe
RUN dotnet publish "Presentation/pos-webapi/pos-webapi.csproj" -c Release -o /app/publish

# Stage 2: Final Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Copy from the build-env stage
COPY --from=build-env /app/publish .

# Set environment variables for the container
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "pos-webapi.dll"]