export interface ChatList {
	id: string;
	title: string;
	messages: Array<{
		id: string;
		content: string;
		isUser: boolean;
	}>;
	createdAt: number;
}

export const saveChatToStorage = (chatData: ChatList) => {
	const chats = getChatListFromStorage();
	const existingIndex = chats.findIndex(chat => chat.id === chatData.id);
	
	if (existingIndex !== -1) {
		chats[existingIndex] = chatData;
	} else {
		chats.push(chatData);
	}
	
	localStorage.setItem('chats', JSON.stringify(chats));
};

export const getChatListFromStorage = (): ChatList[] => {
	const chats = localStorage.getItem('chats');
	return chats ? JSON.parse(chats) : [];
};

export const deleteChatFromStorage = (chatId: string) => {
	const chats = getChatListFromStorage();
	const filteredChats = chats.filter(chat => chat.id !== chatId);
	localStorage.setItem('chats', JSON.stringify(filteredChats));
};
