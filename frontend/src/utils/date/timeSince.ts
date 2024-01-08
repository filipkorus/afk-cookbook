const timeSince = (date: string | Date) => {
	const seconds = Math.floor(
		Math.abs((new Date().getTime() - new Date(date).getTime())) / 1000
	);

	const secondsIn = {
		year: 31536000,
		month: 2592000,
		day: 86400,
		hour: 3600,
		minute: 60
	} as const;

	let interval: number = seconds / secondsIn.year;
	if (interval > 1) {
		return `${Math.floor(interval)}y`;
	}

	interval = seconds / secondsIn.month;
	if (interval > 1) {
		return `${Math.floor(interval)}mo`;
	}

	interval = seconds / secondsIn.day;
	if (interval > 1) {
		return `${Math.floor(interval)}d`;
	}

	interval = seconds / secondsIn.hour;
	if (interval > 1) {
		return `${Math.floor(interval)}h`;
	}

	interval = seconds / secondsIn.minute;
	if (interval > 1) {
		return `${Math.floor(interval)}min`;
	}

	const sec = Math.floor(Math.max(1, seconds));

	return `${sec}s`;
}

export default timeSince;
