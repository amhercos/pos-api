using Application.Features.Transactions.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pos_webapi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController(IMediator mediator) : ControllerBase
{
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CreateTransactionCommand command)
    {
        try
        {
            var transactionId = await mediator.Send(command);
            return Ok(new
            {
                TransactionId = transactionId,
                Message = "Transaction completed successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

   
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {

        //var result = await mediator.Send(new GetTransactionByIdQuery(id));
        //return Ok(result);
        return Ok();
    }
}