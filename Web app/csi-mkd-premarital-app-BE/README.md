# CSI MKD Premarital Counseling Backend

This project uses ASP.NET Core minimal APIs for faster cold start and simpler routing. Endpoints are organized per feature under `Endpoints/`.

Key folders:

- `Endpoints/`: Minimal API endpoint mappings (one file per feature)
- `Services/`, `Repositories/`, `Models/`, `DTOs/`: Domain layers unchanged
  // ETag helper removed. We rely on OutputCache for response caching.

To run:

```
dotnet run
```

Swagger UI is enabled in Development at `/swagger`.
