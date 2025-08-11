#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

#Depending on the operating system of the host machines(s) that will build or run the containers, the image specified in the FROM statement may need to be changed.
#For more information, please see https://aka.ms/containercompat

FROM mcr.microsoft.com/dotnet/runtime-deps:9.0-bookworm-slim AS base
WORKDIR /app
# Add CA certificates for HTTPS calls
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
# Create a non-root user for runtime
RUN useradd -m -r -s /usr/sbin/nologin dotnet
USER dotnet
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0-bookworm-slim AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
# Copy project files first to leverage Docker layer caching for restore
COPY ["csi-mkd-premarital-app-BE.csproj", "."]
COPY ServiceDefaults/ServiceDefaults.csproj ServiceDefaults/
RUN dotnet restore "./csi-mkd-premarital-app-BE.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "./csi-mkd-premarital-app-BE.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
# Publish as self-contained, single-file, ReadyToRun. Match the target platform via RUNTIME_IDENTIFIER.
# Defaults to linux-x64; override with --build-arg RUNTIME_IDENTIFIER=linux-arm64 for ARM hosts.
ARG RUNTIME_IDENTIFIER=linux-x64
RUN dotnet publish \
    "./csi-mkd-premarital-app-BE.csproj" \
    -c $BUILD_CONFIGURATION \
    -r $RUNTIME_IDENTIFIER \
    -o /app/publish \
    /p:PublishSingleFile=true \
    /p:SelfContained=true \
    /p:PublishReadyToRun=true \
    /p:StripSymbols=true \
    /p:DebugType=None \
    /p:TieredPGO=true \
    /p:InvariantGlobalization=true

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Defaults friendly for Aspire and reverse proxies. Override at deploy time as needed.
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_FORWARDEDHEADERS_ENABLED=true \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1 \
    DOTNET_TieredPGO=1 \
    COMPlus_ReadyToRun=1 \
    COMPlus_TC_QuickJitForLoops=1 \
    OTEL_SERVICE_NAME=csi-mkd-premarital-app-BE
ENTRYPOINT ["./csi-mkd-premarital-app-BE"]
