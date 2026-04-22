using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities.Enums;
using MediatR;

namespace Application.Features.Transactions.Queries
{
    public class GetDailySummaryHandler(
        ITransactionRepository transactionRepository,
        IProductRepository productRepository,
        ICurrentUserService currentUserService) : IRequestHandler<GetDailySummaryQuery, DailySummaryDto>
    {
        public async Task<DailySummaryDto> Handle(GetDailySummaryQuery request, CancellationToken ct)
        {
            var storeId = currentUserService.StoreId;

            DateTime startUtc = request.Period switch
            {
                ReportPeriod.Weekly => DateTime.UtcNow.AddDays(-7),
                ReportPeriod.Monthly => DateTime.UtcNow.AddMonths(-1),
                _ => transactionRepository.GetPhStartOfTodayUtc()
            };

            var totalRevenue = await transactionRepository.GetTotalRevenueAsync(storeId, startUtc, ct);
            var totalTransactions = await transactionRepository.GetTotalTransactionsAsync(storeId, startUtc, ct);
            var lowStockCount = await productRepository.CountLowStockAsync(storeId, ct);

            return new DailySummaryDto(
                totalRevenue,
                totalTransactions,
                lowStockCount,
                DateTime.UtcNow);
        }
    }
}