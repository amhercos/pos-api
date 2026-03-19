

namespace Application.Dto
{
    public record CustomerCreditSummaryDto(
    Guid CustomerId,
    string CustomerName,
    string? ContactInfo,
    decimal TotalDebt,
    List<RecentTransactionDto> CreditPurchases, 
    List<PaymentHistoryDto> PaymentHistory
);
}
