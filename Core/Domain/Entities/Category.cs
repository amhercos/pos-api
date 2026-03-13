using Domain.Entities.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Entities
{
    public class Category : BaseEntity
    {
        [Required]
        public string CategoryName { get; set; }
    }
}
