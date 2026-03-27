using Application.Dto;
using MediatR;
namespace Application.Features.Store.Command
{
    public record UpdateStoreCommand(Guid StoreId, UpdateStoreSettingsDto Dto) : IRequest<bool>;
}
