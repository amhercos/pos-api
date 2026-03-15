using Application.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pos_webapi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController (IMediator mediator) : ControllerBase
    {
        
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }


        [HttpPost("register-storeowner")]
        public async Task<IActionResult> RegisterMerchant([FromBody] RegisterStoreOwnerCommand command)
        {
            var result = await mediator.Send(command);

            if (result)
            {
                return Ok(new { message = "Store and Owner registered successfully." });
            }

            return BadRequest(new { message = "Registration failed." });
        }


        [Authorize(Roles = "StoreOwner")]
        [HttpPost("add-staff")]
        public async Task<IActionResult> AddStaff([FromBody] AddStaffCommand command)
        {
            var result = await mediator.Send(command);
            if (result) return Ok(new { message = "Staff added successfully." });

            return BadRequest("Could not add staff.");
        }
    }


}
