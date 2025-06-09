import React, { useEffect, useState } from "react";
import styles from "./AdminLayoutTools.module.scss";
import SlideInLeftModal from "../SlideInLeftModal/SlideInLeftModal";
import SelectComponent from "../SelectComponent/SelectComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";
import * as MuiIcons from "@mui/icons-material";
import { Tooltip } from "@mui/material";
const AdminLayoutTools = ({
    filters,
    quickFilter,
    onFilter,
    sortBy,
    onSort,
    sortWidth,
    selectFilter,
    selectSort,
    searchText,
    onSearch,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleFilterChange = (value) => {
        let updated = [];
        if (selectFilter.includes(value)) {
            updated = selectFilter.filter((item) => item !== value);
        } else {
            updated = [...selectFilter, value];
        }
        onFilter && onFilter(updated);
    };
    const handleSortChange = (value) => {
        onSort && onSort(value);
    };

    return (
        <div className={styles.wrapper}>
            {/* Filter */}
            {filters && (
                <div className={styles.filter}>
                    <div
                        onClick={() => setIsOpen(true)}
                        className={styles.button}
                    >
                        <FontAwesomeIcon icon={faSliders} />
                        <p>Bộ lọc</p>
                    </div>
                    {quickFilter?.length > 0 && (
                        <>
                            <div className={styles.verticaline}></div>
                            {quickFilter.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() =>
                                        handleFilterChange(item.value)
                                    }
                                    className={`${styles.button} ${
                                        selectFilter.includes(item.value)
                                            ? styles.active
                                            : ""
                                    }`}
                                >
                                    <p>{item.label}</p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
            {/* Search */}
            {onSearch && (
                <div className={styles.search}>
                    <Tooltip title='Tìm kiếm'>
                        <FontAwesomeIcon
                            icon={faSearch}
                            className={styles.hide}
                        />
                    </Tooltip>
                    <input
                        type='text'
                        placeholder='Tìm kiếm ...'
                        value={searchText}
                        onChange={(e) => onSearch(e.target.value)}
                        onFocus={(e) => e.target.select()}
                    />
                </div>
            )}
            {/* Sort */}
            {sortBy && sortBy.length > 0 && selectSort && (
                <div className={styles.sort}>
                    <p>Sắp xếp:</p>
                    <SelectComponent
                        value={selectSort}
                        setValue={handleSortChange}
                        options={sortBy}
                        width={sortWidth}
                    />
                </div>
            )}
            {/* Modal filter */}
            <SlideInLeftModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className={styles.ModalHeader}>
                    <p>Bộ lọc</p>
                    <div
                        className={styles.button}
                        onClick={() => setIsOpen(false)}
                    >
                        <MuiIcons.Close />
                    </div>
                </div>
                <div className={styles.ModalBody}>
                    {filters &&
                        filters.map((filter, index) => (
                            <div key={index} className={styles.filterList}>
                                <h3>{filter.title}</h3>
                                {filter.options.map((item) => (
                                    <label
                                        key={item.value}
                                        className={styles.checkboxItem}
                                    >
                                        <input
                                            type='checkbox'
                                            checked={selectFilter.includes(
                                                item.value
                                            )}
                                            onChange={() =>
                                                handleFilterChange(item.value)
                                            }
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                </div>
            </SlideInLeftModal>
        </div>
    );
};

export default AdminLayoutTools;
