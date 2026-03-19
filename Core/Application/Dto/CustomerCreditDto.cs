using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Dto
{
    public record CustomerCreditDto(
        Guid Id, 
        string CustomerName, 
        string? ContactInfo, 
        decimal CreditAmount);
}
