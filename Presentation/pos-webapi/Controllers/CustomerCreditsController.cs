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
    public async Task<ActionResult<List<CustomerCreditDto>>> GetAll([FromQuery] bool includeSettled = false)
    {
        return Ok(await mediator.Send(new GetCustomerCreditsQuery(includeSettled)));
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<CustomerCreditDto>>> Search([FromQuery] string name)
    {
        return Ok(await mediator.Send(new SearchCustomerCreditQuery(name)));
    }

    [HttpPost("pay")]
    public async Task<IActionResult> RecordPayment([FromBody] RecordCreditPaymentCommand command)
    {
        try
        {
            var result = await mediator.Send(command);
            return Ok(new { Message = "Payment recorded successfully", PaymentId = result });
        }
        catch (Exception ex) when (ex.Message.Contains("exceeds"))
        {
            return BadRequest(new { Error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Error = "An unexpected error occurred." });
        }
    }


    [HttpGet("{id}/summary")]
    public async Task<ActionResult<CustomerCreditSummaryDto>> GetSummary(Guid id)
    {
        var result = await mediator.Send(new GetCustomerCreditSummaryQuery(id));
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerCreditCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch between URL and body.");

        await mediator.Send(command);
        return NoContent();
    }
}