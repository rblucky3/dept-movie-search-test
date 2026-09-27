using MovieSearchCase.Domain.Entities;

namespace MovieSearchCase.Domain.Interfaces.Clients;

/// <summary>
/// Talks to The Movie Database (TMDB) REST API. See https://developer.themoviedb.org/reference.
/// </summary>
public interface ITmdbClient
{
    /// <summary>
    /// Returns this week's trending movies (TMDB's /trending/movie/week endpoint).
    /// </summary>
    Task<IReadOnlyList<Movie>> GetTrendingMoviesAsync(CancellationToken cancellationToken);

     /// <summary>
    /// Searches movies by title (TMDB's /search/movie endpoint).
    /// </summary>
    Task<PagedResults<Movie>> SearchMoviesAsync(string query, int page, CancellationToken cancellationToken);

    /// <summary>
    /// Returns a single movie with its trailer (TMDB's /movie/{id} endpoint with appended videos).
    /// </summary>
    Task<MovieDetail> GetMovieDetailsAsync(int id, CancellationToken cancellationToken);


}
