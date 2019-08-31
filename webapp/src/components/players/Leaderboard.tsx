import React from 'react';
import MaterialTable from 'material-table';
import { PlayerSummary } from 'state/player';
import useRequest from 'hooks/useRequest';
import { PaginatedResponse } from 'state/api';
import { tableToApiQuery } from 'util/funcs';
import PlayerLink from './PlayerLink';

const tableOptions = {
  search: false,
  paging: false,
  sorting: false,
};

const Leaderboard: React.FC = () => {
  const {
    state: { loading },
    request,
  } = useRequest<PaginatedResponse<PlayerSummary[]>>({ url: '/api/players/' });

  return (
    <MaterialTable
      title="Leaderboard"
      columns={[
        {
          title: 'Player',
          field: 'username',
          sorting: false,
          render: row => <PlayerLink username={row.username} />,
        },
        {
          title: 'Wins',
          field: 'matchWinCount',
          type: 'numeric',
        },
        {
          title: 'Losses',
          field: 'matchLossCount',
          type: 'numeric',
        },
        {
          title: 'Win%',
          field: 'matchWinPct',
          type: 'numeric',
        },
      ]}
      options={tableOptions}
      isLoading={loading}
      data={query =>
        new Promise((resolve, reject) =>
          request({
            params: { ...tableToApiQuery(query), ordering: '-match_win_pct' },
          })
            .then(response =>
              resolve({
                data: response.results,
                page: query.page,
                totalCount: response.count,
              })
            )
            .catch(error => reject(error))
        )
      }
    />
  );
};

export default Leaderboard;