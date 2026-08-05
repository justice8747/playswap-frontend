import { createContext, useReducer } from 'react';

export const ConnectionContext = createContext();

// util functions

const initialState = {
  isSourceModalOpen: false,
  isLoading: true,
  connections: {
    isSpotifyConnected: false,
    isYoutubeConnected: false,
  },
  userProfiles: {
    spotifyProfile: null,
    youtubeProfile: null,
  },
};

export const ACTIONS = {
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  CONNECT_SERVICE: 'CONNECT_SERVICE',
  DISCONNECT_SERVICE: 'DISCONNECT_SERVICE',
  SET_SOURCE: 'SET_SOURCE',
};

export const connectionReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.TOGGLE_MODAL:
      return { ...state, isSourceModalOpen: action.payload };

    case ACTIONS.CONNECT_SERVICE: {
      const { service, profile } = action.payload; // service is 'spotify' or 'ytmusic' / 'youtube'

      // Map the generic service string to your specific state keys
      const connectionKey = service === 'spotify' ? 'isSpotifyConnected' : 'isYoutubeConnected';
      const profileKey = service === 'spotify' ? 'spotifyProfile' : 'youtubeProfile';

      const isConnected = !!(profile && profile.connected);

      return {
        ...state,
        connections: {
          ...state.connections,
          [connectionKey]: isConnected,
        },
        userProfiles: {
          ...state.userProfiles,
          [profileKey]: isConnected ? profile : null,
        },
      };
    }

    case ACTIONS.DISCONNECT_SERVICE: {
      const { service } = action.payload;

      const connectionKey = service === 'spotify' ? 'isSpotifyConnected' : 'isYoutubeConnected';
      const profileKey = service === 'spotify' ? 'spotifyProfile' : 'youtubeProfile';

      return {
        ...state,
        connections: {
          ...state.connections,
          [connectionKey]: false,
        },
        userProfiles: {
          ...state.userProfiles,
          [profileKey]: null,
        },
      };
    }

    // case ACTIONS.SET_SOURCE:
    //   return {
    //     ...state,
    //     isSourceModalOpen: false,
    //     transferSession: {
    //       ...state.transferSession,
    //       source: action.payload,
    //       destination: action.payload === 'spotify' ? 'youtube' : 'spotify',
    //       selectedPlaylistIds: [],
    //     },
    //   };

    default:
      return state;
  }
};

export const ConnectionContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(connectionReducer, initialState);

  return (
    <ConnectionContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ConnectionContext.Provider>
  );
};
