using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using MovieSearchCase.Domain.Entities;
using MovieSearchCase.Domain.Interfaces.Services;
using MovieSearchCase.WebApi.Handlers.Movies;
using Xunit;
using ApiMovieDetails = MovieSearchCase.WebApi.Models.Movies.MovieDetail;

namespace MovieSearchCase.WebApi.Tests.Handlers;

public class GetMovieDetailsHandlerTests
{
    [Fact]
    public async Task HandleShouldReturnOkWithMappedDetailsWhenServiceSucceeds()
    {
        var details = new MovieDetail
        {
            Id = 603,
            Title = "The Matrix",
            VoteAverage = 8.2,
            Runtime = 136,
            Genres = ["Action", "Science Fiction"],
            TrailerYouTubeKey = "vKQi3bBA1y8",
        };

        var movieServiceMock = new Mock<IMovieService>();
        movieServiceMock
            .Setup(service => service.GetDetailsAsync(603, It.IsAny<CancellationToken>()))
            .ReturnsAsync(details);

        var handler = new GetMovieDetailsHandler(movieServiceMock.Object, 603);

        var result = await handler.HandleAsync(new DefaultHttpContext().Request);

        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        var movie = okResult.Value.Should().BeOfType<ApiMovieDetails>().Subject;
        movie.Title.Should().Be("The Matrix");
        movie.Runtime.Should().Be(136);
        movie.Genres.Should().Equal("Action", "Science Fiction");
        movie.YouTubeTrailerKey.Should().Be("vKQi3bBA1y8");
    }
}
