using Application.Features.Staff.Commands;
using Application.Interfaces;
using Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Features.Staff.Commands;

public class DeleteStaffHandler(
    UserManager<User> userManager,
    ICurrentUserService currentUserService) : IRequestHandler<DeleteStaffCommand, bool>
{
    public async Task<bool> Handle(DeleteStaffCommand request, CancellationToken ct)
    {
        var merchantStoreId = currentUserService.StoreId;
        var staff = await userManager.FindByIdAsync(request.Id.ToString());

        if (staff == null || staff.StoreId != merchantStoreId)
        {
            return false;
        }

        var isCashier = await userManager.IsInRoleAsync(staff, "Cashier");
        if (!isCashier)
        {
            return false;
        }

        var result = await userManager.DeleteAsync(staff);
        return result.Succeeded;
    }
}