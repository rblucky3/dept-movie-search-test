using Microsoft.AspNetCore.Mvc;
using MovieSearchCase.Domain.Exceptions;
using MovieSearchCase.Domain.Interfaces.Services;
using MovieSearchCase.Shared;
using MovieSearchCase.WebApi.Mappers;

namespace MovieSearchCase.WebApi.Handlers.Movies;

public class SearchMoviesHandler : IRequestHandlerAsync
{
    /// <summary>
    /// TMDB rejects any page above 500.
    /// </summary>
    public const int MaxPage = 500;

    public const int MaxQueryLength = 100;

    private readonly IMovieService _movieService;
    private readonly string _query;
    private readonly int _page;

    public SearchMoviesHandler(IMovieService movieService, string query, int page)
    {
        _movieService = movieService;
        _query = query;
        _page = page;
    }

    public async Task<IActionResult> HandleAsync(HttpRequest request)
    {
        if (string.IsNullOrWhiteSpace(_query))
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.InvalidRequest,
                "The 'query' parameter is required.");
        }

        if (_query.Length > MaxQueryLength)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.InvalidRequest,
                $"The 'query' parameter must be at most {MaxQueryLength} characters.");
        }

        if (_page is < 1 or > MaxPage)
        {
            throw new MovieException(
                MovieException.ExceptionTitle,
                ErrorType.InvalidRequest,
                $"The 'page' parameter must be between 1 and {MaxPage}.");
        }

        var result = await _movieService.SearchAsync(_query, _page, request.HttpContext.RequestAborted);

        return new OkObjectResult(result.ToApiModel());
    }
}
