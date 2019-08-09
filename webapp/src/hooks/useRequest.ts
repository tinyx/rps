import axios, { AxiosRequestConfig } from 'axios'; // tslint:disable-line:match-default-export-name
import { useCallback, useMemo, useReducer } from 'react';
import { ApiAction, ApiActionType, ApiState, defaultApiState } from 'state/api';

// Makes a reducer for the given data type
const apiReducer = <T>(
  state: ApiState<T>,
  action: ApiAction<T>
): ApiState<T> => {
  switch (action.type) {
    case ApiActionType.Request:
      return {
        ...state,
        loading: true,
        data: undefined,
        error: undefined,
      };
    case ApiActionType.Success:
      return {
        ...state,
        loading: false,
        data: action.data,
        error: undefined,
      };
    case ApiActionType.Error:
      return {
        ...state,
        loading: false,
        data: undefined,
        error: action.error,
      };
  }
};

interface ReturnVal<T> {
  state: ApiState<T>;
  request: (subConfig: AxiosRequestConfig) => void;
}

/**
 * Hook to get/post data from/to the server for the given resource/status
 */
export default <T>(config: AxiosRequestConfig): ReturnVal<T> => {
  const [state, dispatch] = useReducer<
    React.Reducer<ApiState<T>, ApiAction<T>>
  >(apiReducer, defaultApiState);

  // Everything here is memoized to prevent unnecessary re-renders and
  // effect triggers

  const request = useCallback(
    (subConfig: AxiosRequestConfig) => {
      dispatch({ type: ApiActionType.Request });
      axios
        .request({ ...config, ...subConfig })
        .then(response => {
          dispatch({
            type: ApiActionType.Success,
            data: response.data,
          });
        })
        .catch(error => {
          dispatch({
            type: ApiActionType.Error,
            error,
          });
        });
    },
    [config, dispatch]
  );

  return useMemo(
    () => ({
      state,
      request,
    }),
    [state, request]
  );
};