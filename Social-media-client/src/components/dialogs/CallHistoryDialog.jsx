import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Avatar,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Phone as PhoneIcon,
  PhoneMissed as PhoneMissedIcon,
  CallReceived as CallReceivedIcon,
  CallMade as CallMadeIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { useGetCallHistoryQuery } from "../../redux/api/api";
import moment from "moment";
import { useSelector } from "react-redux";

const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const statusConfig = {
  answered: { color: "success", icon: <PhoneIcon fontSize="small" /> },
  missed: { color: "error", icon: <PhoneMissedIcon fontSize="small" /> },
  rejected: { color: "warning", icon: <PhoneMissedIcon fontSize="small" /> },
  failed: { color: "default", icon: <PhoneMissedIcon fontSize="small" /> },
};

const CallHistoryDialog = ({ open, onClose, chatId }) => {
  const [page, setPage] = useState(1);
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, isFetching } = useGetCallHistoryQuery(
    { chatId, page },
    { skip: !open || !chatId }
  );

  const calls = data?.calls || [];
  const totalPages = data?.totalPages || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PhoneIcon />
        Call History
        <IconButton onClick={onClose} sx={{ ml: "auto" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 200 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : calls.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={4}>
            No call history yet
          </Typography>
        ) : (
          <Stack spacing={1}>
            {calls.map((call) => {
              const isCaller = call.caller?._id === user?._id;
              const conf = statusConfig[call.status] || statusConfig.failed;

              return (
                <Box
                  key={call._id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  {/* Direction icon */}
                  <Box sx={{ color: conf.color === "success" ? "success.main" : conf.color === "error" ? "error.main" : "text.secondary" }}>
                    {isCaller ? <CallMadeIcon /> : <CallReceivedIcon />}
                  </Box>

                  {/* Caller avatar */}
                  <Avatar
                    src={call.caller?.avatar?.url}
                    sx={{ width: 36, height: 36 }}
                  >
                    {call.caller?.name?.[0]}
                  </Avatar>

                  {/* Details */}
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {isCaller ? "You" : call.caller?.name || "Unknown"}
                      {call.isGroup && (
                        <GroupIcon sx={{ fontSize: 14, ml: 0.5, verticalAlign: "middle" }} />
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(call.startedAt || call.createdAt).format("MMM D, h:mm A")}
                    </Typography>
                  </Box>

                  {/* Status + duration */}
                  <Stack alignItems="flex-end" spacing={0.5}>
                    <Chip
                      label={call.status}
                      size="small"
                      color={conf.color}
                      icon={conf.icon}
                      variant="outlined"
                      sx={{ textTransform: "capitalize", height: 24 }}
                    />
                    {call.status === "answered" && call.duration > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {formatDuration(call.duration)}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" gap={1} pt={1}>
                <Button
                  size="small"
                  disabled={page === 1 || isFetching}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Typography variant="caption" alignSelf="center">
                  {page} / {totalPages}
                </Typography>
                <Button
                  size="small"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CallHistoryDialog;
