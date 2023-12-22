import React, {useState} from 'react';

const useForm = <T>(initialValues: T) => {
	const [formData, setFormData] = useState<T>(initialValues);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const {name, value: inputValue, type} = e.target;

		const isCheckbox = type === 'checkbox';
		const checkboxValue = (e.target as HTMLInputElement)?.checked;

		if (name == null || name?.length === 0) {
			return console.error('Input field\'s name must not be null');
		}

		setFormData((prevData) => ({
			...prevData,
			[name]: isCheckbox ? checkboxValue : (type ==='number' ? +inputValue : inputValue),
		}));
	};

	const resetForm = () => {
		setFormData(initialValues);
	};

	const setNewFormValues = (newValues: T) => {
		setFormData(newValues);
	};

	return {
		formData,
		setNewFormValues,
		handleInputChange,
		resetForm,
	};
};

export default useForm;
