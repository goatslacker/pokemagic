module.exports = {
  main: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },

  container: {
    flex: 9,
    margin: '0 auto',
    overflowY: 'scroll',
  },

  resultsRow: {
    textAlign: 'center',
  },

  pokemonImage: {
    alignItems: 'center',
    display: 'flex',
    height: 150,
    margin: '-16px auto',
    justifyContent: 'center',
    width: 150,
  },

  bigText: {
    fontSize: '1.5em',
    fontWeight: 'bold',
  },

  menu: {
    alignItems: 'center',
    backgroundColor: '#6297de',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-around',
  },

  link: {
    color: '#fff',
  },

  activeLink: {
    color: '#f0d827',
  },
}
