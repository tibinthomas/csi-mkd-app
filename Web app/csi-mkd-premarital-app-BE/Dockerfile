#See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

#Depending on the operating system of the host machines(s) that will build or run the containers, the image specified in the FROM statement may need to be changed.
#For more information, please see https://aka.ms/containercompat

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
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
# Publish as self-contained, single-file, ReadyToRun for linux-x64 by default
ARG RUNTIME_IDENTIFIER=linux-x64
RUN dotnet publish \
    "./csi-mkd-premarital-app-BE.csproj" \
    -c $BUILD_CONFIGURATION \
    -r $RUNTIME_IDENTIFIER \
    -o /app/publish \
    /p:PublishSingleFile=true \
    /p:SelfContained=true \
    /p:PublishReadyToRun=true \
    /p:TieredPGO=true

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Defaults friendly for Aspire and reverse proxies. Override at deploy time as needed.
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_FORWARDEDHEADERS_ENABLED=true \
    OTEL_SERVICE_NAME=csi-mkd-premarital-app-BE
ENTRYPOINT ["./csi-mkd-premarital-app-BE"]
