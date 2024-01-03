const timeSince = (date: string | Date) => {
	const seconds = Math.floor(Math.abs((new Date().getTime() - new Date(date).getTime())) / 1000);

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
		return `${Math.floor(interval)}m`;
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
		return `${Math.floor(interval)}m`;
	}

	const sec = Math.floor(seconds);

	return sec < 5 ? 'now' : `${sec}s`;
}

export default timeSince;
