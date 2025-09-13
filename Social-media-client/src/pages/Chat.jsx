// Export a version with Header and Chat for direct use in routing
import { useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import StickerPicker from "../components/dialogs/StickerPicker";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import AppLayout from "../components/layout/AppLayout";
import GifPicker from "../components/dialogs/GifPicker";
import { IconButton, Skeleton, Stack } from "@mui/material";
import { useTheme } from "../context/ThemeContext";
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  EmojiEmotions as EmojiEmotionsIcon,
} from "@mui/icons-material";

import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import { InputBox } from "../components/styles/StyledComponents";
import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import { getSocket } from "../socket";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
  MESSAGE_REACTION_ADDED,
  MESSAGE_REACTION_REMOVED,
} from "../constants/events";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useInfiniteScrollTop } from "6pp";
import moment from "moment";
import "moment-timezone";
import { useDispatch } from "react-redux";
import { setIsFileMenu } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "../components/layout/Loaders";
import { useNavigate } from "react-router-dom";
import { useSetWallpaperMutation } from "../redux/api/api";

const Chat = ({ chatId, user }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [wallpaperFile, setWallpaperFile] = useState(null);
  const [isWallpaperUploading, setIsWallpaperUploading] = useState(false);
  const [showWallpaperInput, setShowWallpaperInput] = useState(false);
  const [wallpaperError, setWallpaperError] = useState("");
  const [setWallpaper] = useSetWallpaperMutation();
  const { theme } = useTheme();
  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // ...existing code...
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  // Send sticker as message
  const handleStickerSelect = (stickerUrl) => {
    socket.emit(NEW_MESSAGE, { chatId, members, message: stickerUrl });
  };
  // Send GIF as message
  const handleGifSelect = (gifUrl) => {
    // Send GIF URL as message content
    socket.emit(NEW_MESSAGE, { chatId, members, message: gifUrl });
  };

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.chat?.members;

  const messageOnChange = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);//clear the previous timeout

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, 1000);
  };
  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Emitting the message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");
  };

  // Reset messages when chatId changes
  useEffect(() => {
    setMessages([]);
  }, [chatId]);

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatDetails.isError) return navigate("/");
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "djasdhajksdhasdsadasdas",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const reactionAddedListener = useCallback(
    (data) => {
      if (data.messageId) {
        setMessages((prev) => 
          prev.map((msg) => {
            if (msg._id === data.messageId) {
              const reactions = msg.reactions || [];
              // Check if user already has this reaction
              const existingIndex = reactions.findIndex(
                r => r.user._id === data.reaction.user._id && r.emoji === data.reaction.emoji
              );
              
              if (existingIndex === -1) {
                return {
                  ...msg,
                  reactions: [...reactions, data.reaction]
                };
              }
            }
            return msg;
          })
        );
      }
    },
    []
  );

  const reactionRemovedListener = useCallback(
    (data) => {
      if (data.messageId) {
        setMessages((prev) => 
          prev.map((msg) => {
            if (msg._id === data.messageId) {
              const reactions = msg.reactions || [];
              return {
                ...msg,
                reactions: reactions.filter(
                  r => !(r.user._id === data.userId && r.emoji === data.emoji)
                )
              };
            }
            return msg;
          })
        );
      }
    },
    []
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [MESSAGE_REACTION_ADDED]: reactionAddedListener,
    [MESSAGE_REACTION_REMOVED]: reactionRemovedListener,
  };

  useSocketEvents(socket, eventHandler);

  useErrors(errors);

  const allMessages = [...oldMessages, ...messages];

  // Get the date of the first message (if any)
  let floatingDate = "";
  if (allMessages.length > 0 && allMessages[0].createdAt) {
    floatingDate = moment(allMessages[0].createdAt).tz("Asia/Kolkata").format("DD MMM YYYY");
  }

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      {/* ...existing code... */}

      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        height={"90%"}
        sx={{
          overflowX: "hidden",
          overflowY: "auto",
          background: chatDetails?.data?.chat?.wallpaper
            ? `url(${chatDetails.data.chat.wallpaper}) center/cover no-repeat`
            : theme.LIGHT_BG,
          position: 'relative',
        }}
      >
        {/* Floating date at the top */}
        {floatingDate && (
          <div style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            margin: '0 auto 1.2rem auto',
            width: 'fit-content',
            background: theme.LIGHT_BG,
            color: theme.TIMEAGO_COLOR,
            borderRadius: 8,
            padding: '0.25rem 1rem',
            fontSize: '0.85rem',
            boxShadow: '0 1px 4px 0 rgba(0,0,0,0.07)',
            zIndex: 2,
          }}>
            {floatingDate}
          </div>
        )}
        {allMessages.map((i) => (
          <MessageComponent key={i._id} message={i} user={user} />
        ))}

        {userTyping && <TypingLoader />}

        <div ref={bottomRef} />
      </Stack>

      <form
        style={{
          height: "10%",
        }}
        onSubmit={submitHandler}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"center"}
          position={"relative"}
        >
          <IconButton
            sx={{
              position: "absolute",
              left: "1.5rem",
              rotate: "30deg",
            }}
            onClick={handleFileOpen}
          >
            <AttachFileIcon />
          </IconButton>

          {/* Emoji Icon for stickers */}
          <IconButton
            sx={{
              position: "absolute",
              left: "4.5rem",
              rotate: "0deg",
            }}
            onClick={() => setStickerPickerOpen(true)}
          >
            <EmojiEmotionsIcon />
          </IconButton>

          <InputBox
            placeholder="Type Message Here..."
            value={message}
            onChange={messageOnChange}
            style={{
              height: '3.2rem',
              fontSize: '1.15rem',
              padding: '0 5.5rem 0 7rem', // more left padding to avoid overlap
              borderRadius: '1.5rem',
              border: `1.5px solid ${theme.SUBTLE_BG_20}`,
              background: theme.LIGHT_BG,
              color: theme.TEXT_PRIMARY,
              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => e.target.style.border = `2px solid ${theme.PRIMARY_COLOR}`}
            onBlur={e => e.target.style.border = `1.5px solid ${theme.SUBTLE_BG_20}`}
          />

          <IconButton
            type="submit"
            sx={{
              rotate: "-30deg",
              bgcolor: theme.BUTTON_ACCENT,
              color: "white",
              marginLeft: "1rem",
              padding: "0.5rem",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </form>

      <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} onGifClick={() => setGifPickerOpen(true)} />
      {/* Sticker Picker Dialog */}
      <StickerPicker open={stickerPickerOpen} onClose={() => setStickerPickerOpen(false)} onSelect={handleStickerSelect} />
      <GifPicker open={gifPickerOpen} onClose={() => setGifPickerOpen(false)} onSelect={handleGifSelect} />
    </Fragment>
  );
};

export default AppLayout()(Chat);


export const ChatWithHeader = (props) => {
  const { chatId } = useParams();
  return (
    <>
      <Header chatId={chatId} />
      <Chat chatId={chatId} {...props} />
    </>
  );
};
