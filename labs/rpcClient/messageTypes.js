const MessageTypes = {
    CLIENT_GET_TOKEN: "get-token",
    CLIENT_GET_ROOMS_LIST: "get-rooms-list",
    CLIENT_CREATE_ROOM: "create-room",
    CLIENT_RENAME_ROOM: "rename-room",
    CLIENT_REMOVE_ROOM: "remove-room",
    CLIENT_JOIN_ROOM: "join-room",
    CLIENT_LEAVE_ROOM: "leave-room",
    CLIENT_GET_LAST_MESSAGES_LIST: "get-last-messages-list",
    CLIENT_GET_MEMBERS_LIST: "get-members-list",
    CLIENT_POST_MESSAGE: "post-message",
    //
    SERVER_TOKEN: "token",
    SERVER_ROOMS_LIST: "rooms-list",
    SERVER_ROOM_CREATED: "room-created",
    SERVER_ROOM_RENAMED: "room-renamed",
    SERVER_ROOM_REMOVED: "room-removed",
    SERVER_CURRENT_ROOM_CHANGED: "current-room-changed",
    SERVER_MEMBER_JOINED: "member-joined",
    SERVER_MEMBER_LEFT: "member-left",
    SERVER_LAST_MESSAGES_LIST: "last-messages-list",
    SERVER_MEMBERS_LIST: "members-list",
    SERVER_MESSAGE_POSTED: "message-posted",
};

module.exports = MessageTypes;