using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Store.Command
{
    public class UpdateStoreHandler(
        IStoreRepository storeRepository,
        IStoreSettingsRepository settingsRepository)
        : IRequestHandler<UpdateStoreCommand, bool>
    {
        public async Task<bool> Handle(UpdateStoreCommand request, CancellationToken ct)
        {
            var store = await storeRepository.GetByIdAsync(request.StoreId, ct);
            if (store == null) return false;

            store.StoreName = request.Dto.StoreName;
            store.Location = request.Dto.Location;

            await storeRepository.UpdateAsync(store, ct);

            var settings = await settingsRepository.GetByStoreIdAsync(request.StoreId, ct);

            if (settings == null)
            {
                settings = new StoreSettings
                {
                    Id = Guid.NewGuid(),
                    StoreId = request.StoreId,
                    LowStockAlertThreshold = request.Dto.LowStockThreshold,
                    NearExpiryAlertDays = request.Dto.NearExpiryAlertDays,
                    UpdatedAt = DateTime.UtcNow
                };
            }
            else
            { 
                settings.LowStockAlertThreshold = request.Dto.LowStockThreshold;
                settings.NearExpiryAlertDays = request.Dto.NearExpiryAlertDays;
                settings.UpdatedAt = DateTime.UtcNow;
            }

            await settingsRepository.UpdateAsync(settings, ct);

            return true;
        }
    }
}