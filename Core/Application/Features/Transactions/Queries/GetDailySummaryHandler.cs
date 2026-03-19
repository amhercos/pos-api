using Application.Dto;
using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

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

            var totalRevenue = await transactionRepository.GetTotalRevenueTodayAsync(storeId, ct);
            var totalTransactions = await transactionRepository.GetTotalTransactionsTodayAsync(storeId, ct);

            var lowStockCount = await productRepository.CountLowStockAsync(storeId, ct);

            return new DailySummaryDto(
                totalRevenue,
                totalTransactions,
                lowStockCount,
                DateTime.UtcNow);
        }
    }
}
