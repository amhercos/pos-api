using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces
{
    public interface ITenantConnectionStringBuilder
    {
      
        string Build(string businessName);
    }
}
