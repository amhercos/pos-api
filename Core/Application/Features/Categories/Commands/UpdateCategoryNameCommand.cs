using MediatR;

namespace Application.Features.Categories.Commands
{
    public record UpdateCategoryNameCommand(Guid Id, string NewCategoryName) : IRequest<bool>;
    public record UpdateCategoryNameRequest(string NewCategoryName);
}

