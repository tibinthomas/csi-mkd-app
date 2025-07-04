using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System.Text.Json;
using csi_mkd_premarital_app_BE.Models;


public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var context = eventData.Context;

        if (context == null) return base.SavingChangesAsync(eventData, result, cancellationToken);

        var auditEntries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is AuditEntry || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry
            {
                TableName = entry.Metadata.GetTableName() ?? entry.Entity.GetType().Name,
                Timestamp = DateTime.UtcNow,
                ActionType = entry.State.ToString(),
                KeyValues = JsonSerializer.Serialize(GetKeyValues(entry)),
                UserId = null, // Populate this if you have a logged-in user context
            };

            if (entry.State == EntityState.Modified)
            {
                auditEntry.OldValues = JsonSerializer.Serialize(entry.OriginalValues.Properties.ToDictionary(p => p.Name, p => entry.OriginalValues[p]));
                auditEntry.NewValues = JsonSerializer.Serialize(entry.CurrentValues.Properties.ToDictionary(p => p.Name, p => entry.CurrentValues[p]));
            }
            else if (entry.State == EntityState.Added)
            {
                auditEntry.NewValues = JsonSerializer.Serialize(entry.CurrentValues.Properties.ToDictionary(p => p.Name, p => entry.CurrentValues[p]));
            }
            else if (entry.State == EntityState.Deleted)
            {
                auditEntry.OldValues = JsonSerializer.Serialize(entry.OriginalValues.Properties.ToDictionary(p => p.Name, p => entry.OriginalValues[p]));
            }

            auditEntries.Add(auditEntry);
        }

        if (auditEntries.Any())
        {
            context.AddRange(auditEntries);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private Dictionary<string, object?> GetKeyValues(EntityEntry entry)
    {
        return entry.Properties
            .Where(p => p.Metadata.IsPrimaryKey())
            .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue);
    }
}
