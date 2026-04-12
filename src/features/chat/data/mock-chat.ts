import type { ChatMessage, ConversationPreview, SearchUser } from "../types";

export const conversationPreviews: ConversationPreview[] = [
	{
		id: "aslan",
		name: "Aslan",
		lastMessage: "Hi, how is going now?",
		time: "10:44",
	},
	{
		id: "moana",
		name: "Moana",
		lastMessage: "Yo bro I got some info for you",
		time: "10:21",
		unreadCount: 1,
	},
	{
		id: "dragon-love",
		name: "Dragon Love",
		lastMessage: "Send nuds",
		time: "10:44",
	},
];

export const activeChatMessages: ChatMessage[] = [
	{
		id: "m-1",
		text: "Yo Samurai, me and pokemon head will going to Dostyk, will u join?",
		direction: "incoming",
	},
	{
		id: "m-2",
		text: "Okay what exactly we're doing there?",
		direction: "outgoing",
	},
	{
		id: "m-3",
		text: "First of all, could we have a snack at Memo's",
		direction: "outgoing",
	},
	{
		id: "m-4",
		text: "We'll have to look for a gift for Alina",
		direction: "incoming",
	},
	{
		id: "m-5",
		text: "Ok cool",
		direction: "incoming",
	},
];

export const searchableUsers: SearchUser[] = [
	{ id: "u-1", username: "aslan", displayName: "Aslan" },
	{ id: "u-2", username: "moana", displayName: "Moana" },
	{ id: "u-3", username: "dragon_love", displayName: "Dragon Love" },
	{ id: "u-4", username: "pokemon_head", displayName: "Pokemon Head" },
	{ id: "u-5", username: "alina", displayName: "Alina" },
];
