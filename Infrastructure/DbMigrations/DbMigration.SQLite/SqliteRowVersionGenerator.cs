using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.ValueGeneration;

public class SqliteRowVersionGenerator : ValueGenerator<byte[]>
{
    public override bool GeneratesTemporaryValues => false;

    public override byte[] Next(EntityEntry entry)
    {
        return Guid.NewGuid().ToByteArray();
    }
}