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

    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(5130);
    });

    builder.Configuration.SetBasePath(AppContext.BaseDirectory);
    builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

    var configuration = builder.Configuration;

    builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    {
        loggerConfiguration
            .MinimumLevel.Information()
            .Enrich.FromLogContext()
            .WriteTo.Console();
    });

    // Services Configuration
    builder.Services.AddControllers();
    builder.Services.AddHttpContextAccessor();

   
    var myAllowSpecificOrigins = "_myAllowSpecificOrigins";
    builder.Services.AddCors(options =>
    {
        options.AddPolicy(name: myAllowSpecificOrigins, policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
    });



    var infraOption = new InfrastructureOption(builder.Services, configuration);
    infraOption.UsePostgreSQL();

    // DI & PostgreSQL Force
    builder.Services.AddInfrastructureServices(configuration);
    builder.Services.AddApplicationServices();

    // JWT Authentication Services
    string secretString = configuration["JwtSettings:Key"]
        ?? throw new ArgumentNullException("JwtSettings:Key", "The JWT Secret Key is missing.");
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

  // swagger
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
            var identityContext = services.GetRequiredService<AppIdentityDbContext>();
            Log.Information("Applying Identity PostgreSQL Migrations...");
            await identityContext.Database.MigrateAsync();


            Log.Information("Seeding Admin User...");
            await DbInitializer.SeedAdminUser(services);

            Log.Information("Database initialization completed successfully.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Database initialization failed.");
        }
    }

    // Middleware Pipeline
    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();

    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();

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