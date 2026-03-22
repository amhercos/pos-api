using Application.Dto;
using Application.Features.Transactions.Commands;
using Application.Features.Transactions.Queries;
using Application.Interfaces;
using Infrastructure.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pos_webapi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController(IMediator mediator, ICurrentUserService currentUserService) : ControllerBase
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

        var result = await mediator.Send(new GetTransactionByIdQuery(id));

        if (result == null)
            return NotFound(new { Message = "Transaction record not found." });

        return Ok(result);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<DailySummaryDto>> GetDailySummary()
    {
        var summary = await mediator.Send(new GetDailySummaryQuery());

        return Ok(summary);
    }

    [HttpGet("recent")]
    public async Task<ActionResult<List<RecentTransactionDto>>> GetRecent(
    [FromQuery] int page = 1,
    [FromQuery] int count = 3)
    { 

        var query = new GetRecentTransactionsQuery(currentUserService.StoreId, page, count);
        var result = await mediator.Send(query);
        return Ok(result);
    }
}