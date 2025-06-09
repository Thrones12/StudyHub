import React from "react";
import { Select, MenuItem } from "@mui/material";

const SelectComponent = ({ value, setValue, options, width }) => {
    return (
        <Select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            displayEmpty
            MenuProps={{
                PaperProps: {
                    style: {
                        maxHeight: 300, // Chiều cao tối đa của dropdown
                    },
                },
            }}
            sx={{
                "& .MuiInputBase-input": {
                    fontSize: "14px",
                    fontWeight: "500",
                    maxHeight: "18px",
                    minHeight: "18px !important",
                    minWidth: "50px",
                    width: width,
                    padding: "10px",
                    backgroundColor: "#fff",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    border: "1px solid #b9bac0",
                    borderRadius: "10px",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                },
                "& .MuiInputBase-input:hover": {
                    borderColor: "#78d87a",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                },
                "& .MuiOutlinedInput-notchedOutline": {
                    border: "none", // Xóa viền outline mặc định
                },
            }}
        >
            {options &&
                options.map((option, index) => (
                    <MenuItem key={index} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
        </Select>
    );
};

export default SelectComponent;
