using Application.Dto;
using Application.Features.Categories.Commands;
using Application.Features.Categories.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pos_webapi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoriesController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryCommand command)
    {
        return Ok(await mediator.Send(command));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> Get()
    {
        return Ok(await mediator.Send(new GetCategoriesQuery()));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await mediator.Send(new DeleteCategoryCommand(id));

        if (!result)
        {
            return NotFound(new { message = "Category not found or you do not have permission." });
        }

        return NoContent();
    }


    [HttpPut("{id}/name")]
    [Authorize(Roles = "StoreOwner")]
    public async Task<IActionResult> UpdateName(Guid id, [FromBody] UpdateCategoryNameRequest request)
    {
        var command = new UpdateCategoryNameCommand(id, request.NewCategoryName);

        var result = await mediator.Send(command);
        return result ? Ok() : NotFound();
    }


}