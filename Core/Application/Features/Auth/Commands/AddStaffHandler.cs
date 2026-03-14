using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Auth.Commands
{
    public class AddStaffHandler(UserManager<User> userManager,
            IPosDbContext context,
            ICurrentUserService currentUserService) : IRequestHandler<AddStaffCommand, bool>
    {
        public async Task<bool> Handle(AddStaffCommand request, CancellationToken ct)
        {
            var storeOwnerId = currentUserService.StoreId;

            if (storeOwnerId == Guid.Empty)
                throw new UnauthorizedAccessException("You must be linked to a store to add staff.");

            var cashier = new User
            {
                Email = request.Email,
                UserName = request.Email,
                FullName = request.FullName,
                StoreId = storeOwnerId,
                Role = "Cashier",
                CreatedAt = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(cashier, request.Password);
            return result.Succeeded;
        }
    }
}
