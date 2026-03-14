using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Staff.Queries
{
    public class GetStaffHandler(
    IUserRepository userRepository,
    ICurrentUserService currentUserService) : IRequestHandler<GetStaffQuery, IEnumerable<StaffDto>>
    {
        public async Task<IEnumerable<StaffDto>> Handle(GetStaffQuery request, CancellationToken ct)
        {
            var storeId = currentUserService.StoreId;

            if (storeId == Guid.Empty)
                return Enumerable.Empty<StaffDto>();

            var staffMembers = await userRepository.GetStaffByStoreIdAsync(storeId, ct);


            return staffMembers.Select(s => new StaffDto(
                s.Id.ToString(),
                s.FullName,
                s.Email ?? string.Empty,
                s.Role ?? "Cashier",
                s.CreatedAt));
        }
    }
}
