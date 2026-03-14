import { Drawer, Grid, Skeleton } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import { useNotificationSound } from "../../context/NotificationSoundContext";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  REFETCH_CHATS,
  WATCH_PARTY_STATE_UPDATE,
  WATCH_PARTY_ENDED,
} from "../../constants/events";
import { useErrors, useSocketEvents } from "../../hooks/hook";
import { usePageVisibility } from "../../hooks/usePageVisibility";
import { getOrSaveFromStorage } from "../../lib/features";
import { useMyChatsQuery } from "../../redux/api/api";
import { useChatDetailsQuery } from "../../redux/api/api";
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
import GroupMembersList from "../specific/GroupMembersList";
import { useGetUserProfileQuery } from "../../redux/api/api";
import { useUpdateAvatarMutation } from "../../redux/api/api";
import { updateUserAvatar } from "../../redux/reducers/updateUserAvatar";
import Header from "./Header";
import { useAudioCall } from "../../hooks/useAudioCall";
import AudioCallDialog from "../dialogs/AudioCallDialog";

const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const socket = getSocket();
    const { playNotificationSound } = useNotificationSound();

    const chatId = params.chatId;
    const deleteMenuAnchor = useRef(null);

    const [onlineUsers, setOnlineUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [watchPartyByChat, setWatchPartyByChat] = useState({});

    // Audio call hook
    const {
      callState,
      callInfo,
      participants,
      muted,
      toggleMute,
      speakerOn,
      toggleSpeaker,
      callEndReason,
      clearCallEndReason,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      voiceEffect,
      changeVoiceEffect,
    } = useAudioCall();

    // Show toast when a call ends with a reason
    useEffect(() => {
      if (!callEndReason) return;
      const messages = {
        "User is offline": "User is offline",
        "No group members are online": "No group members are online",
        "No recipient specified": "Call failed: no recipient",
        "rejected": "Call was declined",
        "ended": "Call ended",
        "disconnected": "Other user disconnected",
        "Microphone unavailable": "Could not rejoin: microphone unavailable",
      };
      toast(messages[callEndReason] || `Call ended: ${callEndReason}`, { icon: "📞" });
      clearCallEndReason();
    }, [callEndReason, clearCallEndReason]);

    // Show toasts for peer disconnect / reconnect during call
    useEffect(() => {
      if (!socket) return;
      const handlePeerDisconnected = ({ userId }) => {
        toast("Other user disconnected — waiting for reconnect...", {
          icon: "⏳",
          duration: 5000,
        });
      };
      const handlePeerReconnected = ({ userId, userName }) => {
        toast(`${userName || "User"} reconnected!`, {
          icon: "✅",
          duration: 3000,
        });
      };
      socket.on("CALL_USER_DISCONNECTED", handlePeerDisconnected);
      socket.on("CALL_USER_RECONNECTED", handlePeerReconnected);
      return () => {
        socket.off("CALL_USER_DISCONNECTED", handlePeerDisconnected);
        socket.off("CALL_USER_RECONNECTED", handlePeerReconnected);
      };
    }, [socket]);

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

    const { isLoading, isUninitialized, data, isError, error, refetch } = useMyChatsQuery("", {
      refetchOnMountOrArgChange: 30, // Only refetch if data is older than 30 seconds
    });

    // Fetch chat details if chatId exists to determine if it's a group
    const { data: chatDetailsData, isLoading: chatDetailsLoading } = useChatDetailsQuery(
      { chatId, populate: true }, 
      { skip: !chatId, refetchOnMountOrArgChange: false }
    );

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
        // Play notification sound for messages from other chats
        playNotificationSound();
      },
      [chatId, playNotificationSound]
    );

    const newRequestListener = useCallback(() => {
      dispatch(incrementNotification());
    }, [dispatch]);

    const refetchListener = useCallback(() => {
      // Only refetch if query is not currently loading and has been started
      if (!isLoading && !isUninitialized && data) {
        refetch();
      }
      // Only navigate to home if not currently in a chat
      // This prevents unwanted redirects on page reload
      if (!chatId) {
        navigate("/");
      }
    }, [refetch, navigate, chatId, isLoading, isUninitialized, data]);

    const onlineUsersListener = useCallback((data) => {
      setOnlineUsers(data);
    }, []);

    const watchPartyStateUpdateListener = useCallback(({ chatId: updateChatId, state }) => {
      if (!updateChatId || !state) return;
      setWatchPartyByChat((prev) => ({ ...prev, [updateChatId]: state }));
    }, []);

    const watchPartyEndedListener = useCallback(({ chatId: endedChatId }) => {
      if (!endedChatId) return;
      setWatchPartyByChat((prev) => {
        if (!prev[endedChatId]) return prev;
        const next = { ...prev };
        delete next[endedChatId];
        return next;
      });
    }, []);

    const handleRejoinParty = useCallback(
      (targetChatId) => {
        if (!targetChatId) return;
        navigate(`/chat/${targetChatId}?watchParty=1`);
        if (isMobile) dispatch(setIsMobile(false));
      },
      [navigate, isMobile, dispatch]
    );

    const eventHandlers = {
      [NEW_MESSAGE_ALERT]: newMessageAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
      [WATCH_PARTY_STATE_UPDATE]: watchPartyStateUpdateListener,
      [WATCH_PARTY_ENDED]: watchPartyEndedListener,
    };

    useSocketEvents(socket, eventHandlers);

    // Handle mobile page visibility - reconnect socket when user returns to tab
    usePageVisibility(
      () => {
        // When page becomes visible (user returns to app on mobile)
        if (!socket.connected) {
          console.log('Page visible - reconnecting socket...');
          socket.connect();
        }
        // Refetch chats to get latest data (only if query has been started)
        if (!isLoading && !isUninitialized && data) {
          refetch();
        }
      },
      () => {
        // When page is hidden (optional - could disconnect to save resources)
        // For now, keep connection alive
        console.log('Page hidden');
      }
    );

    // Fetch selected user's profile if selected
    const { data: selectedProfileData, isLoading: selectedProfileLoading } = useGetUserProfileQuery(selectedUserId, { skip: !selectedUserId });

    // Handler for chat list click: set selected user
    const handleChatListUserClick = (userId) => {
      setSelectedUserId(userId);
    };

    // Pass handler to ChatList via prop
    const { theme, themeName } = useTheme();
    
    // Get appropriate SVG based on theme
    const getBackgroundSVG = () => {
      switch(themeName) {
        case 'dark':
          return '/assets/AnimatedShape-dark.svg';
        case 'light':
          return '/assets/AnimatedShape-light.svg';
        case 'pink':
          return '/assets/AnimatedShape-pink.svg';
        case 'pinkDark':
          return '/assets/AnimatedShape-pinkDark.svg';
        case 'blue':
          return '/assets/AnimatedShape-blue.svg';
        case 'blueDark':
          return '/assets/AnimatedShape-blueDark.svg';
        default:
          return '/assets/AnimatedShape-light.svg';
      }
    };
    
    // Get sidebar background based on theme
    const getSidebarBackground = () => {
      switch(themeName) {
        case 'dark':
          return 'url(/assets/low-poly-grid-haikei-dark.svg)';
        case 'light':
          return 'url(/assets/low-poly-grid-haikei-light.svg)';
        case 'pink':
          return 'url(/assets/low-poly-grid-haikei-pink.svg)';
        case 'pinkDark':
          return 'url(/assets/low-poly-grid-haikei-pinkDark.svg)';
        case 'blue':
          return 'url(/assets/low-poly-grid-haikei-blue.svg)';
        case 'blueDark':
          return 'url(/assets/low-poly-grid-haikei-blueDark.svg)';
        default:
          return 'url(/assets/low-poly-grid-haikei-light.svg)';
      }
    };
    
    // Get profile background based on theme
    const getProfileBackground = () => {
      switch(themeName) {
        case 'dark':
          return 'url(/assets/hearts-background-dark.svg)';
        case 'light':
          return 'url(/assets/hearts-background-light.svg)';
        case 'pink':
          return 'url(/assets/hearts-background-pink.svg)';
        case 'pinkDark':
          return 'url(/assets/hearts-background-pinkDark.svg)';
        case 'blue':
          return 'url(/assets/hearts-background-blue.svg)';
        case 'blueDark':
          return 'url(/assets/hearts-background-blueDark.svg)';
        default:
          return 'url(/assets/hearts-background-light.svg)';
      }
    };
    
    return (
      <>
        <Title />
        <Header chatDetails={chatDetailsData?.chat} onStartCall={startCall} />

        {/* Audio Call Dialog (global - visible on any page) */}
        <AudioCallDialog
          callState={callState}
          callInfo={callInfo}
          participants={participants}
          muted={muted}
          onToggleMute={toggleMute}
          speakerOn={speakerOn}
          onToggleSpeaker={toggleSpeaker}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          voiceEffect={voiceEffect}
          onChangeVoiceEffect={changeVoiceEffect}
        />

        <DeleteChatMenu
          dispatch={dispatch}
          deleteMenuAnchor={deleteMenuAnchor}
        />

        {isLoading ? (
          <Skeleton />
        ) : (
          <Drawer 
            open={isMobile} 
            onClose={handleMobileClose}
            PaperProps={{
              sx: {
                background: getSidebarBackground(),
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                animation: 'backgroundShift 8s ease-in-out infinite',
                '@keyframes backgroundShift': {
                  '0%, 100%': {
                    filter: 'brightness(1) saturate(1) hue-rotate(0deg)',
                  },
                  '50%': {
                    filter: 'brightness(1.2) saturate(1.3) hue-rotate(5deg)',
                  },
                },
              }
            }}
          >
            <ChatList
              w="70vw"
              chats={data?.chats}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              onlineUsers={onlineUsers}
              onUserClick={handleChatListUserClick}
              watchPartyByChat={watchPartyByChat}
              currentUserId={user?._id}
              onRejoinParty={handleRejoinParty}
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
              background: getSidebarBackground(),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              animation: 'backgroundShift 8s ease-in-out infinite',
              '@keyframes backgroundShift': {
                '0%, 100%': {
                  filter: 'brightness(1) saturate(1) hue-rotate(0deg)',
                },
                '50%': {
                  filter: 'brightness(1.2) saturate(1.3) hue-rotate(5deg)',
                },
              },
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
                watchPartyByChat={watchPartyByChat}
                currentUserId={user?._id}
                onRejoinParty={handleRejoinParty}
              />
            )}
          </Grid>
          <Grid 
            item 
            xs={12} 
            sm={8} 
            md={5} 
            lg={6} 
            height={"100%"} 
            sx={{ 
              position: 'relative',
              backgroundImage: `url(${getBackgroundSVG()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
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
              background: getProfileBackground(),
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {chatDetailsLoading ? (
              <Skeleton />
            ) : chatDetailsData?.chat?.groupChat ? (
              // Show group members list for group chats
              <GroupMembersList 
                members={chatDetailsData.chat.members} 
                currentUserId={user._id}
              />
            ) : selectedUserId ? (
              // Show selected user profile
              selectedProfileLoading ? (
                <Skeleton />
              ) : selectedProfileData && selectedProfileData.user ? (
                <Profile user={selectedProfileData.user} />
              ) : (
                <div style={{ color: theme.TEXT_PRIMARY }}>User not found</div>
              )
            ) : (
              // Show current user profile by default
              <Profile user={user} onAvatarChange={handleAvatarChange} />
            )}
          </Grid>
        </Grid>
      </>
    );
  };
};

export default AppLayout;
