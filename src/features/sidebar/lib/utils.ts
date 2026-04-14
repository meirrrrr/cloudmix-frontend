export const formatLastMessageTime = (time: string): string => {
	if (!time) return "";
	const date = new Date(time);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
};

export const showMessage = (message: string): string => {
	if (message.length > 50) {
		return message.slice(0, 50) + "...";
	}
	return message;
};
