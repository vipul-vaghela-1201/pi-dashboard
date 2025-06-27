// src/components/common/SearchBox.jsx
import { TextField } from "@mui/material";

const SearchBox = ({ searchQuery, setSearchQuery }) => {
  return (
    <TextField
      label="Search Products"
      variant="outlined"
      size="small"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      sx={{ width: 250 }}
    />
  );
};

export default SearchBox;
