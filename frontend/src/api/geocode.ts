import Coords from '@/types/Coords';
import axios, {AxiosError} from 'axios';

const geocode = async (coords: Coords): Promise<{
	success: boolean,
	data: { location?: string, country?: string } | null,
	error: boolean | AxiosError
}> => {
	try {
		const {data} = await axios.get(`https://geocode.maps.co/reverse?lat=${coords.lat}&lon=${coords.lon}`);
		const {address} = data;

		return {
			success: true,
			data: {
				...data,
				location: `${address?.city ?? address?.village ?? address?.county ?? address?.borough}, ${address?.country}`
			},
			error: false
		};
	} catch (error) {

		return {
			success: false,
			data: null,
			error: error instanceof AxiosError ? error : true
		};
	}
};

export default geocode;
