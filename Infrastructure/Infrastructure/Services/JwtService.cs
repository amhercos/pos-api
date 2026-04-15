using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Infrastructure.Services
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        private readonly IServiceProvider _serviceProvider;

        public JwtService(IConfiguration configuration, IServiceProvider serviceProvider)
        {
            _configuration = configuration;
            _serviceProvider = serviceProvider;
        }

        public async Task<string> GenerateToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]
                ?? throw new InvalidOperationException("JWT Key is missing."));

            using var scope = _serviceProvider.CreateScope();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var masterContext = scope.ServiceProvider.GetRequiredService<AppIdentityDbContext>();

            var roles = await userManager.GetRolesAsync(user);

            string schemaName = "public";
            if (user.StoreId.HasValue && user.StoreId != Guid.Empty)
            {
                var store = await masterContext.Stores
                    .AsNoTracking()
                    .FirstOrDefaultAsync(s => s.Id == user.StoreId);

                if (store != null && !string.IsNullOrEmpty(store.ConnectionString))
                {
                    schemaName = store.ConnectionString;
                }
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.FullName ?? ""),
                new Claim("StoreId", user.StoreId?.ToString() ?? Guid.Empty.ToString()),
                new Claim("SchemaName", schemaName)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            if (!roles.Any())
            {
                claims.Add(new Claim(ClaimTypes.Role, "StoreOwner"));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JwtSettings:DurationInMinutes"] ?? "60")),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}