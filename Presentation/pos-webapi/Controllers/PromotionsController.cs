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
    public async Task<IActionResult> Create([FromBody] CreatePromotionCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok();
    }

    [HttpPut("{mainProductId}")]
    public async Task<IActionResult> Update(Guid mainProductId, UpdatePromotionCommand command, CancellationToken ct)
    {
        if (mainProductId != command.MainProductId) return BadRequest();

        await _mediator.Send(command, ct);
        return Ok();
    }

    [HttpDelete("{mainProductId}")]
    public async Task<IActionResult> Delete(Guid mainProductId, CancellationToken ct)
        => Ok(await _mediator.Send(new DeletePromotionCommand(mainProductId), ct));

    [HttpPatch("{mainProductId}/toggle")]
    public async Task<IActionResult> Toggle(Guid mainProductId, CancellationToken ct)
        => Ok(await _mediator.Send(new TogglePromotionCommand(mainProductId), ct));
}