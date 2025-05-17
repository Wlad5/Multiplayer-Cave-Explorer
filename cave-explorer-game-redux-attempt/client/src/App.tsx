import {
	useDispatch,
	useSelector
} from "react-redux";
import { AppDispatch, RootState } from "./store";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { initializeGridAC } from "./reducers/gridActions";
import {
	endGameAC,
	exitGameAC,
	setActiveGamesAC,
	setCurrentPlayerAC,
	setGameTimerAC,
	setTurnTimerAC,
	setWaitingPlayersAC,
	showMessageAC,
	startGameAC
} from "./reducers/gameActions";
import Gameboard from "./components/gameBoard/GameBoard";
import {
	addPlayerAC,
	movePlayerAC,
	removePlayerAC,
	turnPlayerAC,
	updateScoreAC,
	updateTrapImmunity
} from "./reducers/playerActions";
import { Player } from "./reducers/playerReducer";
import { StartScreen } from "./components/startScreen/StartScreen";
import { PlayerDirection } from "../../server/game/constants";
import { Controls } from "./components/control/Controls";

const socket = io('http://localhost:3000');

function App() {
	// const [showLeaderboard, setShowLeaderboard] = useState(false);
	const dispatch: AppDispatch 	= useDispatch();
	const [username, setUsername] 	= useState('');
	const players 					= useSelector((state: RootState) => state.player);
	const grid 						= useSelector((state: RootState) => state.grid.grid);
	const message 					= useSelector((state: RootState) => state.game.message);
	const gameStatus 				= useSelector((state: RootState) => state.game.gameStatus);
	const activeGames 				= useSelector((state: RootState) => state.game.activeGames);
	const gameTimeLeft 				= useSelector((state: RootState) => state.game.gameTimeLeft);
	const turnTimeLeft 				= useSelector((state: RootState) => state.game.turnTimeLeft);
	const currentPlayer 			= useSelector((state: RootState) => state.game.currentPlayer);
	const waitingPlayers 			= useSelector((state: RootState) => state.game.waitingPlayers);
	const leaderBoard 				= useSelector((state: RootState) => state.game.leaderBoard);
	const playerScore 				= players.get(socket.id!)?.score 		|| 0;
	const playerUsername 			= players.get(socket.id!)?.username 	|| username;
	const playerTrapImmunity 		= players.get(socket.id!)?.trapImmunity || 0;
	const currentPlayerUsername 	= currentPlayer?.username 				|| username;

	useEffect(() => {

		socket.on('waitingPlayers', (waitingPlayers) => {
			const playersMap = new Map<string, Player>(waitingPlayers);
			dispatch(setWaitingPlayersAC(playersMap));
		});

		socket.on('gameJoined', ({ gameId }) => {
			console.log(`Joined game: ${gameId}`);
			dispatch(startGameAC());
		})

		socket.on('activeGames', (activeGames: string[]) => {
			dispatch(setActiveGamesAC(activeGames));
		})

		socket.on('playerAdded', (newPlayer) => {
			console.log(`New player added: ${newPlayer}`);
			dispatch(addPlayerAC(newPlayer));
		})

		socket.on('playerJoined', (players) => {
			console.log('Updated players list:', players);
			players.forEach((player: Player) => {
				dispatch(addPlayerAC(player));
			});
		});

		socket.on('playerUpdated', (updatedPlayer) => {
			console.log(`Player updated: ${updatedPlayer}`);
			dispatch(updateScoreAC(updatedPlayer.id, updatedPlayer.score));
			dispatch(updateTrapImmunity(updatedPlayer.id, updatedPlayer.trapImmunity));
		});

		socket.on('currentPlayer', (player) => {
			dispatch(setCurrentPlayerAC(player));
		});

		socket.on('gameTimeUpdate', (timeLeft) => {
			dispatch(setGameTimerAC(timeLeft));
		});

		socket.on('turnTimerUpdate', ({ playerId, timeLeft }) => {
			if (playerId === socket.id) {
				dispatch(setTurnTimerAC(timeLeft));
			}
		});

		socket.on('playerRemoved', (playerId: string) => {
			dispatch(removePlayerAC(playerId));
		});

		socket.on('gameState', (updatedGrid) => {
			dispatch(initializeGridAC(updatedGrid.length, updatedGrid, updatedGrid));
		});

		socket.on('message', (message) => {
			dispatch(showMessageAC(message));
		});

		socket.on('gameCreated', ({ gameId }) => {
			socket.emit('getCurrentPlayer', { gameId });
			dispatch(startGameAC());
		});

		socket.on('gameEnded', (scores, winner) => {
			dispatch(endGameAC(scores, winner));
			dispatch(setWaitingPlayersAC(waitingPlayers));
		});

		return () => {
			socket.off('activeGames');
			socket.off('playerAdded');
			socket.off('playerJoined');
			socket.off('playerUpdated');
			socket.off('currentPlayer');
			socket.off('gameState');
			socket.off('playerAddedToWaitingRoom');
			socket.off('message');
			socket.off('gameJoined');
			socket.off('gameTimeUpdate');
			socket.off('turnTimeUpdate');
			socket.off('waitingPlayers');
		}
	}, [dispatch, waitingPlayers]);

	
	useEffect(() => {
		players.forEach((player: Player) => {
			console.log(`Player ID: ${player.id}, Score: ${player.score}`);
		});
	}, [players])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowUp':
				case 'w': handleInput(PlayerDirection.NORTH); break;
				case 'ArrowDown':
				case 's': handleInput(PlayerDirection.SOUTH); break;
				case 'ArrowLeft':
				case 'a': handleInput(PlayerDirection.WEST); break;
				case 'ArrowRight':
				case 'd': handleInput(PlayerDirection.EAST); break;
				case 'f': handleInput('F'); break;
				case 'e': handleInput('E'); break;
				default: console.log('Invalid key');
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	const handleInput = (action: string) => {
		let serverDirection = action;
		switch (action) {
			case PlayerDirection.NORTH: serverDirection = "ArrowUp"; break;
			case PlayerDirection.SOUTH: serverDirection = "ArrowDown"; break;
			case PlayerDirection.WEST: serverDirection = "ArrowLeft"; break;
			case PlayerDirection.EAST: serverDirection = "ArrowRight"; break;
		}

		switch (action) {
			case PlayerDirection.NORTH:
			case PlayerDirection.SOUTH:
			case PlayerDirection.WEST:
			case PlayerDirection.EAST:
				turnPlayer(socket.id!, action, serverDirection);
				break;
			case 'F':
				movePlayer(socket.id!, action);
				break;
			case 'E':
				exitGame();
				break;
			default:
				console.log('Invalid move');
		}
	};

	const play = () => {
		if (username.trim()) {
			socket.emit('createGame', { username });
			dispatch(startGameAC());
		} else {
			alert(`Please enter a username!`);
		}
	}

	const join = () => {
		if (username.trim()) {
			socket.emit('waitingRoom', { username });
			const playersMap = new Map<string, Player>(waitingPlayers);
			dispatch(setWaitingPlayersAC(playersMap));
		} else {
			alert(`Please enter a username!`);
		}
	}

	const joinActiveGame = (gameId: string) => {
		if (username.trim()) {
			socket.emit('joinActiveGame', { gameId, username });
			dispatch(startGameAC())
		} else {
			alert(`Please enter a username!`);
		}
	}

	const movePlayer = (playerId: string, move: string) => {
		dispatch(movePlayerAC(playerId, grid));
		socket.emit('move', { playerId: playerId, move: move });
	}

	const turnPlayer = (playerId: string, direction: string, serverDirection: string) => {
		dispatch(turnPlayerAC(playerId, direction));
		socket.emit('turn', { playerId: playerId, direction: serverDirection });
	}
	
	const leaveWaitingRoom = () => {
		socket.emit('leaveWaitingRoom', { playerId: socket.id });
		const playerMap = new Map<string, Player>(waitingPlayers);
		dispatch(setWaitingPlayersAC(playerMap));
	}

	const exitGame = () => {
		dispatch(exitGameAC());
		socket.emit('leaveGame', { playerId: socket.id });
	}

	return (
		<div className="app">
			{gameStatus === 'not_started' || gameStatus === 'ended' ? (
				<StartScreen
					play={play}
					join={join}
					joinActiveGame={joinActiveGame}
					username={username}
					setUsername={setUsername}
					activeGames={activeGames}
					leaveWaitingRoom={leaveWaitingRoom}
				/>
			) : (
				<>
					<div className="timers">
						<div>Game Time Left: {gameTimeLeft / 1000}s</div>
						<div>Turn Time Left: {turnTimeLeft / 1000}s</div>
					</div>
					<div className="current-player-info">
						It is {currentPlayerUsername}'s turn!
					</div>
					<div className="game-board-container">
						<Gameboard exit={exitGame} />
					</div>
					{message && <div className="message-area">{message}</div>}
					<div className="controls-container">
						<Controls handleInput={handleInput} />
					</div>
					<div className="player-stats">
						<div>{`${playerUsername}: ${playerScore}`}</div>
						<div>{`Trap Immunity: ${playerTrapImmunity}`}</div>
					</div>
					{/* Always show the leaderboard */}
					<div className="leaderBoard">
						<h2>Leaderboard</h2>
						{leaderBoard && leaderBoard.length > 0 ? (
							leaderBoard.map((player, index) => (
								<div key={player.playerId || index}>
									{player.username || 'Unknown'}: {player.score || 0}
								</div>
							))
						) : (
							<div>No players in the leaderboard.</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
export default App;