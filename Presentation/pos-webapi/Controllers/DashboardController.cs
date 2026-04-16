using Application.Features.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(IMediator mediator) : ControllerBase
{
    [HttpGet("top-selling")]
    public async Task<IActionResult> GetTopSelling([FromQuery] int count = 3, CancellationToken ct = default)
    {
        var result = await mediator.Send(new GetTopSellingProductsQuery(count), ct);
        return Ok(result);
    }
}