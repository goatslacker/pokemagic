module.exports = {
  main: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },

  mainDesktop: {
    display: 'flex',
    height: '100%',
    flexDirection: 'row',
  },

  container: {
    flex: 9,
    overflowY: 'scroll',
    WebkitOverflowScrolling: 'touch',
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
    alignItems: 'stretch',
    backgroundColor: '#6297de',
    borderTop: '1px solid #b3b3b3',
    boxShadow: '0 -1px 16px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flex: 1,
    justifyContent: 'space-around',
    zIndex: 2,
  },

  menuDesktop: {
    alignItems: 'stretch',
    backgroundColor: '#6297de',
    borderTop: '1px solid #b3b3b3',
    boxShadow: '0 -1px 16px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    zIndex: 2,
  },

  linkWrapper: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  link: {
    alignItems: 'center',
    color: '#fff',
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
  },

  activeLink: {
    color: '#f0d827',
  },

  good: {
    backgroundColor: '#67ba72',
  },

  ok: {
    backgroundColor: '#ffdd69',
  },

  bad: {
    backgroundColor: '#ff7772',
  },
}
