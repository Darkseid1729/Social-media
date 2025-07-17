import { useInputValidation } from "6pp";
import { useTheme } from "../../context/ThemeContext";
import {
  Button,
  Dialog,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { sampleUsers } from "../../constants/sampleData";
import UserItem from "../shared/UserItem";
import { useDispatch, useSelector } from "react-redux";
import {
  useAvailableFriendsQuery,
  useNewGroupMutation,
} from "../../redux/api/api";
import { useAsyncMutation, useErrors } from "../../hooks/hook";
import { setIsNewGroup } from "../../redux/reducers/misc";
import toast from "react-hot-toast";

const NewGroup = () => {
  const { theme } = useTheme();
  const { isNewGroup } = useSelector((state) => state.misc);
  const dispatch = useDispatch();

  const { isError, isLoading, error, data } = useAvailableFriendsQuery();
  const [newGroup, isLoadingNewGroup] = useAsyncMutation(useNewGroupMutation);

  const groupName = useInputValidation("");

  const [selectedMembers, setSelectedMembers] = useState([]);

  const errors = [
    {
      isError,
      error,
    },
  ];

  useErrors(errors);

  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((currElement) => currElement !== id)
        : [...prev, id]
    );
  };

  const submitHandler = () => {
    if (!groupName.value) return toast.error("Group name is required");

    if (selectedMembers.length < 2)
      return toast.error("Please Select Atleast 3 Members");

    newGroup("Creating New Group...", {
      name: groupName.value,
      members: selectedMembers,
    });

    closeHandler();
  };

  const closeHandler = () => {
    dispatch(setIsNewGroup(false));
  };

  return (
    <Dialog
      onClose={closeHandler}
      open={isNewGroup}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          background: theme.DIALOG_BG,
          borderRadius: 4,
          boxShadow: 8,
          color: theme.TEXT_PRIMARY,
        },
      }}
    >
      <Stack
        p={{ xs: "0.5rem", sm: "2rem" }}
        width={{ xs: "100%", sm: "25rem" }}
        maxWidth="100vw"
        spacing={"2rem"}
        sx={{ boxSizing: 'border-box' }}
      >
        <DialogTitle
          textAlign={"center"}
          variant="h4"
          sx={{
            fontSize: { xs: '1.3rem', sm: '2rem' },
            color: theme.TEXT_PRIMARY,
            fontWeight: 700,
          }}
        >
          New Group
        </DialogTitle>

        <TextField
          label="Group Name"
          value={groupName.value}
          onChange={groupName.changeHandler}
          fullWidth
          sx={{ background: theme.LIGHT_BG, borderRadius: 2, input: { color: theme.TEXT_PRIMARY } }}
          InputLabelProps={{ style: { color: theme.TEXT_SECONDARY } }}
        />

        <Typography variant="body1" sx={{ color: theme.TEXT_SECONDARY, fontWeight: 500 }}>
          Members
        </Typography>

        <Stack>
          {isLoading ? (
            <Skeleton />
          ) : (
            data?.friends?.map((i) => (
              <UserItem
                user={i}
                key={i._id}
                handler={selectMemberHandler}
                isAdded={selectedMembers.includes(i._id)}
              />
            ))
          )}
        </Stack>

        <Stack direction={"row"} justifyContent={"space-evenly"}>
          <Button
            variant="outlined"
            size="large"
            onClick={closeHandler}
            sx={{ borderRadius: 2, minWidth: 100, color: theme.TEXT_SECONDARY, borderColor: theme.TEXT_SECONDARY, fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={submitHandler}
            disabled={isLoadingNewGroup}
            sx={{ borderRadius: 2, minWidth: 100, background: theme.BUTTON_ACCENT, color: theme.TEXT_ON_ACCENT, fontWeight: 600, boxShadow: 'none', '&:hover': { background: theme.BUTTON_ACCENT_LIGHT } }}
          >
            Create
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
};

export default NewGroup;
