using Application;
using Infrastructure;
using Infrastructure.Persistence;
using DbMigration.PostgreSQL;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using pos_webapi.Middleware;
using Serilog;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting BizFlow API...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Logging.ClearProviders();

    // Azure App Service default port
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(8080);
    });

    builder.Configuration.SetBasePath(AppContext.BaseDirectory);
    builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
    builder.Configuration.AddEnvironmentVariables();

    builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    {
        loggerConfiguration
            .MinimumLevel.Information()
            .Enrich.FromLogContext()
            .WriteTo.Console();
    });

    // Core Services
    builder.Services.AddControllers();
    builder.Services.AddHttpContextAccessor();

    // CORS for Mobile & Testing
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("_myAllowSpecificOrigins", policy =>
        {
            policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
        });
    });

    var infraOption = new InfrastructureOption(builder.Services, builder.Configuration);
    infraOption.UsePostgreSQL();

    builder.Services.AddInfrastructureServices(builder.Configuration);
    builder.Services.AddApplicationServices();

    // Security
    string secretString = builder.Configuration["JwtSettings:Key"]
        ?? throw new ArgumentNullException("JwtSettings:Key");
    var key = Encoding.UTF8.GetBytes(secretString);

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

    builder.Services.AddAuthorization();
    builder.Services.AddOpenApi();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    // --- Enterprise Auto-Migration Block ---
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            var identityContext = services.GetRequiredService<AppIdentityDbContext>();
            Log.Information("Checking Identity migrations...");
            await identityContext.Database.MigrateAsync();

            Log.Information("Seeding Admin Data...");
            await DbInitializer.SeedAdminUser(services);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Database migration failed during startup.");
        }
    }

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();
    app.UseSwagger();
    app.UseSwaggerUI();

    app.UseRouting();
    app.UseCors("_myAllowSpecificOrigins");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}