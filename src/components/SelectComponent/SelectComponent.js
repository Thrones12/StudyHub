import React from "react";
import { Select, MenuItem } from "@mui/material";

const SelectComponent = ({ value, setValue, options }) => {
    return (
        <Select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            displayEmpty
            MenuProps={{
                PaperProps: {
                    style: {
                        maxHeight: 200, // Chiều cao tối đa của dropdown
                    },
                },
            }}
            sx={{
                "& .MuiInputBase-input": {
                    padding: "8px 16px",
                    margin: "0px 5px",
                    backgroundColor: "#fff",
                    border: "1px solid #6b7284",
                    transition: "all 0.2s ease",
                },
                "& .MuiInputBase-input:hover": {
                    backgroundColor: "#f1f1f4",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Xóa viền outline mặc định
                },
            }}
        >
            {options &&
                options.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                        {option.text}
                    </MenuItem>
                ))}
        </Select>
    );
};

export default SelectComponent;
