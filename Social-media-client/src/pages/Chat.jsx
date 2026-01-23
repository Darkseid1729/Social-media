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
import YouTubeSearchDialog from "../components/dialogs/YouTubeSearchDialog";
import { IconButton, Skeleton, Stack, Box, useMediaQuery } from "@mui/material";
import { useTheme } from "../context/ThemeContext";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import { useNotificationSound } from "../context/NotificationSoundContext";
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
import YouTubeInputPreview from "../components/shared/YouTubeInputPreview";
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
  MESSAGE_DELETED,
} from "../constants/events";
import { useChatDetailsQuery, useGetMessagesQuery } from "../redux/api/api";
import { useErrors, useSocketEvents } from "../hooks/hook";
import { useInfiniteScrollTop } from "6pp";
import moment from "moment";
import "moment-timezone";
import { useDispatch, useSelector } from "react-redux";
import { setIsFileMenu, clearTargetMessage, setTargetMessage } from "../redux/reducers/misc";
import { removeNewMessagesAlert } from "../redux/reducers/chat";
import { TypingLoader } from "../components/layout/Loaders";
import { useNavigate } from "react-router-dom";
import { useSetWallpaperMutation } from "../redux/api/api";
import { server } from "../constants/config";
import toast from "react-hot-toast";
import axios from "axios";

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
  const { currentSong } = useMusicPlayer();
  const { playNotificationSound } = useNotificationSound();
  const isMobile = useMediaQuery('(max-width:900px)');
  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get target message from Redux (for jump-to-message feature)
  const { targetMessage } = useSelector((state) => state.misc);
  const [isJumpingToMessage, setIsJumpingToMessage] = useState(false);
  
  // State for bidirectional scroll after jumping to a message
  const [isInJumpMode, setIsInJumpMode] = useState(false);
  const [hasMoreAbove, setHasMoreAbove] = useState(false);
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const [loadingMoreAbove, setLoadingMoreAbove] = useState(false);
  const [loadingMoreBelow, setLoadingMoreBelow] = useState(false);
  const [jumpedMessages, setJumpedMessages] = useState([]); // Messages after jump

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Inject emoji animation styles on mount
  useEffect(() => {
    injectEmojiAnimationStyles();
  }, []);

  // ...existing code...
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [youtubePickerOpen, setYoutubePickerOpen] = useState(false);
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [selectedYouTubeVideo, setSelectedYouTubeVideo] = useState(null);
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
  
  // Handle YouTube video selection
  const handleYouTubeSelect = (videoUrl) => {
    // Store video URL separately, don't add to message input
    setSelectedYouTubeVideo(videoUrl);
  };

  // Handle clearing YouTube video selection
  const handleClearYouTubeVideo = () => {
    setSelectedYouTubeVideo(null);
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

  // Refs for debouncing scroll and tracking state reliably in scroll handler
  const scrollDebounceRef = useRef(null);
  const isLoadingRef = useRef({ above: false, below: false });
  const hasMoreRef = useRef({ above: false, below: false });
  const loadCooldownRef = useRef({ above: false, below: false });

  // Keep refs in sync with state
  useEffect(() => {
    hasMoreRef.current.above = hasMoreAbove;
    hasMoreRef.current.below = hasMoreBelow;
  }, [hasMoreAbove, hasMoreBelow]);

  // Load more messages when scrolling (for jump mode - bidirectional)
  const loadMoreMessages = useCallback(async (direction) => {
    if (!isInJumpMode) return;
    
    // Use refs to check state (more reliable than state in scroll handler)
    const key = direction === 'older' ? 'above' : 'below';
    if (!hasMoreRef.current[key] || isLoadingRef.current[key] || loadCooldownRef.current[key]) {
      return;
    }

    const currentMessages = [...messages];
    if (currentMessages.length === 0) return;

    const timestamp = direction === 'older' 
      ? currentMessages[0]?.createdAt 
      : currentMessages[currentMessages.length - 1]?.createdAt;

    if (!timestamp) return;

    // Set loading state immediately
    isLoadingRef.current[key] = true;
    if (direction === 'older') {
      setLoadingMoreAbove(true);
    } else {
      setLoadingMoreBelow(true);
    }

    try {
      const { data } = await axios.get(
        `${server}/api/v1/chat/messages/${chatId}/more?timestamp=${timestamp}&direction=${direction}`,
        { withCredentials: true }
      );

      if (data.success && data.messages.length > 0) {
        setMessages(prev => {
          // Filter out any duplicates by checking IDs
          const existingIds = new Set(prev.map(m => m._id));
          const newMessages = data.messages.filter(m => !existingIds.has(m._id));
          
          if (newMessages.length === 0) return prev;
          
          if (direction === 'older') {
            return [...newMessages, ...prev];
          } else {
            return [...prev, ...newMessages];
          }
        });

        // Update hasMore flags (both state and ref immediately)
        if (direction === 'older') {
          hasMoreRef.current.above = data.hasMore;
          setHasMoreAbove(data.hasMore);
        } else {
          hasMoreRef.current.below = data.hasMore;
          setHasMoreBelow(data.hasMore);
          
          // Exit jump mode if we've caught up to the latest messages
          if (!data.hasMore) {
            setIsInJumpMode(false);
          }
        }
      } else {
        // No more messages - update immediately
        hasMoreRef.current[key] = false;
        if (direction === 'older') {
          setHasMoreAbove(false);
        } else {
          setHasMoreBelow(false);
          // Exit jump mode - we've caught up
          setIsInJumpMode(false);
        }
      }
    } catch (error) {
      console.error(`Error loading ${direction} messages:`, error);
    } finally {
      isLoadingRef.current[key] = false;
      if (direction === 'older') {
        setLoadingMoreAbove(false);
      } else {
        setLoadingMoreBelow(false);
      }
      
      // Add cooldown to prevent immediate re-trigger
      loadCooldownRef.current[key] = true;
      setTimeout(() => {
        loadCooldownRef.current[key] = false;
      }, 500);
    }
  }, [isInJumpMode, messages, chatId]);

  // Scroll handler for bidirectional loading in jump mode
  useEffect(() => {
    if (!isInJumpMode || !containerRef.current) return;

    const container = containerRef.current;
    
    const handleScroll = () => {
      // Debounce scroll handling
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
      
      scrollDebounceRef.current = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        
        // Load older messages when scrolled near top (use refs for all checks)
        if (scrollTop < 100 && hasMoreRef.current.above && !isLoadingRef.current.above && !loadCooldownRef.current.above) {
          loadMoreMessages('older');
        }
        
        // Load newer messages when scrolled near bottom
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        if (distanceFromBottom < 100 && hasMoreRef.current.below && !isLoadingRef.current.below && !loadCooldownRef.current.below) {
          loadMoreMessages('newer');
        }
      }, 150); // 150ms debounce
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollDebounceRef.current) {
        clearTimeout(scrollDebounceRef.current);
      }
    };
  }, [isInJumpMode, loadMoreMessages]);

  // Exit jump mode when chat changes
  useEffect(() => {
    setIsInJumpMode(false);
    setHasMoreAbove(false);
    setHasMoreBelow(false);
    setJumpedMessages([]);
  }, [chatId]);

  const handleScrollToMessage = (messageId) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add a highlight effect with animation
      messageElement.style.transition = 'background-color 0.3s ease';
      messageElement.style.backgroundColor = theme.PRIMARY_COLOR + '40';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2500);
    } else {
      // Message not in current view - trigger jump via Redux
      dispatch(setTargetMessage({
        chatId: chatId,
        messageId: messageId,
      }));
    }
  };

  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page }, { 
    skip: !chatId,
    refetchOnMountOrArgChange: false, // Prevent excessive refetches on mobile
    refetchOnReconnect: true // Only refetch when reconnecting
  });

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
    
    // Allow sending if there's a message OR a YouTube video
    if (!message.trim() && !selectedYouTubeVideo) return;

    // Store message and clear input immediately
    const messageText = message.trim();
    const videoUrl = selectedYouTubeVideo;
    const replyToSend = replyToMessage;
    
    // Combine video URL and message text
    const messageToSend = videoUrl 
      ? (messageText ? `${videoUrl} ${messageText}` : videoUrl)
      : messageText;
    
    // Check if message is only one word (ban dry replies)
    // Split by spaces and filter out empty strings
    const words = messageToSend.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Only check for single word if it's not a URL (like sticker, gif, youtube) or emoji
    const isUrl = messageToSend.startsWith('http://') || 
                   messageToSend.startsWith('https://') ||
                   messageToSend.includes('cloudinary.com') ||
                   messageToSend.includes('giphy.com') ||
                   messageToSend.includes('youtube.com') ||
                   messageToSend.includes('youtu.be');
    
    const isEmoji = isOnlyEmoji(messageToSend);
    
    if (words.length === 1 && !isUrl && !isEmoji) {
      toast.error("banned dry reply", {
        duration: 2000,
        position: "top-center",
      });
      return;
    }
    
    setMessage("");
    setSelectedYouTubeVideo(null);
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
      socket.emit(NEW_MESSAGE, messageData);
      
      // Message will appear after server confirmation via socket event
      
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
      socket.emit(NEW_MESSAGE, messageData);
      
      // Message will appear after server confirmation via socket event
    }
  };

  // Reset messages when chatId changes - IMMEDIATE reset before anything else
  useEffect(() => {
    // Immediately clear everything
    setMessages([]);
    setOldMessages([]);
    setPage(1);
    setHasScrolledToBottom(false);
  }, [chatId]);

  // Synchronize oldMessages with query data when page 1 loads for new chat
  useEffect(() => {
    if (page === 1 && oldMessagesChunk.data?.messages && !oldMessagesChunk.isLoading) {
      // Only set if it's actually different (prevent unnecessary updates)
      setOldMessages(oldMessagesChunk.data.messages);
    }
  }, [chatId, page, oldMessagesChunk.data?.messages, oldMessagesChunk.isLoading]);

  useEffect(() => {
    // Join chat room when component mounts or chatId changes
    // Wait a bit to ensure socket is connected
    const joinChat = () => {
      if (socket.connected && user?._id && members) {
        socket.emit(CHAT_JOINED, { userId: user._id, members });
        dispatch(removeNewMessagesAlert(chatId));
      } else {
        // If not connected, wait and retry
        setTimeout(joinChat, 100);
      }
    };
    
    joinChat();

    return () => {
      setMessages([]);
      setMessage("");
      setOldMessages([]);
      setPage(1);
      setHasScrolledToBottom(false);
      if (socket.connected && user?._id && members) {
        socket.emit(CHAT_LEAVED, { userId: user._id, members });
      }
    };
  }, [chatId]);

  // Handle socket reconnection - rejoin chat and refetch messages
  useEffect(() => {
    const handleReconnect = () => {
      // Always rejoin on reconnection, using current chatId
      if (chatId && user?._id && members) {
        socket.emit(CHAT_JOINED, { userId: user._id, members });
        // Refetch messages to get any missed during disconnect
        oldMessagesChunk.refetch();
      }
    };

    const handleDisconnect = () => {
      // Visual indicator could be added here
    };

    const handleConnect = () => {
      // Rejoin chat if we're in one
      if (chatId && user?._id && members) {
        socket.emit(CHAT_JOINED, { userId: user._id, members });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
    };
  }, [chatId, members, user?._id]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Scroll to bottom when old messages first load (when switching chats)
  useEffect(() => {
    // Don't scroll to bottom if we're jumping to a specific message
    if (targetMessage.messageId && targetMessage.chatId === chatId) return;
    
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
  }, [oldMessages, page, oldMessagesChunk.isLoading, hasScrolledToBottom, targetMessage]);

  // Jump to specific message when coming from search (like WhatsApp)
  useEffect(() => {
    const jumpToMessage = async () => {
      // Check if we have a target message for this chat
      if (!targetMessage.messageId || targetMessage.chatId !== chatId) return;
      if (isJumpingToMessage) return; // Prevent multiple calls

      setIsJumpingToMessage(true);

      try {
        // Fetch messages around the target message
        const { data } = await axios.get(
          `${server}/api/v1/chat/messages/${chatId}/around/${targetMessage.messageId}`,
          { withCredentials: true }
        );

        if (data.success && data.messages) {
          // Enter jump mode for bidirectional scrolling
          setIsInJumpMode(true);
          setJumpedMessages(data.messages);
          setHasMoreAbove(data.hasMoreAbove);
          setHasMoreBelow(data.hasMoreBelow);
          
          // Replace current messages with the fetched ones
          setMessages(data.messages);
          setPage(1); // Reset pagination
          setHasScrolledToBottom(true); // Prevent auto-scroll to bottom

          // Wait for DOM to update, then scroll to the target message
          setTimeout(() => {
            const messageElement = document.getElementById(`message-${targetMessage.messageId}`);
            if (messageElement) {
              // Scroll to the message
              messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Highlight the message with animation
              messageElement.style.transition = 'background-color 0.3s ease';
              messageElement.style.backgroundColor = theme.PRIMARY_COLOR + '40';
              
              // Remove highlight after animation
              setTimeout(() => {
                messageElement.style.backgroundColor = '';
              }, 2500);
            }
            
            // Clear the target message from Redux after jumping
            dispatch(clearTargetMessage());
            setIsJumpingToMessage(false);
          }, 300);
        }
      } catch (error) {
        console.error("Error jumping to message:", error);
        toast.error("Could not jump to message");
        dispatch(clearTargetMessage());
        setIsJumpingToMessage(false);
      }
    };

    jumpToMessage();
  }, [targetMessage, chatId, dispatch, theme.PRIMARY_COLOR]);

  // Only redirect if it's a 404 error (chat not found), not on loading/network errors
  useEffect(() => {
    // Don't check for errors while chatDetails is still loading
    if (chatDetails.isLoading) return;
    
    if (chatDetails.isError) {
      const errorStatus = chatDetails.error?.status;
      // Only navigate away if chat doesn't exist (404), not on network/timeout errors
      if (errorStatus === 404) {
        navigate("/");
      }
      // For other errors (500, network, timeout), stay on page - user might reload to fix it
    }
  }, [chatDetails.isError, chatDetails.error, chatDetails.isLoading]);

  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;

      // Only add message if it doesn't already exist (prevent duplicates)
      setMessages((prev) => {
        const exists = prev.some(m => m._id === data.message._id);
        if (exists) return prev;
        
        return [...prev, data.message];
      });
      
      // Play notification sound if the message is from another user
      if (data.message.sender._id !== user._id) {
        playNotificationSound();
      }
    },
    [chatId, user._id, playNotificationSound]
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

  const messageDeletedListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      // Remove the deleted message from state
      setMessages((prev) => prev.filter(msg => msg._id !== data.messageId));
    },
    [chatId]
  );

  const handleDeleteMessage = useCallback((messageId) => {
    // Immediately remove from local state when user deletes their own message
    setMessages((prev) => prev.filter(msg => msg._id !== messageId));
  }, []);

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
    [MESSAGE_REACTION_ADDED]: reactionAddedListener,
    [MESSAGE_REACTION_REMOVED]: reactionRemovedListener,
    [EMOJI_EFFECT]: emojiEffectListener,
    [MESSAGE_DELETED]: messageDeletedListener,
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

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        paddingTop: (currentSong && isMobile) ? '60px' : 0, 
        transition: 'padding-top 0.3s ease',
        overflow: 'hidden',
      }}>
        <Stack
          ref={containerRef}
          boxSizing={"border-box"}
          padding={"1rem"}
          spacing={"1rem"}
          sx={{
            flex: 1,
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
            onDelete={handleDeleteMessage}
          />
        ))}

        {userTyping && <TypingLoader />}

        <div ref={bottomRef} />
      </Stack>

      <form
        style={{
          minHeight: "80px",
          maxHeight: "fit-content",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onSubmit={submitHandler}
      >
        {/* YouTube Video Preview */}
        <YouTubeInputPreview
          videoUrl={selectedYouTubeVideo}
          onClose={handleClearYouTubeVideo}
        />

        {/* Reply Input Preview */}
        <ReplyInputPreview 
          replyTo={replyToMessage} 
          onClose={handleCancelReply}
        />

        <Stack
          direction={"row"}
          padding={"1rem"}
          alignItems={"flex-end"}
          position={"relative"}
          gap={"0.8rem"}
          sx={{ overflowX: "hidden" }}
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
      </Box>

      <FileMenu 
        anchorE1={fileMenuAnchor} 
        chatId={chatId} 
        onGifClick={() => setGifPickerOpen(true)}
        onYouTubeClick={() => setYoutubePickerOpen(true)}
      />
      {/* Sticker Picker Dialog */}
      <StickerPicker open={stickerPickerOpen} onClose={() => setStickerPickerOpen(false)} onSelect={handleStickerSelect} />
      <GifPicker open={gifPickerOpen} onClose={() => setGifPickerOpen(false)} onSelect={handleGifSelect} />
      <YouTubeSearchDialog open={youtubePickerOpen} onClose={() => setYoutubePickerOpen(false)} onSelect={handleYouTubeSelect} />
    </Fragment>
  );
};

export default AppLayout()(React.memo(Chat));


export const ChatWithHeader = (props) => {
  const { chatId } = useParams();
  const chatRef = useRef(null);
  
  // Fetch chat details for the header
  const { data: chatDetailsData } = useChatDetailsQuery(
    { chatId, populate: true }, 
    { skip: !chatId }
  );
  
  const handleSearchMessageClick = (messageId) => {
    // Scroll to the message
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add highlight effect
      const highlightColor = '#ffeb3b40'; // Yellow highlight
      const originalBackground = messageElement.style.backgroundColor;
      messageElement.style.backgroundColor = highlightColor;
      messageElement.style.transition = 'background-color 0.3s ease';
      
      setTimeout(() => {
        messageElement.style.backgroundColor = originalBackground || '';
      }, 2000);
    }
  };
  
  return (
    <>
      <Header 
        chatId={chatId} 
        chatDetails={chatDetailsData?.chat} 
        onSearchMessageClick={handleSearchMessageClick}
      />
      <Chat chatId={chatId} ref={chatRef} {...props} />
    </>
  );
};
