type User = {
	id: number;
	name: string;
	picture: string;
	email: string;
	admin: boolean;
	banned: boolean;
	joinedAt: Date;
};

export default User;
