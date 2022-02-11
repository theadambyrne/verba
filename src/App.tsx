import { useEffect, useRef, useState } from "react";
import Keyboard from "./Keyboard";
import { useStore, NUMBER_OF_GUESSES, WORD_LENGTH } from "./store";
import { getRandomWord, isValidWord } from "./word-utils";
import WordRow from "./WordRow";

export default function App() {
	const state = useStore();
	const [guess, setGuess, addGuessLetter] = useGuess();
	const [winScreen, setWinScreen] = useState(false);
	const [loseScreen, setLoseScreen] = useState(false);
	const [helpScreen, setHelpScreen] = useState(false);

	const [showInvalidGuess, setInvalidGuess] = useState(false);
	useEffect(() => {
		let id: NodeJS.Timeout;
		if (showInvalidGuess) {
			id = setTimeout(() => setInvalidGuess(false), 1500);
		}

		return () => clearTimeout(id);
	}, [showInvalidGuess]);

	const addGuess = useStore((s) => s.addGuess);
	const previousGuess = usePrevious(guess);
	if (state.answer !== getRandomWord()) {
		state.answer = getRandomWord();
		state.rows = [];
		state.gameState = "playing";
		state.keyboardLetterState = {};
	}

	useEffect(() => {
		if (state.gameState === "lost") setLoseScreen(true);
		if (state.gameState === "won") setWinScreen(true);
	}, [state.gameState]);

	useEffect(() => {
		if (!isGameOver) {
			if (guess.length === 0 && previousGuess?.length === WORD_LENGTH) {
				if (isValidWord(previousGuess)) {
					setInvalidGuess(false);
					addGuess(previousGuess);
				} else {
					setInvalidGuess(true);
					setGuess(previousGuess);
				}
			}
		}
	}, [guess]);

	const isGameOver = state.gameState !== "playing";
	let rows = [...state.rows];

	let currentRow = 0;
	if (rows.length < NUMBER_OF_GUESSES) {
		currentRow = rows.push({ guess }) - 1;
	}
	let resultsStrings: string[] = [];

	const guessesRemaining = NUMBER_OF_GUESSES - rows.length;

	rows = rows.concat(Array(guessesRemaining).fill(""));

	return (
		<div className="mx-auto w-96 relative h-screen ">
			<div className="p-2">
				<header className="grid grid-cols-3 border-b border-1 border-gray-600">
					<span
						className="p-4 text-center"
						onClick={() => {
							setHelpScreen(true);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							height="24"
							viewBox="0 0 24 24"
							width="24"
						>
							<path
								fill="#3a3a3c"
								d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
							></path>
						</svg>
					</span>
					<h1 className="text-4xl p-2 font-bold text-center uppercase">
						Verba
					</h1>
					<span className="p-2">&nbsp;</span>
				</header>

				<div className="mt-2">
					<main className="grid grid-rows-6 gap-1 my-1">
						{rows.map((word, index) => (
							<WordRow
								key={index}
								word={word.guess}
								result={word.result}
								className={
									showInvalidGuess && index === currentRow
										? "animate-bounce duration-75 text-white"
										: " text-white"
								}
							/>
						))}
					</main>
					{helpScreen && (
						<div
							role="modal"
							className="opacity-95 absolute bg-gray-700 border border-gray-800 rounded-xl text-center
            w-12/12 h-2/3 p-8 left-0 right-0 mx-auto top-20
           grid grid-rows-6"
						>
							<h1 className="text-4xl font-bold text-center uppercase p-2 border-b border-1 border-white-800">
								How to play
							</h1>
							<div className="grid grid-rows-8 gap-2  mt-5">
								<div>
									<p className="text-left mt-2">
										Guess the VERBA in 6 tries. Each guess must be a valid 5
										letter word. Hit the enter button to submit. After each
										guess, the color of the tiles will change to show how close
										your guess was to the word.
									</p>
								</div>
								<div className="mt-5 text-left">
									<ul>
										<li>&#129001; Letter is correct</li>
										<li>&#129000; Letter is in the wrong position</li>
										<li>&#11035; Letter is not in the word</li>
										<li>
											<i>Only words in the word list may be used</i>
										</li>
									</ul>
								</div>
								<div className="mt-5 p-5">
									<div
										className="text-md  mt-2 text-center  bg-green-500  text-white cursor-pointer rounded-full p-2  "
										onClick={() => {
											setHelpScreen(false);
										}}
									>
										Start
									</div>
								</div>
							</div>
						</div>
					)}
					{winScreen && (
						<div
							role="modal"
							className="opacity-95 absolute bg-gray-700 border border-gray-800 rounded-xl text-center
            w-12/12 h-2/3 p-8 left-0 right-0 mx-auto top-20
           grid grid-rows-6"
						>
							<h1 className="text-5xl font-bold text-center uppercase mt-5">
								🏆 optime!
							</h1>
							<h1 className="  font-bold text-center uppercase ">
								<div className="grid grid-rows-8 gap-2 my-2">
									{state.rows.length}/6
									<div>
										{state.rows.map((foo: any) => {
											const { guess, result } = foo;
											const options = ["⬛️", "🟨", "🟩"];
											let resultString = "";
											result.map((r: number) => {
												resultString = resultString.concat(options[r]);
											});
											resultsStrings.push(resultString);
											return <div key={resultString}>{resultString}</div>;
										})}
									</div>
									<div className="mt-5 p-5">
										<div
											className="text-md text-center  bg-green-500  text-white cursor-pointer rounded-full p-2  "
											onClick={(e: any) => {
												navigator.clipboard.writeText(
													`#verba ${state.rows.length}/6 \n` +
														resultsStrings.join("\n") +
														"https://verba.vercel.app"
												);
												e.target.innerHTML = "Copied!";
											}}
										>
											Copy Result
										</div>
										<div
											className="text-md mt-2 text-center  bg-red-500  text-white cursor-pointer rounded-full p-2  "
											onClick={() => {
												setWinScreen(false);
											}}
										>
											Back to game
										</div>
									</div>
								</div>
							</h1>
						</div>
					)}
					{loseScreen && (
						<div
							role="modal"
							className="opacity-95 absolute bg-gray-700 border border-gray-800 rounded-xl text-center
            w-12/12 h-2/3 p-8 left-0 right-0 mx-auto top-20
           grid grid-rows-4"
						>
							<h1 className="text-5xl font-bold text-center uppercase mt-5">
								💀 o male!
							</h1>

							<h1 className="text-6xl font-bold text-center uppercase mt-10 animate-bounce text-green-500">
								{state.answer}
							</h1>

							<h1 className="  font-bold text-center uppercase ">
								<div className="grid grid-rows-8 gap-2 my-2">
									{state.rows.length}/6
									<div>
										{state.rows.map((foo: any) => {
											const { guess, result } = foo;
											const options = ["⬛️", "🟨", "🟩"];
											let resultString = "";
											result.map((r: number) => {
												resultString = resultString.concat(options[r]);
											});
											resultsStrings.push(resultString);
											return <div>{resultString}</div>;
										})}
									</div>
									<div className="mt-5 p-5">
										<div
											className="text-md text-center  bg-yellow-500  text-white cursor-pointer rounded-full p-2  "
											onClick={(e: any) => {
												navigator.clipboard.writeText(
													`#verba ${state.rows.length}/6 \n` +
														resultsStrings.join("\n") +
														"https://verba.vercel.app"
												);
												e.target.innerHTML = "Copied!";
											}}
										>
											Copy Result
										</div>
										<div
											className="text-md mt-2 text-center  bg-red-500  text-white cursor-pointer rounded-full p-2  "
											onClick={() => {
												setLoseScreen(false);
											}}
										>
											Back to game
										</div>
									</div>
								</div>
							</h1>
						</div>
					)}

					<Keyboard
						onClick={(key) => {
							if (!isGameOver) {
								addGuessLetter(key);
							}
						}}
					/>
				</div>
			</div>
		</div>
	);
}

function useGuess(): [
	string,
	React.Dispatch<React.SetStateAction<string>>,
	(letter: string) => void
] {
	const [guess, setGuess] = useState("");

	const addGuessLetter = (letter: string) => {
		setGuess((curGuess) => {
			const newGuess =
				letter.length === 1 && curGuess.length !== WORD_LENGTH
					? curGuess + letter
					: curGuess;

			switch (letter) {
				case "Backspace":
					return newGuess.slice(0, -1);
				case "Enter":
					if (newGuess.length === WORD_LENGTH) {
						return "";
					}
			}

			if (newGuess.length === WORD_LENGTH) {
				return newGuess;
			}

			return newGuess;
		});
	};

	const onKeyDown = (e: KeyboardEvent) => {
		let letter = e.key;
		if (/[a-z]/.test(letter)) {
			addGuessLetter(letter);
		}
	};

	useEffect(() => {
		document.addEventListener("keydown", onKeyDown);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, []);

	return [guess, setGuess, addGuessLetter];
}

// source https://usehooks.com/usePrevious/
function usePrevious<T>(value: T): T {
	const ref: any = useRef<T>();

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}
