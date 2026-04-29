using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace Application.Features.Store.Queries
{
    public class GetStoreSettingsHandler(
        IStoreRepository storeRepository,
        IStoreSettingsRepository settingsRepository)
        : IRequestHandler<GetStoreSettingsQuery, StoreSettingsResponseDto?>
    {
        public async Task<StoreSettingsResponseDto?> Handle(GetStoreSettingsQuery request, CancellationToken ct)
        {
            var store = await storeRepository.GetByIdAsync(request.StoreId, ct);
            if (store == null) return null;

            var settings = await settingsRepository.GetByStoreIdAsync(request.StoreId, ct);

            return new StoreSettingsResponseDto(
                store.StoreName,
                store.Location,
                settings?.LowStockAlertThreshold ?? 5,
                settings?.NearExpiryAlertDays ?? 30
            );
        }
    }
}