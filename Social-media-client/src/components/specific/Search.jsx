import { useInputValidation } from "6pp";
import { Search as SearchIcon } from "@mui/icons-material";
import {
  Dialog,
  DialogTitle,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncMutation } from "../../hooks/hook";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "../../redux/api/api";
import { setIsSearch } from "../../redux/reducers/misc";
import UserItem from "../shared/UserItem";

const Search = () => {
  const { isSearch } = useSelector((state) => state.misc);

  const [triggerSearch, { data, isFetching, isError }] = useLazySearchUserQuery();

  const [sendFriendRequest, isLoadingSendFriendRequest] = useAsyncMutation(
    useSendFriendRequestMutation
  );

  const dispatch = useDispatch();

  const search = useInputValidation("");

  const [users, setUsers] = useState([]);

  const addFriendHandler = async (id) => {
    await sendFriendRequest("Sending friend request...", { userId: id });
  };

  const searchCloseHandler = () => dispatch(setIsSearch(false));
/*
useEffect(() => {
  const timeOutId = setTimeout(() => {
    if (search.value.trim()) {
      triggerSearch(search.value); // search.value is username now
    } else {
      setUsers([]);
    }
  
  }))
*/


  useEffect(() => {
    if (data && data.users) setUsers(data.users);
  }, [data]);

  const handleSearch = () => {
    if (search.value.trim()) {
      triggerSearch(search.value); // search.value is username now
    }
  };

  return (
    <Dialog open={isSearch} onClose={searchCloseHandler} maxWidth="xs" fullWidth>
      <Stack
        p={{ xs: '0.5rem', sm: '2rem' }}
        direction={"column"}
        width={{ xs: '80vw', sm: '22rem' }}
        maxWidth={{ xs: '85vw', sm: '22rem' }}
        boxSizing="border-box"
      >
        <DialogTitle textAlign={"center"}>Find People</DialogTitle>
        <TextField
          label=""
          value={search.value}
          onChange={search.changeHandler}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <button onClick={handleSearch} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <SearchIcon />
                </button>
              </InputAdornment>
            ),
          }}
        />

        <List>
          {users.map((i) => (
            <UserItem
              user={i}
              key={i._id}
              handler={addFriendHandler}
              handlerIsLoading={isLoadingSendFriendRequest}
            />
          ))}
        </List>
      </Stack>
    </Dialog>
  );
};

export default Search;
