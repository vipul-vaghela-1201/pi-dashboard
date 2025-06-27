// src/components/common/InventoryDropdown.jsx
import { useEffect, useState } from "react";
import { TextField, Autocomplete } from "@mui/material";
import { getData, saveData } from "../../utils/localStorage";
import { nanoid } from "nanoid";

const InventoryDropdown = ({ selectedInventory, setSelectedInventory }) => {
  const [inventories, setInventories] = useState([]);

  useEffect(() => {
    const inv = getData("inventories") || [];
    setInventories(inv);
  }, []);

  const handleChange = (event, value) => {
    if (typeof value === "string" && value.trim() !== "") {
      const newInventory = { id: nanoid(), name: value };
      const updatedInventories = [...inventories, newInventory];
      setInventories(updatedInventories);
      saveData("inventories", updatedInventories);
      setSelectedInventory(newInventory.id);
    } else if (value) {
      setSelectedInventory(value.id);
    } else {
      setSelectedInventory("");
    }
  };

  return (
    <Autocomplete
      value={inventories.find(inv => inv.id === selectedInventory) || null}
      onChange={handleChange}
      options={inventories}
      getOptionLabel={(option) => typeof option === "string" ? option : option.name}
      freeSolo
      renderInput={(params) => <TextField {...params} label="Select Inventory" size="small" />}
      sx={{ width: 250 }}
    />
  );
};

export default InventoryDropdown;
