
import { Stack, Dialog, DialogContent, CircularProgress } from "@mui/material";
import React, { useState } from "react";
import ChatItem from "../shared/ChatItem";
import Profile from "./Profile";
import { useGetUserProfileQuery } from "../../redux/api/api";


const ChatList = ({
  w = "100%",
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [
    {
      chatId: "",
      count: 0,
    },
  ],
  handleDeleteChat,
  onUserClick,
}) => {
  return (
    <Stack width={w} direction={"column"} overflow={"auto"} height={"100%"}>
      {chats?.map((data, index) => {
        const { avatar, _id, name, groupChat, members, lastSeen } = data;

        const newMessageAlert = newMessagesAlert.find(
          ({ chatId }) => chatId === _id
        );

        const isOnline = members?.some((member) =>
          onlineUsers.includes(member)
        );

        // For 1-1 chat, show friend profile on click (not for group chats)
        const friendId = !groupChat && members?.find((id) => id !== undefined && id !== null);

        return (
          <div key={_id}>
            <div
              style={{ cursor: !groupChat ? "pointer" : "default" }}
              onClick={() => {
                if (!groupChat && friendId && onUserClick) onUserClick(friendId);
              }}
            >
              <ChatItem
                index={index}
                newMessageAlert={newMessageAlert}
                isOnline={isOnline}
                avatar={avatar}
                name={name}
                _id={_id}
                groupChat={groupChat}
                sameSender={chatId === _id}
                handleDeleteChat={handleDeleteChat}
                lastSeen={lastSeen}
              />
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

export default ChatList;
