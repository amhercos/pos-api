using Application.Dto;
using Application.Features.Staff.Commands;
using Application.Features.Staff.Queries;
using MediatR;  
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pos_webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController (IMediator mediator): ControllerBase
    {
        [Authorize(Roles = "StoreOwner")]
        [HttpGet("my-staff")]
        public async Task<ActionResult<IEnumerable<StaffDto>>> GetMyStaff()
        {
            return Ok(await mediator.Send(new GetStaffQuery()));
        }

        [Authorize(Roles = "StoreOwner")]
        [HttpDelete("delete-staff/{id}")]
        public async Task<IActionResult> DeleteStaff(Guid Id)
        {
            var result = await mediator.Send(new DeleteStaffCommand(Id));

            if (result) return Ok(new { message = "Staff deleted successfully." });

            return BadRequest("Could not delete staff or unauthorized access.");
        }
    }
}
