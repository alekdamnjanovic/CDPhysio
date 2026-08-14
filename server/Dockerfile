# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["server.csproj", "./"]
RUN dotnet restore "server.csproj"
COPY . .
RUN dotnet build "server.csproj" -c Release -o /app/build
RUN dotnet publish "server.csproj" -c Release -o /app/publish

# Production stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "server.dll"]
