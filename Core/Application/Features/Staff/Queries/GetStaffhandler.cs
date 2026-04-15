using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Domain.Entities;

namespace Application.Features.Staff.Queries
{
    public class GetStaffHandler(
        IUserRepository userRepository,
        UserManager<User> userManager,
        ICurrentUserService currentUserService) : IRequestHandler<GetStaffQuery, IEnumerable<StaffDto>>
    {
        public async Task<IEnumerable<StaffDto>> Handle(GetStaffQuery request, CancellationToken ct)
        {
            var storeId = currentUserService.StoreId;

            if (storeId == Guid.Empty)
                return Enumerable.Empty<StaffDto>();

            var staffMembers = await userRepository.GetStaffByStoreIdAsync(storeId, ct);

            var staffDtos = new List<StaffDto>();

            foreach (var s in staffMembers)
            {
                var roles = await userManager.GetRolesAsync(s);
                var role = roles.FirstOrDefault() ?? "Cashier";

                staffDtos.Add(new StaffDto(
                    s.Id.ToString(),
                    s.FullName,
                    s.Email ?? string.Empty,
                    role,
                    s.CreatedAt));
            }

            return staffDtos;
        }
    }
}