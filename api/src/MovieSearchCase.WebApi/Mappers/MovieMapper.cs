using MovieSearchCase.Domain.Entities;
using MovieSearchCase.WebApi.Models;

namespace MovieSearchCase.WebApi.Mappers;


internal static class MovieMapper
{
    public static Models.Movies.Movie ToApiModel(this Domain.Entities.Movie movie) => new()
    {
        Id = movie.Id,
        Title = movie.Title,
        Overview = movie.Overview,
        PosterPath = movie.PosterPath,
        BackdropPath = movie.BackdropPath,
        VoteAverage = movie.VoteAverage,
        ReleaseDate = movie.ReleaseDate,
    };

    public static PagedResponse<Models.Movies.Movie> ToApiModel(this PagedResults<Domain.Entities.Movie> result) => new()
    {
        Results = result.Results.Select(ToApiModel).ToList(),
        Page = result.Page,
        TotalPages = result.TotalPages,
        TotalResults = result.TotalResults,
    };
}
