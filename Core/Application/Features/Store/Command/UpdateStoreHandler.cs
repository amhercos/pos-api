using Application.Interfaces;
using Application.Interfaces.Repositories;
using Domain.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Store.Command
    {
        public class UpdateStoreHandler(IStoreRepository storeRepository) : IRequestHandler<UpdateStoreCommand, bool>
        {
            public async Task<bool> Handle(UpdateStoreCommand request, CancellationToken cancellationToken)
            {
                var store = await storeRepository.GetStoreWithSettingsAsync(request.StoreId, cancellationToken);
                if (store == null) return false;

                store.StoreName = request.Dto.StoreName;
                store.Location = request.Dto.Location;

                if (store.Settings == null)
                {
                    store.Settings = new StoreSettings
                    {
                        StoreId = store.Id,
                        LowStockAlertThreshold = request.Dto.LowStockThreshold,
                        NearExpiryAlertDays = request.Dto.NearExpiryAlertDays,
                        UpdatedAt = DateTime.UtcNow
                    };
                }
                else
                {
                    store.Settings.LowStockAlertThreshold = request.Dto.LowStockThreshold;
                    store.Settings.NearExpiryAlertDays = request.Dto.NearExpiryAlertDays;
                    store.Settings.UpdatedAt = DateTime.UtcNow;
                }

                await storeRepository.UpdateAsync(store, cancellationToken);
                return true;
            }
        }
    }

