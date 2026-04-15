using Application.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId =>
        Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    public string? Role =>
        _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);

    public Guid StoreId =>
        Guid.TryParse(_httpContextAccessor.HttpContext?.User?.FindFirstValue("StoreId"), out var id) ? id : Guid.Empty;

    public string? SchemaName =>
        _httpContextAccessor.HttpContext?.User?.FindFirstValue("SchemaName");

    public Guid? GetTenantId()
    {
        if (_httpContextAccessor.HttpContext?.User.IsInRole("SuperAdmin") ?? false)
        {
            return null;
        }

        var claim = _httpContextAccessor.HttpContext?.User.FindFirst("StoreId")?.Value;
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}