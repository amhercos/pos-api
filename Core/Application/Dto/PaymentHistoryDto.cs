

namespace Application.Dto
{
    public record PaymentHistoryDto(
    Guid Id,
    decimal Amount,
    DateTime PaymentDate
);
}
