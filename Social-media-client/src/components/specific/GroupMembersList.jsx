import React, { useState } from "react";
import {
  Avatar,
  Stack,
  Typography,
  IconButton,
  Button,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  HourglassEmpty as PendingIcon,
} from "@mui/icons-material";
import { transformImage } from "../../lib/features";
import { useTheme } from "../../context/ThemeContext";
import { themes } from "../../constants/themes";
import { useAsyncMutation } from "../../hooks/hook";
import { useSendFriendRequestMutation, useCheckFriendStatusQuery } from "../../redux/api/api";

const GroupMembersList = ({ members, currentUserId, showTitle = true }) => {
  const { themeName } = useTheme();
  const theme = themes[themeName];

  return (
    <Stack spacing={2} sx={{ overflowY: "auto", maxHeight: "calc(100vh - 8rem)" }}>
      {showTitle && (
        <>
          <Typography
            variant="h6"
            sx={{
              color: theme.TEXT_PRIMARY,
              fontWeight: 600,
              textAlign: "center",
              mb: 1,
            }}
          >
            Group Members ({members?.length || 0})
          </Typography>
          <Divider sx={{ bgcolor: theme.SUBTLE_BG_30 }} />
        </>
      )}
      
      {members?.map((member) => (
        <MemberCard
          key={member._id}
          member={member}
          currentUserId={currentUserId}
          theme={theme}
        />
      ))}
    </Stack>
  );
};

const MemberCard = ({ member, currentUserId, theme }) => {
  const [sendFriendRequest, isLoadingSendFriendRequest] = useAsyncMutation(
    useSendFriendRequestMutation
  );

  // Check friend status for this member
  const { data: friendStatusData, isLoading: statusLoading } = useCheckFriendStatusQuery(
    member._id,
    { skip: member._id === currentUserId } // Skip if it's the current user
  );

  const isCurrentUser = member._id === currentUserId;
  const isFriend = friendStatusData?.isFriend;
  const hasPendingRequest = friendStatusData?.hasPendingRequest;

  const handleAddFriend = async () => {
    await sendFriendRequest("Sending friend request...", { userId: member._id });
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: theme.LIGHT_BG,
        border: `1px solid ${theme.SUBTLE_BG_20}`,
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: theme.SUBTLE_BG_20,
          transform: "translateX(4px)",
        },
      }}
    >
      <Avatar
        src={transformImage(member?.avatar?.url)}
        sx={{
          width: 50,
          height: 50,
          border: `2px solid ${theme.PRIMARY_COLOR}`,
        }}
      />

      <Stack flex={1} minWidth={0}>
        <Typography
          variant="body1"
          sx={{
            color: theme.TEXT_PRIMARY,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {member.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.TIMEAGO_COLOR,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          @{member.username}
        </Typography>
      </Stack>

      {/* Add Friend Button Logic */}
      {!isCurrentUser && (
        <Stack alignItems="center">
          {statusLoading ? (
            <CircularProgress size={24} sx={{ color: theme.PRIMARY_COLOR }} />
          ) : isFriend ? (
            <Tooltip title="Already Friends">
              <span>
                <IconButton
                  disabled
                  sx={{
                    bgcolor: theme.SUBTLE_BG_20,
                    color: theme.TEXT_PRIMARY,
                    "&.Mui-disabled": {
                      bgcolor: theme.SUBTLE_BG_20,
                      color: theme.TEXT_PRIMARY,
                    },
                  }}
                >
                  <CheckIcon />
                </IconButton>
              </span>
            </Tooltip>
          ) : hasPendingRequest ? (
            <Tooltip title="Request Pending">
              <span>
                <IconButton
                  disabled
                  sx={{
                    bgcolor: theme.SUBTLE_BG_20,
                    color: theme.TIMEAGO_COLOR,
                    "&.Mui-disabled": {
                      bgcolor: theme.SUBTLE_BG_20,
                      color: theme.TIMEAGO_COLOR,
                    },
                  }}
                >
                  <PendingIcon />
                </IconButton>
              </span>
            </Tooltip>
          ) : (
            <Tooltip title="Add Friend">
              <IconButton
                onClick={handleAddFriend}
                disabled={isLoadingSendFriendRequest.isLoading}
                sx={{
                  bgcolor: theme.PRIMARY_COLOR,
                  color: "white",
                  "&:hover": {
                    bgcolor: theme.BUTTON_ACCENT,
                  },
                  "&.Mui-disabled": {
                    bgcolor: theme.SUBTLE_BG_20,
                  },
                }}
              >
                {isLoadingSendFriendRequest.isLoading ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  <PersonAddIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}

      {isCurrentUser && (
        <Typography
          variant="caption"
          sx={{
            color: theme.PRIMARY_COLOR,
            fontWeight: 600,
            bgcolor: theme.SUBTLE_BG_20,
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          You
        </Typography>
      )}
    </Stack>
  );
};

export default GroupMembersList;
