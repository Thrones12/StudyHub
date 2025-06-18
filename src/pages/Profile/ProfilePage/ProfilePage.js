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
    // Khởi tạo các biến và context
    const API = constants.API;
    // Lấy thông tin người dùng từ AuthContext
    const { user, setUser } = useContext(AuthContext);
    // Quản lý trạng thái của các trường thông tin
    // Quản lý file ảnh đại diện
    const [file, setFile] = useState(null);
    // Quản lý trạng thái hiển thị các trường thông tin
    // Mở form đổi email
    const [isChangeEmail, setIsChangeEmail] = useState(false);
    // Mở form đổi mật khẩu
    const [isChangePassword, setIsChangePassword] = useState(false);
    // Quản lý trạng thái hiển thị mật khẩu
    const [showEmailPassword, setShowEmailPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    // Sử dụng useFormik để quản lý form hồ sơ người dùng
    const formik = useFormik({
        // Cho phép thay đổi initialValues khi user thay đổi
        enableReinitialize: true,
        // Khởi tạo các giá trị ban đầu cho form hồ sơ người dùng
        initialValues: {
            avatar: user?.profile.avatarUrl ?? "/images/profile.png",
            fullname: user?.profile.fullname ?? "",
            gender: user?.profile.gender ?? "Male",
            address: user?.profile.address ?? "",
            phone: user?.profile.phone ?? "",
            birthdate: user?.profile?.birthdate
                ? user?.profile?.birthdate.slice(0, 10)
                : Date.now,
            school: user?.profile.school ?? "",
            grade: user?.profile.grade ?? "",
            hobby: user?.profile.hobby ?? "",
            interests: user?.profile.interests ?? "",
        },
        // Xác thực các trường thông tin hồ sơ người dùng
        validationSchema: Yup.object({
            fullname: Yup.string()
                .required("Họ tên không được để trống")
                .max(100, "Họ tên không được quá 100 ký tự"),
            address: Yup.string().max(200, "Địa chỉ không được quá 200 ký tự"),
            phone: Yup.string()
                .matches(
                    /^(\+84|0)(3|5|7|8|9)\d{8}$/,
                    "Số điện thoại không hợp lệ"
                )
                .required("Số điện thoại không được để trống"),
            birthdate: Yup.date()
                .max(new Date(), "Ngày sinh không thể trong tương lai")
                .required("Ngày sinh không được để trống"),
            school: Yup.string().max(
                100,
                "Tên trường không được quá 100 ký tự"
            ),
            grade: Yup.string().max(50, "Khối lớp không được quá 50 ký tự"),
            hobby: Yup.string().max(200, "Sở thích không được quá 200 ký tự"),
            interests: Yup.string().max(
                200,
                "Môn học yêu thích không được quá 200 ký tự"
            ),
        }),
        // Xử lý khi người dùng gửi form hồ sơ
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
                // Nếu có file ảnh đại diện thì thêm vào formData
                if (file) formData.append("image", file);
                // Hiển thị con trỏ đợi khi đang gửi yêu cầu
                document.body.style.cursor = "wait";
                // Gửi yêu cầu PUT để cập nhật thông tin người dùng
                const res = await axios.put(
                    `${API}/user/profile/${user._id}`,
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                // Hiển thị thông báo thành công và cập nhật thông tin người dùng
                Noti.success("Cập nhập thành công");
                setUser(res.data);
            } catch (err) {
                if (err.status === 404) {
                    Noti.info("Người dùng không tồn tại");
                } else {
                    Noti.error("Lỗi hệ thống");
                }
            } finally {
                // Hoàn tác con trỏ đợi
                document.body.style.cursor = "default";
            }
        },
    });
    // Sử dụng useFormik để quản lý form đổi email
    const emailFormik = useFormik({
        // Cho phép thay đổi initialValues khi user thay đổi
        enableReinitialize: true,
        // Khởi tạo các giá trị ban đầu cho form đổi email
        initialValues: {
            email: user?.email ?? "",
            password: "",
        },
        // Xác thực các trường thông tin đổi email
        validationSchema: Yup.object({
            email: Yup.string()
                .email("Email không hợp lệ")
                .required("Email không được để trống"),
            password: Yup.string().required("Mật khẩu không được để trống"),
        }),
        // Xử lý khi người dùng gửi form đổi email
        onSubmit: async ({ email, password }, { resetForm }) => {
            try {
                // Hiển thị con trỏ đợi khi đang gửi yêu cầu
                document.body.style.cursor = "wait";
                // Gửi yêu cầu PUT để cập nhật email người dùng
                await axios.put(`${API}/user/email`, {
                    _id: user._id,
                    email: email,
                    password: password,
                });
                // Hiển thị thông báo thành công và cập nhật thông tin người dùng
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
            } finally {
                // Hoàn tác con trỏ đợi
                document.body.style.cursor = "default";
            }
        },
    });
    // Sử dụng useFormik để quản lý form đổi mật khẩu
    const passwordFormik = useFormik({
        // Cho phép thay đổi initialValues khi user thay đổi
        enableReinitialize: true,
        // Khởi tạo các giá trị ban đầu cho form đổi mật khẩu
        initialValues: {
            password: "",
            newPassword: "",
            confirmNewPassword: "",
        },
        // Xác thực các trường thông tin đổi mật khẩu
        validationSchema: Yup.object({
            password: Yup.string().required("Mật khẩu không được để trống"),
            newPassword: Yup.string()
                .required("Mật khẩu mới không được để trống")
                .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
                .max(50, "Mật khẩu mới không được quá 50 ký tự"),
            confirmNewPassword: Yup.string()
                .required("Xác nhận mật khẩu mới không được để trống")
                .oneOf(
                    [Yup.ref("newPassword")],
                    "Xác nhận mật khẩu mới không khớp"
                ),
        }),
        // Xử lý khi người dùng gửi form đổi mật khẩu
        onSubmit: async (
            { password, newPassword, confirmNewPassword },
            { resetForm }
        ) => {
            // Kiểm tra xem mật khẩu mới và xác nhận mật khẩu mới có khớp không
            if (newPassword !== confirmNewPassword) {
                Noti.error("Mật khẩu mới không khớp");
                return;
            }
            try {
                // Hiển thị con trỏ đợi khi đang gửi yêu cầu
                document.body.style.cursor = "wait";
                // Gửi yêu cầu PUT để cập nhật mật khẩu người dùng
                await axios.put(`${API}/user/password`, {
                    _id: user._id,
                    password: password,
                    newPassword: newPassword,
                    confirmNewPassword: confirmNewPassword,
                });
                // Hiển thị thông báo thành công và cập nhật trạng thái
                Noti.success("Đổi mật khẩu thành công");
                setIsChangePassword(false);
                resetForm();
            } catch (err) {
                if (err.status === 404) Noti.error("Không tìm thấy người dùng");
                else if (err.status === 401) Noti.error("Sai mật khẩu");
                else Noti.error("Lỗi hệ thống");
            } finally {
                // Hoàn tác con trỏ đợi
                document.body.style.cursor = "default";
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
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='text'
                                    name='fullname'
                                    value={formik.values.fullname}
                                    onChange={formik.handleChange}
                                    placeholder='Họ và tên đầy đủ'
                                />
                                {formik.touched.fullname &&
                                    formik.errors.fullname && (
                                        <div className={styles.error}>
                                            * {formik.errors.fullname}
                                        </div>
                                    )}
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
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "gender",
                                            e.target.value
                                        )
                                    }
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
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='text'
                                    name='address'
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                    placeholder='Địa chỉ hiện tại'
                                />
                                {formik.touched.address &&
                                    formik.errors.address && (
                                        <div className={styles.error}>
                                            * {formik.errors.address}
                                        </div>
                                    )}
                            </div>
                        </div>
                        {/* phone */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Số điện thoại:</label>
                            </div>
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='text'
                                    name='phone'
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    placeholder='Số điện thoại liên hệ'
                                />
                                {formik.touched.phone &&
                                    formik.errors.phone && (
                                        <div className={styles.error}>
                                            * {formik.errors.phone}
                                        </div>
                                    )}
                            </div>
                        </div>
                        {/* birth date */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Ngày sinh:</label>
                            </div>
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='date'
                                    name='birthdate'
                                    value={formik.values.birthdate}
                                    onChange={formik.handleChange}
                                    placeholder='Ngày sinh (dd/mm/yyyy)'
                                />
                                {formik.touched.birthdate &&
                                    formik.errors.birthdate && (
                                        <div className={styles.error}>
                                            * {formik.errors.birthdate}
                                        </div>
                                    )}
                            </div>
                        </div>
                        {/* school */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Tên trường đang học: </label>
                            </div>
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='text'
                                    name='school'
                                    value={formik.values.school}
                                    onChange={formik.handleChange}
                                    placeholder='Trường đang theo học'
                                />
                                {formik.touched.school &&
                                    formik.errors.school && (
                                        <div className={styles.error}>
                                            * {formik.errors.school}
                                        </div>
                                    )}
                            </div>
                        </div>
                        {/* grade */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Khối lớp:</label>
                            </div>
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='text'
                                    name='grade'
                                    value={formik.values.grade}
                                    onChange={formik.handleChange}
                                    placeholder='Lớp hiện tại'
                                />
                                {formik.touched.grade &&
                                    formik.errors.grade && (
                                        <div className={styles.error}>
                                            * {formik.errors.grade}
                                        </div>
                                    )}
                            </div>
                        </div>
                        {/* hobby */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Sở thích:</label>
                            </div>
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='text'
                                    name='hobby'
                                    value={formik.values.hobby}
                                    onChange={formik.handleChange}
                                    placeholder='Sở thích cá nhân (VD: đọc sách, chơi game)'
                                />
                                {formik.touched.hobby &&
                                    formik.errors.hobby && (
                                        <div className={styles.error}>
                                            * {formik.errors.hobby}
                                        </div>
                                    )}
                            </div>
                        </div>
                        {/* interests */}
                        <div className='row'>
                            <div className='col-4'>
                                <label>Môn học yêu thích:</label>
                            </div>
                            <div
                                className='col-8'
                                style={{ position: "relative" }}
                            >
                                <input
                                    type='text'
                                    name='interests'
                                    value={formik.values.interests}
                                    onChange={formik.handleChange}
                                    placeholder='Lĩnh vực quan tâm (VD: Toán học, Lập trình)'
                                />
                                {formik.touched.interests &&
                                    formik.errors.interests && (
                                        <div className={styles.error}>
                                            * {formik.errors.interests}
                                        </div>
                                    )}
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
                                                value={
                                                    passwordFormik.values
                                                        .password
                                                }
                                                onChange={
                                                    passwordFormik.handleChange
                                                }
                                            />
                                            {passwordFormik.touched.password &&
                                                passwordFormik.errors
                                                    .password && (
                                                    <div
                                                        className={styles.error}
                                                    >
                                                        *{" "}
                                                        {
                                                            passwordFormik
                                                                .errors.password
                                                        }
                                                    </div>
                                                )}
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
                                            {passwordFormik.touched
                                                .newPassword &&
                                                passwordFormik.errors
                                                    .newPassword && (
                                                    <div
                                                        className={styles.error}
                                                        style={{
                                                            top: "50px",
                                                        }}
                                                    >
                                                        *{" "}
                                                        {
                                                            passwordFormik
                                                                .errors
                                                                .newPassword
                                                        }
                                                    </div>
                                                )}
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
                                            {passwordFormik.touched
                                                .confirmNewPassword &&
                                                passwordFormik.errors
                                                    .confirmNewPassword && (
                                                    <div
                                                        className={styles.error}
                                                        style={{
                                                            top: "50px",
                                                        }}
                                                    >
                                                        *{" "}
                                                        {
                                                            passwordFormik
                                                                .errors
                                                                .confirmNewPassword
                                                        }
                                                    </div>
                                                )}
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
