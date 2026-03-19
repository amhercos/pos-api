using Application.Dto;
using Application.Features.CustomerCredits.Commands;
using Application.Features.CustomerCredits.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerCreditsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<CustomerCreditDto>>> GetAll()
    {
        return Ok(await mediator.Send(new GetCustomerCreditsQuery()));
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<CustomerCreditDto>>> Search([FromQuery] string name)
    {
        return Ok(await mediator.Send(new SearchCustomerCreditQuery(name)));
    }

    [HttpPost("pay")]
    public async Task<IActionResult> RecordPayment(RecordCreditPaymentCommand command)
    {
        await mediator.Send(command);
        return NoContent();
    }


    [HttpGet("{id}/summary")]
    public async Task<ActionResult<CustomerCreditSummaryDto>> GetSummary(Guid id)
    {
        var result = await mediator.Send(new GetCustomerCreditSummaryQuery(id));
        return Ok(result);
    }
}