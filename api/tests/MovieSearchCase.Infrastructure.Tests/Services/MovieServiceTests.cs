using FluentAssertions;
using Moq;
using MovieSearchCase.Domain.Entities;
using MovieSearchCase.Domain.Interfaces.Clients;
using MovieSearchCase.Infrastructure.Services;
using Xunit;

namespace MovieSearchCase.Infrastructure.Tests.Services;

public class MovieServiceTests
{
    [Fact]
    public async Task GetTrendingAsyncShouldReturnMoviesFromTmdbClient()
    {
        var expectedMovies = new List<Movie>
        {
            new()
            {
                Id = 42,
                Title = "The Answer",
                VoteAverage = 9.2,
            },
        };

        var tmdbClientMock = new Mock<ITmdbClient>();
        tmdbClientMock
            .Setup(client => client.GetTrendingMoviesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedMovies);

        var movieService = new MovieService(tmdbClientMock.Object);

        var result = await movieService.GetTrendingAsync(CancellationToken.None);

        result.Should().BeEquivalentTo(expectedMovies);
    }

        [Fact]
    public async Task SearchAsyncShouldTrimQueryAndReturnResultFromTmdbClient()
    {
        var expectedResult = new PagedResults<Movie>
        {
            Results = [new Movie { Id = 603, Title = "The Matrix" }],
            Page = 1,
            TotalPages = 1,
            TotalResults = 1,
        };

        var tmdbClientMock = new Mock<ITmdbClient>();
        tmdbClientMock
            .Setup(client => client.SearchMoviesAsync("matrix", 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedResult);

        var movieService = new MovieService(tmdbClientMock.Object);

        var result = await movieService.SearchAsync("  matrix ", 1, CancellationToken.None);

        result.Should().BeSameAs(expectedResult);
    }
}
