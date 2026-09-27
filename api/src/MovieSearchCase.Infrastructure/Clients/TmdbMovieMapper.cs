using System.Globalization;
using MovieSearchCase.Domain.Entities;

namespace MovieSearchCase.Infrastructure.Clients;

internal static class TmdbMovieMapper
{
      /// <summary>
    /// TMDB rejects any page above 500, regardless of what total_pages reports.
    /// </summary>
    public const int MaxPage = 500;
    
    public static Movie ToDomainModel(this TmdbMovie tmdbMovie) => new()
    {
        Id = tmdbMovie.Id,
        Title = tmdbMovie.Title,
        Overview = tmdbMovie.Overview,
        PosterPath = tmdbMovie.PosterPath,
        BackdropPath = tmdbMovie.BackdropPath,
        VoteAverage = tmdbMovie.VoteAverage,
        ReleaseDate = DateOnly.TryParseExact(
            tmdbMovie.ReleaseDate,
            "yyyy-MM-dd",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var releaseDate)
            ? releaseDate
            : null,
    };

    public static PagedResults<Movie> ToDomainModel(this TmdbPagedResponse<TmdbMovie> response) => new()
    {
        Results = response.Results.Select(ToDomainModel).ToList(),
        Page = response.Page,
        TotalPages = Math.Min(response.TotalPages, MaxPage),
        TotalResults = response.TotalResults,
    };

}
