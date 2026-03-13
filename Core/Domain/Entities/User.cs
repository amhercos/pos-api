using Domain.Entities.Common;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string Role { get; set; }
        public Guid StoreId { get; set; }
        public Store Store { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
