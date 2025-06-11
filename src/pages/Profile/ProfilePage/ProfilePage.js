import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faPen } from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import constants from "../../../utils/constants";
import Noti from "../../../utils/Noti";
import styles from "./ProfilePage.module.scss";
import { FormControlLabel, Radio, RadioGroup, Tooltip } from "@mui/material";

const ProfilePage = () => {
    const API = constants.API;
    const { user, setUser } = useContext(AuthContext);
    const [file, setFile] = useState(null);
    const [isChangeEmail, setIsChangeEmail] = useState(false);
    const [isChangePassword, setIsChangePassword] = useState(false);
    const [showEmailPassword, setShowEmailPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    // Quản lý thông tin hồ sơ người dung
    const formik = useFormik({
        enableReinitialize: true, // Cho phép thay đổi initialValues khi user thay đổi
        initialValues: {
            avatar: user?.profile.avatarUrl ?? "/images/profile.png",
            fullname: user?.profile.fullname ?? "",
            gender: user?.profile.gender ?? "Male",
            address: user?.profile.address ?? "",
            phone: user?.profile.phone ?? "",
            birthdate: user?.profile.birthdate ?? Date.now,
            school: user?.profile.school ?? "",
            grade: user?.profile.grade ?? "",
            hobby: user?.profile.hobby ?? "",
            interests: user?.profile.interests ?? "",
        },
        validateOnChange: Yup.object({}),
        onSubmit: async ({
            fullname,
            gender,
            address,
            phone,
            birthdate,
            school,
            grade,
            hobby,
            interests,
        }) => {
            document.body.style.cursor = "wait";
            try {
                const formData = new FormData();
                formData.append("fullname", fullname);
                formData.append("gender", gender);
                formData.append("address", address);
                formData.append("phone", phone);
                formData.append("birthdate", birthdate);
                formData.append("school", school);
                formData.append("grade", grade);
                formData.append("hobby", hobby);
                formData.append("interests", interests);
                if (file) formData.append("image", file);

                const res = await axios.put(
                    `${API}/user/profile/${user._id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                Noti.success("Cập nhập thành công");
                setUser(res.data);
            } catch (err) {
                if (err.status === 404) {
                    Noti.info("Người dùng không tồn tại");
                } else {
                    Noti.error("Lỗi hệ thống");
                }
            } finally {
                document.body.style.cursor = "default";
            }
        },
    });
    // Quản lý đổi email
    const emailFormik = useFormik({
        enableReinitialize: true, // Cho phép thay đổi initialValues khi user thay đổi
        initialValues: {
            email: user?.email ?? "",
            password: "",
        },
        onSubmit: async ({ email, password }, { resetForm }) => {
            try {
                await axios.put(`${API}/user/email`, {
                    _id: user._id,
                    email: email,
                    password: password,
                });
                Noti.success("Đổi email thành công");
                setIsChangeEmail(false);
                setUser({ ...user, email: email });
                resetForm();
            } catch (err) {
                if (err.status === 404) Noti.error("Không tìm thấy người dùng");
                else if (err.status === 401) Noti.error("Sai mật khẩu");
                else if (err.status === 409)
                    Noti.error("Email đã được sử dụng");
                else Noti.error("Lỗi hệ thống");
            }
        },
    });

    // Quản lý đổi mật khẩu
    const passwordFormik = useFormik({
        initialValues: {
            password: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        onSubmit: async (
            { password, newPassword, confirmNewPassword },
            { resetForm }
        ) => {
            if (newPassword !== confirmNewPassword) {
                Noti.error("Mật khẩu mới không khớp");
                return;
            }
            try {
                await axios.put(`${API}/user/password`, {
                    _id: user._id,
                    password: password,
                    newPassword: newPassword,
                    confirmNewPassword: confirmNewPassword,
                });
                Noti.success("Đổi mật khẩu thành công");
                setIsChangePassword(false);
                resetForm();
            } catch (err) {
                if (err.status === 404) Noti.error("Không tìm thấy người dùng");
                else if (err.status === 401) Noti.error("Sai mật khẩu");
                else Noti.error("Lỗi hệ thống");
            }
        },
    });
    // Hoàn tác thay đổi trong hồ sơ
    const handleDiscard = () => {
        formik.resetForm({
            values: {
                avatar: user?.profile.avatarUrl ?? "/images/profile.png",
                fullname: user?.profile.fullname ?? "",
                gender: user?.profile.gender ?? "Male",
                email: user?.email ?? "",
                address: user?.profile.address ?? "",
                phone: user?.profile.phone ?? "",
                birthdate: user?.profile.birthdate ?? Date.now,
                school: user?.profile.school ?? "",
                grade: user?.profile.grade ?? "",
                hobby: user?.profile.hobby ?? "",
                interests: user?.profile.interests ?? "",
            },
        });
    };
    // Xử lý thay đổi avatar
    const handleFileChange = (e) => {
        const newFile = e.target.files[0];
        if (newFile) {
            setFile(newFile);
            formik.setFieldValue("avatar", URL.createObjectURL(newFile));
        }
    };
    return (
        <>
            <div className={styles.Card}>
                <div className={styles.Header}>Tài khoản</div>
                <form onSubmit={formik.handleSubmit}>
                    {/* Begin: card-body */}
                    <div className={styles.Body}>
                        {/* image */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Hình đại diện:</label>
                            </div>
                            <div className='col-8'>
                                <div className={styles.Image}>
                                    <img
                                        name='avatar'
                                        src={formik.values.avatar}
                                        alt='avatar'
                                    />
                                    <Tooltip
                                        title='Chỉnh sửa'
                                        placement='right'
                                    >
                                        <label htmlFor='avatarUpload'>
                                            <FontAwesomeIcon icon={faPen} />
                                            <input
                                                id='avatarUpload'
                                                style={{
                                                    display: "none",
                                                }}
                                                type='file'
                                                accept='image/*'
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    </Tooltip>
                                </div>
                                <div className={styles.ImageText}>
                                    Các loại tập tin được phép: png, jpg, jpeg
                                </div>
                            </div>
                        </div>
                        {/* name */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Họ tên:</label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='text'
                                    name='fullname'
                                    value={formik.values.fullname}
                                    onChange={formik.handleChange}
                                    placeholder='Họ và tên đầy đủ'
                                />
                            </div>
                        </div>
                        {/* gender */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Giới tính:</label>
                            </div>
                            <div className={`col-8`}>
                                <RadioGroup
                                    row
                                    aria-labelledby='demo-row-radio-buttons-group-label'
                                    name='row-radio-buttons-group'
                                    value={formik.values.gender}
                                    onChange={formik.handleChange}
                                >
                                    <FormControlLabel
                                        value='Male'
                                        control={<Radio />}
                                        label='Nam'
                                    />
                                    <FormControlLabel
                                        value='Female'
                                        control={<Radio />}
                                        label='Nữ'
                                    />
                                    <FormControlLabel
                                        value='Other'
                                        control={<Radio />}
                                        label='Khác'
                                    />
                                </RadioGroup>
                            </div>
                        </div>
                        {/* address */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Địa chỉ:</label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='text'
                                    name='address'
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    placeholder='Địa chỉ hiện tại'
                                />
                            </div>
                        </div>
                        {/* phone */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Số điện thoại:</label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='text'
                                    name='phone'
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    placeholder='Số điện thoại liên hệ'
                                />
                            </div>
                        </div>
                        {/* birth date */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Ngày sinh:</label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='date'
                                    name='birthdate'
                                    value={formik.values.birthdate.slice(0, 10)}
                                    onChange={formik.handleChange}
                                    placeholder='Ngày sinh (dd/mm/yyyy)'
                                />
                            </div>
                        </div>
                        {/* school */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Tên trường đang học: </label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='text'
                                    name='school'
                                    value={formik.values.school}
                                    onChange={formik.handleChange}
                                    placeholder='Trường đang theo học'
                                />
                            </div>
                        </div>
                        {/* grade */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Khối lớp:</label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='text'
                                    name='grade'
                                    value={formik.values.grade}
                                    onChange={formik.handleChange}
                                    placeholder='Lớp hiện tại'
                                />
                            </div>
                        </div>
                        {/* hobby */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Sở thích:</label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='text'
                                    name='hobby'
                                    value={formik.values.hobby}
                                    onChange={formik.handleChange}
                                    placeholder='Sở thích cá nhân (VD: đọc sách, chơi game)'
                                />
                            </div>
                        </div>
                        {/* interests */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Môn học yêu thích:</label>
                            </div>
                            <div className='col-8'>
                                <input
                                    type='text'
                                    name='interests'
                                    value={formik.values.interests}
                                    onChange={formik.handleChange}
                                    placeholder='Lĩnh vực quan tâm (VD: Toán học, Lập trình)'
                                />
                            </div>
                        </div>
                    </div>
                    {/* End: card-body */}

                    {/* Begin: card-footer */}
                    <div className={styles.Footer}>
                        <button
                            type='button'
                            onClick={handleDiscard}
                            className={styles.Gray}
                        >
                            Hoàn tác
                        </button>
                        <button type='submit' className={styles.Green}>
                            Lưu lại
                        </button>
                    </div>
                    {/* End: card-footer */}
                </form>
            </div>
            <div className={styles.Card}>
                <div className={styles.Header}>Thông tin khác</div>
                <div className={styles.Body}>
                    {/* Begin: change email */}
                    {user && !isChangeEmail ? (
                        <div className={styles.SignInMethod}>
                            <div className={styles.Content}>
                                <div className={styles.Primary}>
                                    Địa chỉ email
                                </div>
                                <div className={styles.Sub}>{user.email}</div>
                            </div>
                            <button
                                type='button'
                                onClick={() => setIsChangeEmail(true)}
                                className={styles.Gray}
                            >
                                Đổi email
                            </button>
                        </div>
                    ) : (
                        <div className={styles.SignInMethod}>
                            <form
                                style={{ width: "100%" }}
                                onSubmit={emailFormik.handleSubmit}
                            >
                                {/* Begin: input */}
                                <div
                                    className='row'
                                    style={{ marginBottom: 20 }}
                                >
                                    {/* Begin: email */}
                                    <div
                                        className='col-6'
                                        style={{ paddingRight: 20 }}
                                    >
                                        <div
                                            className={styles.Primary}
                                            style={{ marginBottom: 10 }}
                                        >
                                            Nhập email mới
                                        </div>
                                        <input
                                            required
                                            type='email'
                                            name='email'
                                            value={emailFormik.values.email}
                                            onChange={emailFormik.handleChange}
                                            placeholder='Địa chỉ email'
                                        />
                                    </div>
                                    {/* End: email */}

                                    {/* Begin: password */}
                                    <div
                                        className='col-6'
                                        style={{ paddingRight: 20 }}
                                    >
                                        <div
                                            className={styles.Primary}
                                            style={{ marginBottom: 10 }}
                                        >
                                            Xác nhận mật khẩu
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                required
                                                type={
                                                    showEmailPassword === true
                                                        ? "text"
                                                        : "password"
                                                }
                                                name='password'
                                                value={
                                                    emailFormik.values.password
                                                }
                                                onChange={
                                                    emailFormik.handleChange
                                                }
                                            />
                                            <span
                                                className={styles.icon}
                                                onClick={() =>
                                                    setShowEmailPassword(
                                                        !showEmailPassword
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        showEmailPassword
                                                            ? faEyeSlash
                                                            : faEye
                                                    }
                                                />
                                            </span>
                                        </div>
                                    </div>
                                    {/* End: password */}
                                </div>
                                {/* End: input */}

                                {/* Begin: button */}
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        type='submit'
                                        className={styles.Green}
                                    >
                                        Xác nhận
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setIsChangeEmail(false)}
                                        className={styles.Gray}
                                    >
                                        Hủy bỏ
                                    </button>
                                </div>
                                {/* End: button */}
                            </form>
                        </div>
                    )}
                    {/* End: change email */}
                    {/* Begin: change password */}
                    {!isChangePassword ? (
                        <div className={styles.SignInMethod}>
                            <div className={styles.Content}>
                                <div className={styles.Primary}>Mật khẩu</div>
                                <div className={styles.Sub}>************</div>
                            </div>
                            <div className='button'>
                                <button
                                    type='button'
                                    onClick={() => setIsChangePassword(true)}
                                    className={styles.Gray}
                                >
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.SignInMethod}>
                            <form
                                style={{ width: "100%" }}
                                onSubmit={passwordFormik.handleSubmit}
                            >
                                <div
                                    className='row'
                                    style={{ marginBottom: 20 }}
                                >
                                    {/* Begin: password */}
                                    <div
                                        className='col-4'
                                        style={{ paddingRight: 20 }}
                                    >
                                        <div
                                            className={styles.Primary}
                                            style={{ marginBottom: 10 }}
                                        >
                                            Mật khẩu hiện tại
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                required
                                                type={
                                                    showOldPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name='password'
                                                value={formik.values.password}
                                                onChange={
                                                    passwordFormik.handleChange
                                                }
                                            />
                                            <span
                                                className={styles.icon}
                                                onClick={() =>
                                                    setShowOldPassword(
                                                        !showOldPassword
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        showOldPassword
                                                            ? faEyeSlash
                                                            : faEye
                                                    }
                                                />
                                            </span>
                                        </div>
                                    </div>
                                    {/* Begin: new password */}
                                    <div
                                        className='col-4'
                                        style={{ paddingRight: 20 }}
                                    >
                                        <div
                                            className={styles.Primary}
                                            style={{ marginBottom: 10 }}
                                        >
                                            Mật khẩu mới
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                required
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name='newPassword'
                                                value={
                                                    formik.values.newPassword
                                                }
                                                onChange={
                                                    passwordFormik.handleChange
                                                }
                                            />
                                            <span
                                                className={styles.icon}
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        showPassword
                                                            ? faEyeSlash
                                                            : faEye
                                                    }
                                                />
                                            </span>
                                        </div>
                                    </div>
                                    {/* Begin: confirm password */}
                                    <div
                                        className='col-4'
                                        style={{ paddingRight: 20 }}
                                    >
                                        <div
                                            className={styles.Primary}
                                            style={{ marginBottom: 10 }}
                                        >
                                            Xác nhận mật khẩu mới
                                        </div>
                                        <div style={{ position: "relative" }}>
                                            <input
                                                required
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name='confirmNewPassword'
                                                value={
                                                    formik.values
                                                        .confirmNewPassword
                                                }
                                                onChange={
                                                    passwordFormik.handleChange
                                                }
                                            />
                                            <span
                                                className={styles.icon}
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={
                                                        showConfirmPassword
                                                            ? faEyeSlash
                                                            : faEye
                                                    }
                                                />
                                            </span>
                                        </div>
                                    </div>
                                    {/* End: confirm password */}
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button
                                        type='submit'
                                        className={styles.Green}
                                    >
                                        Xác nhận
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setIsChangePassword(false)
                                        }
                                        className={styles.Gray}
                                    >
                                        Hủy bỏ
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                    {/* End: change password */}
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
