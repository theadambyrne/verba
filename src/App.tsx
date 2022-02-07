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

	const guessesRemaining = NUMBER_OF_GUESSES - rows.length;

	rows = rows.concat(Array(guessesRemaining).fill(""));

	return (
		<div className="mx-auto  w-96 relative h-screen ">
			<header className="p-10">
				<h1 className="text-5xl font-bold text-center uppercase">🏛 Verba</h1>
			</header>

			<div>
				<main className="grid grid-rows-6 gap-2 my-2">
					{rows.map((word, index) => (
						<WordRow
							key={index}
							word={word.guess}
							result={word.result}
							className={
								showInvalidGuess && index === currentRow
									? "animate-bounce duration-75"
									: " "
							}
						/>
					))}
				</main>

				{state.gameState === "won" && (
					<div
						role="modal"
						className="opacity-95 absolute bg-gray-700 border border-gray-800 rounded-xl text-center
            w-12/12 h-2/3 p-6 left-0 right-0 mx-auto top-20
           grid grid-rows-4"
					>
						<h1 className="text-8xl font-bold text-center uppercase mt-5">
							🏆
						</h1>

						<h1 className="text-5xl font-italic text-center uppercase mt-5">
							Optime!
						</h1>

						<h1 className="text-2xl font-bold text-center uppercase mt-5">
							<div className="grid grid-rows-6 gap-2 my-2">
								{state.rows.length}/6
								{state.rows.map((foo: any) => {
									const { guess, result } = foo;
									const options = ["⬛️", "🟨", "🟩"];
									let resultString = "";
									result.map((r: number) => {
										resultString = resultString.concat(options[r]);
									});
									return <div>{resultString}</div>;
								})}
							</div>
						</h1>
					</div>
				)}
				{state.gameState === "lost" && (
					<div
						role="modal"
						className="opacity-95 absolute bg-gray-700 border border-gray-800 rounded-xl text-center
            w-12/12 h-2/3 p-6 left-0 right-0 mx-auto top-20
           grid grid-rows-4"
					>
						<h1 className="text-8xl font-bold text-center uppercase mt-5">
							💀
						</h1>

						<h1 className="text-5xl font-italic text-center uppercase mt-5">
							O male!
						</h1>

						<h1 className="text-6xl font-bold text-center uppercase mt-10 animate-bounce text-green-500">
							{state.answer}
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
