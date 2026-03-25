using Application.Interfaces;
using Application.Interfaces.Repositories;
using MediatR;

namespace Application.Features.Categories.Commands
{
    public class DeleteCategoriesHandler(
        ICategoryRepository categoryRepository,
        IPosDbContext context) : IRequestHandler<DeleteCategoryCommand, bool>
    {
        public async Task<bool> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await categoryRepository.GetByIdAsync(request.Id, cancellationToken);
            if (category == null) return false;
            try
            {
               categoryRepository.Remove(category);
                await context.SaveChangesAsync(cancellationToken);
                return true; 
            }
            catch
            {
                throw new InvalidOperationException("Failed to delete category");
            }
            

        }
    }
}
