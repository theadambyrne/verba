import { useEffect, useRef, useState } from "react";
import Keyboard from "./Keyboard";
import { useStore, NUMBER_OF_GUESSES, WORD_LENGTH } from "./store";
import { isValidWord } from "./word-utils";
import WordRow from "./WordRow";

export default function App() {
	const state = useStore();
	const [guess, setGuess, addGuessLetter] = useGuess();

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
			<header className="m-5">
				<h1 className="text-4xl font-bold text-center uppercase">🕊 Verba</h1>
				<details className="text-center m-2">
					<summary>How to Play</summary>
					<ul className="text-left p-5">
						<li>Guess today's Latin word!</li>
						<li>Use the keyboard below or your own.</li>
					</ul>
					<ul className="text-left p-5">
						<li>⬛️ Letter is not in the word</li>
						<li>🟨 Letter in the wrong place</li>
						<li>🟩 Letter is correct</li>
						<li>❌ The word will bounce if invalid</li>
					</ul>
				</details>
			</header>

			<div>
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

				{state.gameState === "won" && (
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
										return <div>{resultString}</div>;
									})}
								</div>
								<div
									className="text-md lowercase mt-5 text-center  bg-green-500  text-white cursor-pointer rounded-full p-2  "
									onClick={(e: any) => {
										navigator.clipboard.writeText(
											`🕊 Verba ${state.rows.length}/6 \n` +
												resultsStrings.join("\n")
										);
										e.target.innerHTML = "Copied!";
									}}
								>
									Copy Result
								</div>
							</div>
						</h1>
					</div>
				)}
				{state.gameState === "lost" && (
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
								<div
									className="text-md lowercase mt-5 text-center  bg-yellow-500  text-white cursor-pointer rounded-full p-2  "
									onClick={(e: any) => {
										navigator.clipboard.writeText(
											`🕊 Verba ${state.rows.length}/6 \n` +
												resultsStrings.join("\n")
										);
										e.target.innerHTML = "Copied!";
									}}
								>
									Copy Result
								</div>
							</div>
						</h1>
					</div>
				)}

				{state.gameState === "playing" && (
					<Keyboard
						onClick={(key) => {
							if (!isGameOver) {
								addGuessLetter(key);
							}
						}}
					/>
				)}
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
