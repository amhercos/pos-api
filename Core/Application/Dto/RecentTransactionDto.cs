namespace Application.Dto;

public record RecentTransactionDto(
    Guid Id,
    DateTime TransactionDate,
    decimal TotalAmount,
    string PaymentType,
    int ItemCount);