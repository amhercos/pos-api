using Application.Dto;
using Application.Interfaces.Repositories;
using MediatR;


namespace Application.Features.Store.Queries
{
    public class GetStoreSettingsHandler(IStoreRepository storeRepository) : IRequestHandler<GetStoreSettingsQuery, StoreSettingsResponseDto?>
    {
        public async Task<StoreSettingsResponseDto?> Handle(GetStoreSettingsQuery request, CancellationToken ct)
        {
            var store = await storeRepository.GetStoreWithSettingsAsync(request.StoreId, ct);
            if (store == null) return null;

            return new StoreSettingsResponseDto(
                store.StoreName,
                store.Location,
                store.Settings?.LowStockAlertThreshold ?? 5,
                store.Settings?.NearExpiryAlertDays ?? 30
            );
        }
    }
}
