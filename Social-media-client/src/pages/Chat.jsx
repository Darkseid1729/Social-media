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
import { isOnlyEmoji, createEmojiExplosion, injectEmojiAnimationStyles } from "../utils/emojiEffect";

import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

import { InputBox } from "../components/styles/StyledComponents";
import FileMenu from "../components/dialogs/FileMenu";
import MessageComponent from "../components/shared/MessageComponent";
import ReplyInputPreview from "../components/shared/ReplyInputPreview";
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
  MESSAGE_REPLY,
  EMOJI_EFFECT,
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
import { server } from "../constants/config";

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

  // Inject emoji animation styles on mount
  useEffect(() => {
    injectEmojiAnimationStyles();
  }, []);

  // ...existing code...
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  
  // Send sticker as message
  const handleStickerSelect = (stickerUrl) => {
    socket.emit(NEW_MESSAGE, { chatId, members, message: stickerUrl });
  };
  // Send GIF as message
  const handleGifSelect = (gifUrl) => {
    // Send GIF URL as message content
    socket.emit(NEW_MESSAGE, { chatId, members, message: gifUrl });
  };

  // Reply handlers
  const handleReply = (message) => {
    // Only allow replies to messages with valid MongoDB ObjectIds
    const isValidObjectId = (id) => {
      return id && /^[0-9a-fA-F]{24}$/.test(id);
    };

    if (isValidObjectId(message._id)) {
      setReplyToMessage(message);
    } else {
      console.warn("Cannot reply to message with invalid ObjectId:", message._id);
    }
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const handleScrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect
      messageElement.style.backgroundColor = theme.PRIMARY_COLOR + '20';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
    }
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
      //console.log("🔤 Emitting START_TYPING:", { members, chatId });
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);//clear the previous timeout

    typingTimeout.current = setTimeout(() => {
     // console.log("🔤 Emitting STOP_TYPING:", { members, chatId });
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, 1000);
  };
  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Store message and clear input immediately
    const messageToSend = message.trim();
    const replyToSend = replyToMessage;
    setMessage("");
    setReplyToMessage(null);

    // Check if message is a single emoji and trigger effect for all users
    if (isOnlyEmoji(messageToSend)) {
      // Emit to all users in the chat (including self)
      socket.emit(EMOJI_EFFECT, { chatId, members, emoji: messageToSend });
    }

    // Only send replyTo if it's a valid MongoDB ObjectId (24 char hex string)
    const isValidObjectId = (id) => {
      return id && /^[0-9a-fA-F]{24}$/.test(id);
    };

    const replyToId = replyToSend?._id;
    const validReplyTo = isValidObjectId(replyToId) ? replyToId : null;

    // Check if this is a bot chat (chat name contains "Joon")
    const chatName = chatDetails?.data?.chat?.name || "";
    const isBotChat = chatName.toLowerCase().includes('joon');

    // console.log("🔍 Bot check:", { 
    //   isBotChat, 
    //   chatName,
    //   chatId 
    // });

    if (isBotChat) {
      // Call bot API endpoint instead of socket emit
      // console.log("🤖 Calling bot API...");
      
      // First, send the user's message normally via socket
      const messageData = { 
        chatId, 
        members, 
        message: messageToSend,
        replyTo: validReplyTo
      };
      //console.log("📤 Emitting NEW_MESSAGE:", messageData);
      socket.emit(NEW_MESSAGE, messageData);
      
      // Optimistically add user's message to UI immediately
      const optimisticMessage = {
        _id: `temp-${Date.now()}`, // Temporary ID
        content: messageToSend,
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar?.url || null
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
        replyTo: replyToSend,
        isOptimistic: true // Flag to identify temporary message
      };
      setMessages((prev) => [...prev, optimisticMessage]);
      
      // Then call bot API to get response
      try {
        const response = await fetch(`${server}/api/v1/bot/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            chatId,
            message: messageToSend,
            replyTo: validReplyTo
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Bot API error:', errorData);
          // Show error to user (you can add a toast notification here)
        } else {
          // console.log("✅ Bot API call successful");
        }
        // Response will come via socket NEW_MESSAGE event
      } catch (error) {
        console.error('❌ Error calling bot API:', error);
        // Show error to user (you can add a toast notification here)
      }
    } else {
      //console.log("📤 Regular chat - using socket emit");
      // Regular chat - use socket emit
      const messageData = { 
        chatId, 
        members, 
        message: messageToSend,
        replyTo: validReplyTo
      };
      //console.log("📤 Emitting NEW_MESSAGE:", messageData);
      socket.emit(NEW_MESSAGE, messageData);
      
      // Optimistically add user's message to UI immediately
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content: messageToSend,
        sender: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar?.url || null
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
        replyTo: replyToSend,
        isOptimistic: true
      };
      setMessages((prev) => [...prev, optimisticMessage]);
    }
  };

  // Reset messages when chatId changes
  useEffect(() => {
    setMessages([]);
    setHasScrolledToBottom(false);
  }, [chatId]);

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      setHasScrolledToBottom(false);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to bottom when old messages first load (when switching chats)
  useEffect(() => {
    if (!hasScrolledToBottom && !oldMessagesChunk.isLoading && oldMessages.length > 0 && page === 1 && bottomRef.current) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "auto" });
            setHasScrolledToBottom(true);
          }
        });
      });
    }
  }, [oldMessages, page, oldMessagesChunk.isLoading, hasScrolledToBottom]);

  useEffect(() => {
    if (chatDetails.isError) return navigate("/");
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(
    (data) => {
      // console.log("📩 NEW_MESSAGE event received:", data);
      if (data.chatId !== chatId) return;

      // Replace optimistic message with real one, or just add if not found
      setMessages((prev) => {
        // Check if this message already exists (replace optimistic)
        const existingIndex = prev.findIndex(m => 
          (m.isOptimistic && m.sender._id === data.message.sender._id && 
           Math.abs(new Date(m.createdAt) - new Date(data.message.createdAt)) < 3000) // Within 3 seconds
        );
        
        if (existingIndex !== -1) {
          // Replace optimistic message with real one
          const newMessages = [...prev];
          newMessages[existingIndex] = { ...data.message, isOptimistic: false };
          return newMessages;
        }
        
        // Add new message if not replacing
        return [...prev, data.message];
      });
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

  const emojiEffectListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      // Trigger the emoji explosion for all users
      createEmojiExplosion(data.emoji, theme);
    },
    [chatId, theme]
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [MESSAGE_REACTION_ADDED]: reactionAddedListener,
    [MESSAGE_REACTION_REMOVED]: reactionRemovedListener,
    [EMOJI_EFFECT]: emojiEffectListener,
  };

  useSocketEvents(socket, eventHandler);

  useErrors(errors);

  const allMessages = [...oldMessages, ...messages];

  // Additional scroll logic: directly scroll container when messages load
  useEffect(() => {
    if (!hasScrolledToBottom && !oldMessagesChunk.isLoading && allMessages.length > 0 && page === 1 && containerRef.current) {
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  }, [allMessages.length, page, oldMessagesChunk.isLoading, hasScrolledToBottom]);

  // Get the date of the first message (if any)
  let floatingDate = "";
  if (allMessages.length > 0 && allMessages[0].createdAt) {
    floatingDate = moment(allMessages[0].createdAt).tz("Asia/Kolkata").format("DD MMM YYYY");
  }

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* ...existing code... */}

      <Stack
        ref={containerRef}
        boxSizing={"border-box"}
        padding={"1rem"}
        spacing={"1rem"}
        height={"80%"}
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
          <MessageComponent 
            key={i._id} 
            message={i} 
            user={user} 
            onReply={handleReply}
            onScrollToMessage={handleScrollToMessage}
          />
        ))}

        {userTyping && <TypingLoader />}

        <div ref={bottomRef} />
      </Stack>

      {/* Reply Input Preview */}
      <ReplyInputPreview 
        replyTo={replyToMessage} 
        onClose={handleCancelReply}
      />

      <form
        style={{
          height: "20%",
          minHeight: "80px",
        }}
        onSubmit={submitHandler}
      >
        <Stack
          direction={"row"}
          height={"100%"}
          padding={"1rem"}
          alignItems={"flex-end"}
          position={"relative"}
          gap={"0.8rem"}
        >
          {/* Left side - File attachment icon */}
          <IconButton
            sx={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              rotate: "30deg",
            }}
            onClick={handleFileOpen}
          >
            <AttachFileIcon />
          </IconButton>

          {/* Input Container with scrollable input and sticker icon stacked on right */}
          <div style={{ flex: 1, display: 'flex', gap: '0.8rem', alignItems: 'flex-end' }}>
            <textarea
              placeholder="Type Message Here..."
              value={message}
              onChange={messageOnChange}
              rows={2}
              className="custom-scrollbar"
              style={{
                flex: 1,
                maxHeight: '8rem',
                minHeight: '5rem',
                fontSize: '1.15rem',
                padding: '0.8rem 1rem',
                paddingLeft: '3rem',
                borderRadius: '1.5rem',
                border: `1.5px solid ${theme.SUBTLE_BG_20}`,
                background: theme.LIGHT_BG,
                color: theme.TEXT_PRIMARY,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease-in-out',
                overflowY: 'auto',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5',
                scrollbarWidth: 'thin',
                scrollbarColor: `${theme.SUBTLE_BG_30} transparent`,
              }}
              onFocus={e => {
                e.target.style.border = `2px solid ${theme.PRIMARY_COLOR}`;
                e.target.style.minHeight = '6rem';
                e.target.style.maxHeight = '10rem';
              }}
              onBlur={e => {
                e.target.style.border = `1.5px solid ${theme.SUBTLE_BG_20}`;
                e.target.style.minHeight = '5rem';
                e.target.style.maxHeight = '8rem';
              }}
            />

            {/* Right side - Sticker and Send buttons stacked vertically */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <IconButton
                sx={{
                  rotate: "0deg",
                  width: '2.5rem',
                  height: '2.5rem',
                  color: 'white',
                  "&:hover": {
                    backgroundColor: '#ff5252',
                    color: 'white',
                  },
                  "&:active": {
                    backgroundColor: '#d32f2f',
                    color: 'white',
                  },
                }}
                onClick={() => setStickerPickerOpen(true)}
              >
                <EmojiEmotionsIcon />
              </IconButton>

              <IconButton
                type="submit"
                sx={{
                  rotate: "-30deg",
                  bgcolor: theme.BUTTON_ACCENT,
                  color: "white",
                  width: '2.5rem',
                  height: '2.5rem',
                  padding: "0.5rem",
                  "&:hover": {
                    bgcolor: "error.dark",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </div>
          </div>
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
  
  // Fetch chat details for the header
  const { data: chatDetailsData } = useChatDetailsQuery(
    { chatId, populate: true }, 
    { skip: !chatId }
  );
  
  return (
    <>
      <Header chatId={chatId} chatDetails={chatDetailsData?.chat} />
      <Chat chatId={chatId} {...props} />
    </>
  );
};
