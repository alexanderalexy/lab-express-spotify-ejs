require('dotenv').config()

const express = require('express')
const expressLayouts = require('express-ejs-layouts')

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node')



const app = express()

app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  })
  
  // Retrieve an access token
  spotifyApi
  .clientCredentialsGrant()
  .then(data => {
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Ready');
  })
  .catch(error => console.log('Something went wrong when retrieving an access token', error));


    

// Our routes go here:


app.get('/', (req, res) => {
    res.render('index')

})

// Route for artist search

app.get('/artist-search', (req, res) => {
  const searchTerm = req.query.searchTerm; // Searchterm from Query-String-Parameter

  spotifyApi
    .searchArtists(searchTerm) // Search for artists
    .then(data => {
      const artists = data.body.artists.items.map(artist => {
        return {
          name: artist.name,
          image: artist.images.length > 0 ? artist.images[0].url : null
        };
      });

      // Data to Ejs and rendering
      res.render('artist-search-results', { artists });
    })
    .catch(err => console.log('Error at artist-search: ', err));
});



// Route for albums
app.get('/albums/:artistId', (req, res, next) => {
  const artistId = req.params.artistId; // Artist-ID from URL

  spotifyApi
    .getArtistAlbums(artistId) // Get albums from artist
    .then(data => {
      console.log('The received data from API: ', data.body);
      // Data to Ejs and rendering
      res.render('albums', { albums: data.body.items });
    })
    .catch(err => console.log('Error at album-search: ', err));
});



// Route für die Trackansicht
app.get('/tracks/:albumId', (req, res, next) => {
  const albumId = req.params.albumId; // Album-ID from URL

  spotifyApi
    .getAlbumTracks(albumId) // Get album tracks
    .then(data => {
      console.log('The received data from API: ', data.body);
      // Data to Ejs and rendering
      res.render('tracks', { tracks: data.body.items });
    })
    .catch(err => console.log('Error with tracks: ', err));
});



app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'))
