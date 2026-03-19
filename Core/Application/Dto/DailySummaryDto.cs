namespace Application.Dto;

public record DailySummaryDto(
    decimal TotalRevenue,
    int TotalTransactions,
    int LowStockCount,
    DateTime Date);