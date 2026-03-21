using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Dto
{
    public record CurrentUserResponse(
        string UserName,
        string FullName,
        string Role,
        Guid? StoreId
    );
}
