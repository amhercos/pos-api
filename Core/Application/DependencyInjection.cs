using Application.Behaviors;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Application.Services;
using Application.Services.Pricing;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();
            services.AddValidatorsFromAssembly(assembly);

            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(assembly);
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });


            services.AddScoped<IPricingStrategy, BulkPricingStrategy>();
            services.AddScoped<IPricingStrategy, DiscountPricingStrategy>();
            services.AddScoped<IPricingStrategy, BundlePricingStrategy>();
            services.AddScoped<IPromotionEngine, PromotionEngine>();

            return services;
        }
    }
}
