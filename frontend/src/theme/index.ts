import {createTheme, responsiveFontSizes} from "@mui/material";

const theme = createTheme({
	palette: {
		primary: {
			main: '#51526b',
		},
		// secondary: {
		// 	main: red[500],
		// },
		// success: {
		// 	main: purple[500],
		// },
	}
});

export default responsiveFontSizes(theme);
