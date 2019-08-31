import { Typography, Button, Grid } from '@material-ui/core';
import useSplashMessage, { matchOutcomeSplasher } from 'hooks/useSplashMessage';
import { last } from 'lodash';
import React, { useContext, useEffect } from 'react';
import { ClientMessageType, LiveMatchContext } from 'state/livematch';
import { formatGameOutcome, formatMatchOutcome } from 'util/format';
import GameLog from './GameLog';
import MoveButtons from './MoveButtons';
import PlayerScore from './PlayerScore';
import LiveMatchErrorDisplay from './LiveMatchErrorDisplay';
import useStyles from 'hooks/useStyles';
import useNotifications from 'hooks/useNotifications';
import MoveIconCircle from './MoveIconCircle';
import useScreenSize, { ScreenSize } from 'hooks/useScreenSize';

/**
 * Helper component for the current match status
 */
const Header: React.FC = () => {
  const {
    state: {
      data: { isReady, selectedMove, games },
    },
  } = useContext(LiveMatchContext);
  const screenSize = useScreenSize();

  const lastGame = last(games);
  const selfScoreEl = <PlayerScore isSelf />;
  const selfMoveEl = (
    <MoveIconCircle
      move={isReady ? selectedMove : lastGame && lastGame.selfMove}
    />
  );
  const opponentMoveEl = (
    <MoveIconCircle
      //  Only show loading icon for opponent if user has already picked a move
      loading={Boolean(selectedMove)}
      move={!isReady && lastGame ? lastGame.opponentMove : undefined}
    />
  );
  const opponentScoreEl = <PlayerScore />;

  // Responsive design!
  return screenSize === ScreenSize.Large ? (
    <Grid item container justify="space-between">
      {selfScoreEl}
      {selfMoveEl}
      <GameLog />
      {opponentMoveEl}
      {opponentScoreEl}
    </Grid>
  ) : (
    <>
      <Grid item container justify="space-between">
        {selfScoreEl}
        {opponentScoreEl}
      </Grid>
      <Grid item container justify="space-between">
        {selfMoveEl}
        <GameLog />
        {opponentMoveEl}
      </Grid>
    </>
  );
};

/**
 * Helper component to render the actions available to the player
 */
const Actions: React.FC = () => {
  const classes = useStyles();
  const {
    state: {
      data: { isReady, selectedMove, opponent, matchOutcome, games },
    },
    sendMessage,
  } = useContext(LiveMatchContext);
  const matchOutcomeSplash = useSplashMessage(
    matchOutcomeSplasher,
    matchOutcome
  );

  // Match is over
  if (matchOutcome) {
    return (
      <>
        <Typography className={classes.normalMessage}>Match Over</Typography>
        <Typography className={classes.majorMessage}>
          You {formatMatchOutcome(matchOutcome, 'past')}!
        </Typography>
        <Typography className={classes.minorMessage}>
          {matchOutcomeSplash}
        </Typography>
      </>
    );
  }

  // Match is running
  if (isReady && !selectedMove) {
    // Player is ready, show moves
    return (
      <MoveButtons
        disabled={!opponent}
        onClick={move => {
          sendMessage({ type: ClientMessageType.Move, move });
        }}
      />
    );
  }

  // Not ready yet, show a ready button
  if (!isReady) {
    const lastGame = last(games);
    return (
      <>
        {lastGame && (
          <Grid item>
            <Typography className={classes.normalMessage}>
              {formatGameOutcome(lastGame.outcome)}
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={() => sendMessage({ type: ClientMessageType.Ready })}
          >
            Ready
          </Button>
        </Grid>
      </>
    );
  }

  return null;
};

/**
 * The main component of the live match screen. As long as the socket is open,
 * this should be rendered. This also includes error cases, e.g. not being
 * logged in.
 */
const LiveMatch: React.FC = () => {
  const notify = useNotifications();
  const {
    state: {
      data: { games, opponent },
      errors,
    },
  } = useContext(LiveMatchContext);

  // Notification for when opponent first connects
  const opponentName = opponent && opponent.username;
  useEffect(() => {
    if (opponentName) {
      notify(`${opponentName} connected`);
    }
  }, [notify, opponentName]);

  // Notitication for end of game
  useEffect(() => {
    const lastGame = last(games);
    if (lastGame) {
      notify(`Game over - ${formatGameOutcome(lastGame.outcome, 'noun')}`);
    }
  }, [notify, games.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Header />
      <Grid item container direction="column" alignItems="center">
        <Actions />
      </Grid>
      <LiveMatchErrorDisplay errors={errors} />
    </>
  );
};

export default LiveMatch;