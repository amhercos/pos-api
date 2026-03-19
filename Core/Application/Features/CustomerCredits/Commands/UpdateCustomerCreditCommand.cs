using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.CustomerCredits.Commands
{
    public record UpdateCustomerCreditCommand : IRequest<Unit>
    {
        public Guid Id { get; init; }
        public string CustomerName { get; init; } = string.Empty;
        public string? ContactInfo { get; init; }
    }
}
