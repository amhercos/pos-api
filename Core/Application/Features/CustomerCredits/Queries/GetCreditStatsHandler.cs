using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace Application.Features.CustomerCredits.Queries
{
    public class GetCreditStatsHandler(
     ICustomerCreditRepository creditRepository,
     ICurrentUserService currentUserService) : IRequestHandler<GetCreditStatsQuery, CreditStatsDto>
    {
        public async Task<CreditStatsDto> Handle(GetCreditStatsQuery request, CancellationToken ct)
        {
            var storeId = currentUserService.StoreId;

            DateTime? startDate = request.Period.ToLower() switch
            {
                "today" => DateTime.UtcNow.Date,
                "weekly" => DateTime.UtcNow.AddDays(-7),
                "monthly" => DateTime.UtcNow.AddMonths(-1),
                _ => null
            };

            var totalCollected = await creditRepository.GetTotalCollectedAsync(storeId, startDate, ct);
            var totalDebts = await creditRepository.GetTotalActiveDebtsAsync(storeId, ct);

            return new CreditStatsDto(totalCollected, totalDebts);
        }
    }
}
