using Microsoft.AspNetCore.Mvc;
using MovieSearchCase.Domain.Interfaces.Services;
using MovieSearchCase.Shared;
using MovieSearchCase.WebApi.Mappers;

namespace MovieSearchCase.WebApi.Handlers.Movies;

public class GetMovieDetailsHandler : IRequestHandlerAsync
{
    private readonly IMovieService _movieService;
    private readonly int _id;

    public GetMovieDetailsHandler(IMovieService movieService, int id)
    {
        _movieService = movieService;
        _id = id;
    }

    public async Task<IActionResult> HandleAsync(HttpRequest request)
    {
        var movie = await _movieService.GetDetailsAsync(_id, request.HttpContext.RequestAborted);

        return new OkObjectResult(movie.ToApiModel());
    }
}
