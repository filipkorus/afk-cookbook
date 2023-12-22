import React, {useState} from 'react';

const useItemList = (initialList: Array<string>, maxItems?: number) => {
	const [items, setItems] = useState<typeof initialList>(initialList);

	const handleItemChange = (index: number, value: string) => {
		const newItems = [...items];
		newItems[index] = value;
		setItems(newItems);
	};

	const addItem = () => {
		if (maxItems == null || items.length < maxItems) {
			setItems([...items, '']);
		}
	};

	const removeItem = (index: number) => {
		const newItems = [...items];
		newItems.splice(index, 1);
		setItems(newItems);
	};

	const resetList = () => setItems(initialList);

	return {
		items,
		handleItemChange,
		addItem,
		removeItem,
		resetList
	};
};

export default useItemList;
