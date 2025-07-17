import { Drawer, Grid, Skeleton } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
} from "../../constants/events";
import { useErrors, useSocketEvents } from "../../hooks/hook";
import { getOrSaveFromStorage } from "../../lib/features";
import { useMyChatsQuery } from "../../redux/api/api";
import {
  incrementNotification,
  setNewMessagesAlert,
} from "../../redux/reducers/chat";
import {
  setIsDeleteMenu,
  setIsMobile,
  setSelectedDeleteChat,
} from "../../redux/reducers/misc";
import { getSocket } from "../../socket";
import DeleteChatMenu from "../dialogs/DeleteChatMenu";
import Title from "../shared/Title";
import ChatList from "../specific/ChatList";
import Profile from "../specific/Profile";
import { useGetUserProfileQuery } from "../../redux/api/api";
import { useUpdateAvatarMutation } from "../../redux/api/api";
import { updateUserAvatar } from "../../redux/reducers/updateUserAvatar";
import Header from "./Header";

const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socket = getSocket();

    const chatId = params.chatId;
    const deleteMenuAnchor = useRef(null);

    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    const { isMobile } = useSelector((state) => state.misc);
    const { user } = useSelector((state) => state.auth);
    const [updateAvatar] = useUpdateAvatarMutation();

    // Update avatar and update Redux state for smooth UI update
    const handleAvatarChange = async (file) => {
      try {
        const response = await updateAvatar(file).unwrap();
        // Expecting response to have the new avatar URL
        if (response && response.user && response.user.avatar && response.user.avatar.url) {
          dispatch(updateUserAvatar(response.user.avatar.url));
        } else if (response && response.avatar && response.avatar.url) {
          dispatch(updateUserAvatar(response.avatar.url));
        } else if (response && response.url) {
          dispatch(updateUserAvatar(response.url));
        } else {
          // fallback: refetch or reload if structure is unexpected
          window.location.reload();
        }
      } catch (error) {
        alert(error?.data?.message || "Failed to update avatar");
      }
    };
    const { newMessagesAlert } = useSelector((state) => state.chat);

    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");

    useErrors([{ isError, error }]);

    useEffect(() => {
      getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
    }, [newMessagesAlert]);

    const handleDeleteChat = (e, chatId, groupChat) => {
      dispatch(setIsDeleteMenu(true));
      dispatch(setSelectedDeleteChat({ chatId, groupChat }));
      deleteMenuAnchor.current = e.currentTarget;
    };

    const handleMobileClose = () => dispatch(setIsMobile(false));

    const newMessageAlertListener = useCallback(
      (data) => {
        if (data.chatId === chatId) return;
        dispatch(setNewMessagesAlert(data));
      },
      [chatId]
    );

    const newRequestListener = useCallback(() => {
      dispatch(incrementNotification());
    }, [dispatch]);

    const refetchListener = useCallback(() => {
      refetch();
      navigate("/");
    }, [refetch, navigate]);

    const onlineUsersListener = useCallback((data) => {
      setOnlineUsers(data);
    }, []);

    const eventHandlers = {
      [NEW_MESSAGE_ALERT]: newMessageAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
    };

    useSocketEvents(socket, eventHandlers);

    // Fetch selected user's profile if selected
    const { data: selectedProfileData, isLoading: selectedProfileLoading } = useGetUserProfileQuery(selectedUserId, { skip: !selectedUserId });

    // Handler for chat list click: set selected user
    const handleChatListUserClick = (userId) => {
      setSelectedUserId(userId);
    };

    // Pass handler to ChatList via prop
    const { theme } = useTheme();
    return (
      <>
        <Title />
        <Header />

        <DeleteChatMenu
          dispatch={dispatch}
          deleteMenuAnchor={deleteMenuAnchor}
        />

        {isLoading ? (
          <Skeleton />
        ) : (
          <Drawer open={isMobile} onClose={handleMobileClose}>
            <ChatList
              w="70vw"
              chats={data?.chats}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              onlineUsers={onlineUsers}
              onUserClick={handleChatListUserClick}
            />
          </Drawer>
        )}

        <Grid container height={"calc(100vh - 4rem)"}>
          <Grid
            item
            sm={4}
            md={3}
            sx={{
              display: { xs: "none", sm: "block" },
              background: theme.SIDEBAR_BG,
            }}
            height={"100%"}
          >
            {isLoading ? (
              <Skeleton />
            ) : (
              <ChatList
                chats={data?.chats}
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
                onlineUsers={onlineUsers}
                onUserClick={handleChatListUserClick}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"} sx={{ background: theme.APP_BG }}>
            <WrappedComponent {...props} chatId={chatId} user={user} />
          </Grid>

          <Grid
            item
            md={4}
            lg={3}
            height={"100%"}
            sx={{
              display: { xs: "none", md: "block" },
              padding: "2rem",
              background: theme.APP_OVERLAY,
            }}
          >
            {selectedUserId ? (
              selectedProfileLoading ? (
                <Skeleton />
              ) : selectedProfileData && selectedProfileData.user ? (
                <Profile user={selectedProfileData.user} />
              ) : (
                <div style={{ color: theme.TEXT_PRIMARY }}>User not found</div>
              )
            ) : (
              <Profile user={user} onAvatarChange={handleAvatarChange} />
            )}
          </Grid>
        </Grid>
      </>
    );
  };
};

export default AppLayout;
