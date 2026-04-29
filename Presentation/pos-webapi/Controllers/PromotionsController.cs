using Application.Features.Promotions.Commands;
using Application.Features.Promotions.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "StoreOwner")]
public class PromotionsController : ControllerBase
{
    private readonly IMediator _mediator;
    public PromotionsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
        => Ok(await _mediator.Send(new GetPromotionsQuery(), ct));

    [HttpGet("calculate")]
    public async Task<IActionResult> CalculatePrice([FromQuery] Guid productId, [FromQuery] int quantity, CancellationToken ct)
        => Ok(await _mediator.Send(new GetCalculatedPriceQuery(productId, quantity), ct));

    [HttpPost]
    public async Task<IActionResult> Create(CreatePromotionCommand command, CancellationToken ct)
        => Ok(await _mediator.Send(command, ct));

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdatePromotionCommand command, CancellationToken ct)
    {
        if (id != command.Id) return BadRequest();
        return Ok(await _mediator.Send(command, ct));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        => Ok(await _mediator.Send(new DeletePromotionCommand(id), ct));

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> Toggle(Guid id, CancellationToken ct)
    => Ok(await _mediator.Send(new TogglePromotionCommand(id), ct));
}