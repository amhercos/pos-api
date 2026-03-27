using Application.Dto;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Store.Queries
{
    public record GetStoreSettingsQuery(Guid StoreId) : IRequest<StoreSettingsResponseDto?>;
}
