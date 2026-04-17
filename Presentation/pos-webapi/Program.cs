using Application;
using Infrastructure;
using Infrastructure.Persistence;
using DbMigration.PostgreSQL;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using pos_webapi.Middleware;
using Serilog;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting BizFlow API...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Logging.ClearProviders();


    var port = Environment.GetEnvironmentVariable("PORT") ?? "5130";
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(int.Parse(port));
    });

    // Configuration Loading
    builder.Configuration.SetBasePath(AppContext.BaseDirectory);
    builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: false);
    builder.Configuration.AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true);
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

  
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("_myAllowSpecificOrigins", policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });

    // Infrastructure & Application DI
    var infraOption = new InfrastructureOption(builder.Services, builder.Configuration);
    infraOption.UsePostgreSQL();

    builder.Services.AddInfrastructureServices(builder.Configuration);
    builder.Services.AddApplicationServices();

    // JWT Security Configuration
    string secretString = builder.Configuration["JwtSettings:Key"]
        ?? throw new ArgumentNullException("JwtSettings:Key");
    var key = Encoding.UTF8.GetBytes(secretString);

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
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

    // Auto-Migration Block
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
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BizFlow API V1");
        c.RoutePrefix = string.Empty;
    });

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