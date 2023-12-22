const formatDate = (date: string | Date) => {
	date = new Date(date);

	const options = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	} as const;

	const locale = navigator.language ?? 'en-US';

	return new Intl.DateTimeFormat(locale, options).format(date);
};

export default formatDate;
