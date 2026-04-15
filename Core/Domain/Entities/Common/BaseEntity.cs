using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Domain.Entities.Common
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; }
        [Timestamp]

        public uint RowVersion { get; set; }
    }
}
