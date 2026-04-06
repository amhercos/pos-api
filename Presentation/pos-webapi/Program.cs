using Application;
using Infrastructure;
using Infrastructure.Persistence;
using DbMigration.PostgreSQL;
using DbMigration.SQLite;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using pos_webapi.Middleware;
using Serilog;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting BizFlow API...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Logging.ClearProviders();

    var configuration = builder.Configuration;

    builder.Host.UseSerilog((context, services, loggerConfiguration) => loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    // Services Configuration
    builder.Services.AddControllers();
    builder.Services.AddHttpContextAccessor();

    var myAllowSpecificOrigins = "_myAllowSpecificOrigins";
    var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: myAllowSpecificOrigins, policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
    });

    //DI
    builder.Services.AddInfrastructureServices(configuration);
    builder.Services.AddApplicationServices();
    var infraOption = new InfrastructureOption(builder.Services, configuration);
    var dbProvider = configuration.GetValue<string>("DatabaseProvider") ?? "PostgreSQL";

    if (dbProvider == "SQLite")
    {
        infraOption.UseSQLite();
    }
    else
    {
        infraOption.UsePostgreSQL();
    }

    // JWT Authentication Services
    string secretString = configuration["JwtSettings:Key"]
        ?? throw new ArgumentNullException("JwtSettings:Key", "The JWT Secret Key is missing from configuration.");
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
            ValidIssuer = configuration["JwtSettings:Issuer"],
            ValidAudience = configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

    builder.Services.AddAuthorization();
    builder.Services.AddOpenApi();
    // Swagger Configuration
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Point of Sale API",
            Version = "v1"
        });

        c.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
        {
            Description = "Standard Authorization header using the Bearer scheme. Example: \"bearer {token}\"",
            In = ParameterLocation.Header,
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer"
        });

        c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("bearer", document)] = new List<string>()
        });
    });
   

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
           
            var context = services.GetRequiredService<PosDbContext>();
            Log.Information("Checking for pending migrations...");

            int retryCount = 0;
            while (retryCount < 5)
            {
                try
                {
                    await context.Database.MigrateAsync();
                    break;
                }
                catch (Exception ex)
                {
                    retryCount++;
                    Log.Warning("Database not ready yet. Retrying ({Count}/5)... Error: {Msg}", retryCount, ex.Message);
                    await Task.Delay(3000); 
                    if (retryCount >= 5) throw;
                }
            }

            await DbInitializer.SeedAdminUser(services);
            Log.Information("Database migration and seeding completed.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "An error occurred during database initialization (Migration/Seeding).");
        }
    }

    // --- Middleware Pipeline ---
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }
    app.UseRouting();
    app.UseCors(myAllowSpecificOrigins);
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "BizFlow API host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}