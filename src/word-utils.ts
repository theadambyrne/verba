import wordBank from "./word-bank.json";
export enum LetterState {
	Miss, // Letter doesn't exist at all
	Present, // Letter exists but wrong location
	Match, // Letter exists and is in the right location
}

export function computeGuess(
	guess: string,
	answerString: string
): LetterState[] {
	const result: LetterState[] = [];

	if (guess.length !== answerString.length) {
		return result;
	}

	const answer = answerString.split("");

	const guessAsArray = guess.split("");

	const answerLetterCount: Record<string, number> = {};

	// alternative approaches to this logic
	// https://github.com/rauchg/wordledge/blob/main/pages/_middleware.ts#L46-L69

	guessAsArray.forEach((letter, index) => {
		const currentAnswerLetter = answer[index];

		answerLetterCount[currentAnswerLetter] = answerLetterCount[
			currentAnswerLetter
		]
			? answerLetterCount[currentAnswerLetter] + 1
			: 1;

		if (currentAnswerLetter === letter) {
			result.push(LetterState.Match);
		} else if (answer.includes(letter)) {
			result.push(LetterState.Present);
		} else {
			result.push(LetterState.Miss);
		}
	});

	result.forEach((curResult, resultIndex) => {
		if (curResult !== LetterState.Present) {
			return;
		}

		const guessLetter = guessAsArray[resultIndex];

		answer.forEach((currentAnswerLetter, answerIndex) => {
			if (currentAnswerLetter !== guessLetter) {
				return;
			}

			if (result[answerIndex] === LetterState.Match) {
				result[resultIndex] = LetterState.Miss;
			}

			if (answerLetterCount[guessLetter] <= 0) {
				result[resultIndex] = LetterState.Miss;
			}
		});

		answerLetterCount[guessLetter]--;
	});

	return result;
}

export function getRandomWord(): string {
	const wb: any = wordBank;
	return String(wb[daysSince()]).toLowerCase();
}

function daysSince() {
	let current: Date = new Date();
	let previous: Date = new Date("02/07/2022");
	return Math.floor((Number(current) - Number(previous) - 1) / 86400000);
}
export function isValidWord(word: string): boolean {
	const wb: any = wordBank;
	return wb.includes(word);
}
