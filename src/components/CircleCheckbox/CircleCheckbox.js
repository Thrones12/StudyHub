import React from "react";
import Checkbox from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";

const GreenCheckbox = styled(Checkbox)(({ theme }) => ({
    padding: 0,
    borderRadius: "50%",
    width: 20,
    height: 20,
    border: "2px solid #ccc",
    transition: "all 0.2s ease",
    "&:hover": {
        borderColor: "#48c24a",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        svg: {
            opacity: 1,
            color: "#48c24a",
        },
    },
    "&.Mui-checked": {
        backgroundColor: "#48c24a",
        borderColor: "#48c24a",
        svg: {
            color: "#fff",
            opacity: 1,
        },
    },
    "& .MuiSvgIcon-root": {
        fontSize: 18,
        width: 13,
        height: 13,
        opacity: 0,
        transition: "opacity 0.2s ease",
    },
}));

const CircleCheckbox = (props) => {
    return (
        <GreenCheckbox
            icon={<CheckIcon />}
            checkedIcon={<CheckIcon />}
            {...props}
        />
    );
};

export default CircleCheckbox;
