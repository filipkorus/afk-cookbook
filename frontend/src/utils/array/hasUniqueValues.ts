const hasUniqueValues = <T>(array: Array<T>) => {
	const uniqueSet = new Set(array);
	return array.length === uniqueSet.size;
};

export default hasUniqueValues;
