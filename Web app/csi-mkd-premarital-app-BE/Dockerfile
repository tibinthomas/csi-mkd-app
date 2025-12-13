# =========================
# Base runtime image (Alpine)
# =========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS base
WORKDIR /app

EXPOSE 8080

# =========================
# Build stage
# =========================
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy csproj files for restore layer caching
COPY ["csi-mkd-premarital-app-BE.csproj", "."]
COPY ServiceDefaults/ServiceDefaults.csproj ServiceDefaults/

RUN dotnet restore "./csi-mkd-premarital-app-BE.csproj"

# Copy all source
COPY . .

RUN dotnet build "./csi-mkd-premarital-app-BE.csproj" -c $BUILD_CONFIGURATION -o /app/build

# =========================
# Publish stage
# =========================
FROM build AS publish
ARG BUILD_CONFIGURATION=Release

RUN dotnet publish \
    "./csi-mkd-premarital-app-BE.csproj" \
    -c $BUILD_CONFIGURATION \
    -o /app/publish \
    -r linux-x64 \
    /p:PublishSingleFile=false \
    /p:SelfContained=false \
    /p:PublishReadyToRun=false \
    /p:StripSymbols=true \
    /p:DebugType=None \
    /p:TieredPGO=true \
    /p:InvariantGlobalization=true

# =========================
# Final runtime image
# =========================
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_FORWARDEDHEADERS_ENABLED=true \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 \
    DOTNET_TieredPGO=1 \
    COMPlus_TC_QuickJitForLoops=1 \
    OTEL_SERVICE_NAME=csi-mkd-premarital-app-BE

ENTRYPOINT ["dotnet", "csi-mkd-premarital-app-BE.dll"]