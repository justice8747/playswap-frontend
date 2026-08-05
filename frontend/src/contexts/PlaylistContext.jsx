import { createContext, useReducer } from 'react';

export const PlaylistContext = createContext();


export const playlistReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_PLAYLISTS_SUCCESS':
      return {
        ...state,
        playlists: action.payload.playlists,
        isLoading: false,
        error: null,
      };
    case 'FETCH_PLAYLISTS_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case 'CLEAR_PLAYLISTS':
      return {
        ...state,
        playlists: null,
        selectedPlaylists: [],
        isLoading: false,
        error: null,
      };

    case 'SELECT_PLAYLIST':
      return {
        ...state,
        selectedPlaylists: [...state.selectedPlaylists, action.payload.playlistId],
      };

    default:
      return state;
  }
};

export const PlaylistContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(playlistReducer, {
    playlists: null,
    selectedPlaylists: [],
    isLoading: false,
    error: null,
  });

  return (
    <PlaylistContext.Provider value={{ ...state, dispatch }}>{children}</PlaylistContext.Provider>
  );
};
