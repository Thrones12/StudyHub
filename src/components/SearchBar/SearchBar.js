import React, { useState } from "react";
import "./SearchBar.css";
import { useNavigate } from "react-router-dom";

const SearchBar = () => {
    const nav = useNavigate();
    const [searchText, setSearchText] = useState("");
    const handleSearch = (e) => {
        e.preventDefault();
        nav(`/search?t=${searchText}`);
    };
    return (
        <div className='search-bar'>
            <form onSubmit={(e) => handleSearch(e)}>
                <input
                    type='text'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder='Tìm kiếm trên e-learning'
                />
            </form>
            <div className='image' onClick={handleSearch}>
                <img src='/icons/search.png' alt='img' />
            </div>
        </div>
    );
};

export default SearchBar;
