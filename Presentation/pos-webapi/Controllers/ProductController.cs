using Application.Features.Products.Commands;
using Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace pos_webapi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController(IMediator mediator) : ControllerBase
    {
        [Authorize (Roles = "StoreOwner" )]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpGet]
        [Authorize (Roles = "StoreOwner,Cashier")]
        public async Task<IActionResult> GetAll()
        {
            var products = await mediator.Send(new GetProductQuery());
            return Ok(products);
        }

        ///// <summary>
        ///// Gets a specific product by ID.
        ///// </summary>
        //[HttpGet("{id}")]
        //public async Task<IActionResult> GetById(Guid id)
        //{
        //    var product = await mediator.Send(new GetProductByIdQuery(id));

        //    if (product == null) return NotFound();

        //    return Ok(product);
        //}

        ///// <summary>
        ///// Deletes a product from the inventory.
        ///// </summary>
        //[HttpDelete("{id}")]
        //[Authorize(Roles = "StoreOwner")]
        //public async Task<IActionResult> Delete(Guid id)
        //{
        //    var result = await mediator.Send(new DeleteProductCommand(id));

        //    if (!result) return NotFound();

        //    return NoContent();
        //}
    }
}
