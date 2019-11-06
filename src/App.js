import React from 'react';
import { TextField, InputAdornment, Snackbar, IconButton, Typography, Card, CardMedia, CardActionArea, CardContent, Drawer, Button, CardActions, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { Search, Close, NavigateNext, NavigateBefore, Favorite, Delete } from '@material-ui/icons';
import axios from "axios"
import './App.css';


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      apiURL: "https://gateway.marvel.com/v1/public/characters?ts=1565922410&apikey=6a038473ffd6407750a2ea27115f7e7c&hash=1492df65a88ef98a1a279719fe509f72&limit=3",
      snackBarOpen: false,
      snackBarMessage: 'Notification',
      DrawerOpen: false,
      characters: null,
      currentCharacter: null,
      offset: 0,
      total: 0,
      search: '',
      saved: [],
      savedDrawerOpen: false
    }
  }

  // Shows or hides notification
  toggleSnackBar = () => {
    if(this.state.snackBarOpen) {
      this.setState({ snackBarMessage: '' })
    }
    this.setState({ snackBarOpen: !this.state.snackBarOpen })
  }

  // Populates characters based on the provided URL
  fetchCharacters = (url) => {
    axios.get(url)
    .then((result) => {
      this.setState({ characters: result.data.data.results, total: result.data.data.total })
      console.log(this.state.characters)
    }).catch(() => {
      this.setState({snackBarMessage: 'Failed to connect to internet', snackBarOpen: true})
    })
  }

  // React lifecycle function
  componentDidMount() {
    // initially fetches all characters
    this.fetchCharacters(this.state.apiURL)

    // Populates favourites characters from local storage
    this.setState({ saved: localStorage.getItem('savedCharacters') ? JSON.parse(localStorage.getItem('savedCharacters')) : [] })
  }

  // Passes api url based on search string entered
  searchCharacters(text) {
    if(text){
      this.fetchCharacters(this.state.apiURL + "&offset=0&nameStartsWith=" + text)
      this.setState({ offset: 0 })
    } else {
      this.fetchCharacters(this.state.apiURL + "&offset=" + this.state.offset)
    }
  }

  // Pagination  > next page
  loadNext = () => {
    this.fetchCharacters(this.state.apiURL + "&offset=" + (this.state.offset + 3) + (this.state.search ? ("&nameStartsWith=" + this.state.search) : "" ))
    this.setState({ offset:  this.state.offset + 3})
  }

  // Pagination > previous page
  loadPrev = () => {
    this.fetchCharacters(this.state.apiURL + "&offset=" + (this.state.offset - 3) + (this.state.search ? ("&nameStartsWith=" + this.state.search) : "" ))
    this.setState({ offset:  this.state.offset - 3})
  }

  // Checks if a character is already under favourites 
  checkSaved = (id) => {
    if(this.state.saved.filter(charac => charac.id === id).length > 0 ){
      return true
    } else {
      return false
    }
  }

  // Saves a character to favourites (under browser local storage)
  saveCharacter = (data) => {
    let characters = this.state.saved;
    characters.push(data);
    localStorage.setItem('savedCharacters', JSON.stringify(characters))
    this.setState({ saved: characters })
  }

  // Removed a character from favourites (under browser local storage)
  deleteCharacter = (data) => {
    let characters = this.state.saved;
    const index = characters.findIndex((chars) => { return chars.id === data.id })
    characters.splice(index, 1)
    localStorage.setItem('savedCharacters', JSON.stringify(characters))
    this.setState({ saved: characters })
  }

  render() {
    if(!this.state.characters){
      return <p>Loading...</p>
    }
    return (
      <div className="App">
        {/**Begin Interface */}
        <div className="search-bar">
          <TextField
            placeholder="Enter character name"
            onChange={(event) => {
              this.setState({ search: event.target.value })
              this.searchCharacters(event.target.value)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            value={this.state.text}
          />
        </div>
        <div className="character-content">
          {
            this.state.characters.map((data, index) => {
              return(
                <Card className="character-card" key={index}>
                  <CardActionArea onClick={() => { this.setState({ DrawerOpen: true, currentCharacter: data }) }}>
                    <CardMedia
                      className="character-card-img"
                      image={ data.thumbnail.path + "/standard_fantastic." + data.thumbnail.extension }
                      title={ data.name }
                    >
                    </CardMedia>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        { data.name }
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    {
                      this.checkSaved(data.id) ? 
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={() => this.deleteCharacter(data)}
                      >
                        Remove from&nbsp;<Favorite />
                      </Button> : 
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => this.saveCharacter(data)}
                      >
                        Add to&nbsp;<Favorite />
                      </Button>
                    }
                  </CardActions>
                </Card>
              )
            })
          }
        </div>
        <div className="pagination">
          <Button variant="contained" color="primary" className="prev-btn" startIcon={<NavigateBefore />} onClick={this.loadPrev} disabled={this.state.offset === 0}>
            Prev
          </Button>
          <Button variant="contained" color="primary" endIcon={<NavigateNext />} onClick={this.loadNext} disabled={this.state.total <= ( this.state.offset + 3 )}>
            Next
          </Button>
        </div>
        <Button variant="contained" color="primary" startIcon={<Favorite />} onClick={() => this.setState({savedDrawerOpen: true})}>
          View Favourites
        </Button>
        {/**End Interface */}

        {/* Drawer to view favourite characters*/}
        <Drawer anchor="right" open={this.state.savedDrawerOpen} onClose={() => { this.setState({ savedDrawerOpen: false }) }}>
          <List className="list">
            {
              this.state.saved.map((data, index) => {
                return (
                  <ListItem button key={index} className="list-item">
                    <ListItemAvatar>
                      <img src={data.thumbnail.path + "." + data.thumbnail.extension} alt={data.name + " image"} className="fav-image"/>
                    </ListItemAvatar>
                    <ListItemText primary={data.name} className="list-title"/>
                    <ListItemSecondaryAction  className="list">
                      <Delete color="secondary" onClick={() => this.deleteCharacter(data)}/>
                    </ListItemSecondaryAction>
                  </ListItem>
                )
              })
            }
          </List>
        </Drawer>

        {/* Drawer to view current character details*/}
        <Drawer open={this.state.DrawerOpen} onClose={() => { this.setState({ DrawerOpen: false, currentCharacter: null}) }}>
          {
            this.state.currentCharacter && 
            <div className="single-character-content">
              <img src={this.state.currentCharacter.thumbnail.path + "." + this.state.currentCharacter.thumbnail.extension} alt={this.state.currentCharacter.name + " image"} />
              <IconButton
                key="close"
                aria-label="close"
                color="inherit"
                className="top-right-button"
                onClick={() => { this.setState({ DrawerOpen: false, currentCharacter: null}) }}
              >
                <Close />
              </IconButton>
              <div className="description">
                <Typography gutterBottom variant="h5" component="h5">
                  { this.state.currentCharacter.name }
                </Typography>
                {
                  this.state.currentCharacter.description && 
                  <Typography gutterBottom variant="h6" component="h6">
                    DESCRIPTION
                  </Typography>
                }
                <p align="justify">
                  { this.state.currentCharacter.description }
                </p>
                {
                  this.state.currentCharacter.urls && (
                  <div>
                    <Typography gutterBottom variant="h6" component="h6">
                      LINKS
                    </Typography>
                    <ul>
                      {
                        this.state.currentCharacter.urls.map((data, index) => {
                          return (
                            <li key={index}>
                              <a href={data.url} target="_blank" rel="noopener noreferrer">{data.type}</a>
                            </li>
                          )
                        })
                      }
                    </ul>
                  </div>
                  )
                }
              </div>
            </div>
          }
        </Drawer>

        {/* Snackbar for notifications*/}
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.snackBarOpen}
          autoHideDuration={2000}
          message={<span>{ this.state.snackBarMessage }</span>}
          action={[
            <IconButton
              key="close"
              aria-label="close"
              color="inherit"
              onClick={this.toggleSnackBar}
            >
              <Close />
            </IconButton>,
          ]}
        />
      </div>
    );
  }

}

export default App;
