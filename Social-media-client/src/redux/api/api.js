
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { server } from "../../constants/config";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${server}/api/v1/`,
    timeout: 15000, // 15 second timeout for mobile networks
  }),
  tagTypes: ["Chat", "User", "Message"],
  keepUnusedDataFor: 300, // Keep cached data for 5 minutes

  endpoints: (builder) => ({
    updateAvatar: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("avatar", file);
        return {
          url: "user/avatar",
          method: "PUT",
          body: formData,
          credentials: "include",
        };
      },
      invalidatesTags: ["User"],
    }),
    setWallpaper: builder.mutation({
      query: ({ chatId, file }) => {
        const formData = new FormData();
        formData.append("avatar", file);
        formData.append("chatId", chatId);
        return {
          url: "chat/wallpaper",
          method: "PUT",
          body: formData,
          credentials: "include",
        };
      },
      invalidatesTags: ["Chat"],
    }),

    myChats: builder.query({
      query: () => ({
        url: "chat/my",
        credentials: "include",
      }),
      providesTags: ["Chat"],//cache data milega 
    }),

    // Previous: Partial match by username (commented out)
    // searchUser: builder.query({
    //   query: (name) => ({
    //     url: `user/search?name=${name}`,
    //     credentials: "include",
    //   }),
    //   providesTags: ["User"],
    // }),

    // New: Exact match by username
    
    searchUser: builder.query({
      query: (username) => ({
        url: `user/search?username=${username}`,
        credentials: "include",
      }),
      providesTags: ["User"],
      
    }),

    sendFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/sendrequest",
        method: "PUT",
        credentials: "include",
        body: data,
      }),
      invalidatesTags: ["User", "Chat"],
    }),

    getNotifications: builder.query({
      query: () => ({
        url: `user/notifications`,
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),

    acceptFriendRequest: builder.mutation({
      query: (data) => ({
        url: "user/acceptrequest",
        method: "PUT",
        credentials: "include",
        body: data,
      }),
      invalidatesTags: ["Chat"],
    }),

    chatDetails: builder.query({
      query: ({ chatId, populate = false }) => {
        let url = `chat/${chatId}`;
        if (populate) url += "?populate=true";

        return {
          url,
          credentials: "include",
        };
      },
      providesTags: ["Chat"],
    }),

    getMessages: builder.query({
      query: ({ chatId, page }) => ({
        url: `chat/message/${chatId}?page=${page}`,
        credentials: "include",
      }),
      keepUnusedDataFor: 0,
    }),

    sendAttachments: builder.mutation({
      query: (data) => ({
        url: "chat/message",
        method: "POST",
        credentials: "include",
        body: data,
      }),
    }),

    addMessageReaction: builder.mutation({
      query: ({ messageId, emoji }) => ({
        url: "chat/reaction/add",
        method: "POST",
        credentials: "include",
        body: { messageId, emoji },
      }),
    }),

    removeMessageReaction: builder.mutation({
      query: ({ messageId, emoji }) => ({
        url: "chat/reaction/remove",
        method: "POST",
        credentials: "include",
        body: { messageId, emoji },
      }),
    }),

    myGroups: builder.query({
      query: () => ({
        url: "chat/my/groups",
        credentials: "include",
      }),
      providesTags: ["Chat"],
    }),

    availableFriends: builder.query({
      query: (chatId) => {
        let url = `user/friends`;
        if (chatId) url += `?chatId=${chatId}`;

        return {
          url,
          credentials: "include",
        };
      },
      providesTags: ["Chat"],
    }),

    newGroup: builder.mutation({
      query: ({ name, members }) => ({
        url: "chat/new",
        method: "POST",
        credentials: "include",
        body: { name, members },
      }),
      invalidatesTags: ["Chat"],
    }),

    renameGroup: builder.mutation({
      query: ({ chatId, name }) => ({
        url: `chat/${chatId}`,
        method: "PUT",
        credentials: "include",
        body: { name },
      }),
      invalidatesTags: ["Chat"],
    }),

    removeGroupMember: builder.mutation({
      query: ({ chatId, userId }) => ({
        url: `chat/removemember`,
        method: "PUT",
        credentials: "include",
        body: { chatId, userId },
      }),
      invalidatesTags: ["Chat"],
    }),

    addGroupMembers: builder.mutation({
      query: ({ members, chatId }) => ({
        url: `chat/addmembers`,
        method: "PUT",
        credentials: "include",
        body: { members, chatId },
      }),
      invalidatesTags: ["Chat"],
    }),

    deleteChat: builder.mutation({
      query: (chatId) => ({
        url: `chat/${chatId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),

    leaveGroup: builder.mutation({
      query: (chatId) => ({
        url: `chat/leave/${chatId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Chat"],
    }),

    // Get another user's public profile by ID
    getUserProfile: builder.query({
      query: (id) => ({
        url: `user/${id}`,
        credentials: "include",
      }),
      providesTags: ["User"],
    }),

    // Check friend status with a user
    checkFriendStatus: builder.query({
      query: (userId) => ({
        url: `user/friend-status/${userId}`,
        credentials: "include",
      }),
      providesTags: ["User"],
    }),

    // Get chat media (photos and videos)
    getChatMedia: builder.query({
      query: ({ chatId, type, page = 1, limit = 50 }) => {
        let url = `chat/media/${chatId}?page=${page}&limit=${limit}`;
        if (type) url += `&type=${type}`;
        
        return {
          url,
          credentials: "include",
        };
      },
      providesTags: ["Message"],
      serializeQueryArgs: ({ queryArgs }) => {
        // Only use chatId and type for cache key (ignore page)
        return { chatId: queryArgs.chatId, type: queryArgs.type };
      },
      merge: (currentCache, newItems, { arg }) => {
        // Merge paginated results
        if (arg.page === 1) {
          return newItems;
        }
        return {
          ...newItems,
          media: [...(currentCache.media || []), ...(newItems.media || [])],
        };
      },
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
    }),

    // Delete message
    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `chat/message/${messageId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Message"],
    }),
  }),
});

export default api;
export const {
  useMyChatsQuery,
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
  useGetNotificationsQuery,
  useAcceptFriendRequestMutation,
  useChatDetailsQuery,
  useGetMessagesQuery,
  useSendAttachmentsMutation,
  useAddMessageReactionMutation,
  useRemoveMessageReactionMutation,
  useMyGroupsQuery,
  useAvailableFriendsQuery,
  useNewGroupMutation,
  useRenameGroupMutation,
  useRemoveGroupMemberMutation,
  useAddGroupMembersMutation,
  useDeleteChatMutation,
  useLeaveGroupMutation,
  useUpdateAvatarMutation,
  useGetUserProfileQuery,
  useSetWallpaperMutation,
  useCheckFriendStatusQuery,
  useGetChatMediaQuery,
  useDeleteMessageMutation,
} = api;

