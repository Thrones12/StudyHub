import React, { useEffect, useState } from "react";
import styles from "./MainLayoutTools.module.scss";
import SlideInLeftModal from "../SlideInLeftModal/SlideInLeftModal";
import SelectComponent from "../SelectComponent/SelectComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSliders } from "@fortawesome/free-solid-svg-icons";
import * as MuiIcons from "@mui/icons-material";
const MainLayoutTools = ({
    filters,
    quickFilter,
    onFilter,
    sortBy,
    onSort,
    sortWidth,
    selectFilter,
    selectSort,
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

export default MainLayoutTools;
