import { Box, Typography } from '@material-ui/core';
import React, { useContext } from 'react';
import { GameOutcome, MatchContext } from 'state/match';
import { freq } from 'util/funcs';

const outcomeLabel = {
  [GameOutcome.Win]: 'W',
  [GameOutcome.Loss]: 'L',
  [GameOutcome.Tie]: 'T',
};

// We have to leave the React.FC tag off to get default props to work
const GameLog: React.FC = () => {
  const {
    state: { bestOf, gameLog },
  } = useContext(MatchContext);

  const nonTies = freq(gameLog, GameOutcome.Tie);
  const maxRemainingGames = bestOf - nonTies;
  const gameLogStr = gameLog
    .map(outcome => outcomeLabel[outcome])
    .concat(Array(maxRemainingGames).fill('–'))
    .join(' ');

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="start"
      textAlign="center"
    >
      <Typography variant="h5">Best of {bestOf}</Typography>
      <Typography variant="body1">{gameLogStr}</Typography>
    </Box>
  );
};

GameLog.defaultProps = {
  isSelf: false,
};

export default GameLog;