import React, { useState, useContext, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import * as Yup from "yup";
import { useFormik } from "formik";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";
import "./AccountPage.css";
import constants from "../../../utils/constants";
import Noti from "../../../utils/Noti";

const AccountPage = () => {
    const API = constants.API;
    const { userId } = useContext(AuthContext);
    const [initUser, setInitUser] = useState({});
    const [file, setFile] = useState(null);
    const [isChangeEmail, setIsChangelEmail] = useState(false);
    const [isChanglePassword, setIsChangelPassword] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/user/get-one?id=${userId}`);
                let data = res.data.data;

                setInitUser(data);
            } catch (err) {
                if (err.response && err.response.data?.message) {
                    Noti.error(err.response.data.message);
                } else {
                    Noti.error("Đăng nhập thất bại");
                }
            }
        };
        if (userId) {
            fetchData();
        }
    }, [userId, API]);

    const formik = useFormik({
        enableReinitialize: true, // Cho phép thay đổi initialValues khi user thay đổi
        initialValues: {
            avatar: initUser?.avatar ?? "/images/profile.png",
            fullname: initUser?.fullname ?? "",
            email: initUser?.email ?? "",
            phone: initUser?.phone ?? "",
            address: initUser?.address ?? "",
        },
        validateOnChange: Yup.object({
            fullname: Yup.string().required(),
        }),
        onSubmit: async ({ fullname, email, phone, address }) => {
            try {
                const formData = new FormData();
                formData.append("_id", initUser._id);
                formData.append("fullname", fullname);
                formData.append("email", email);
                formData.append("phone", phone);
                formData.append("address", address);
                formData.append("file", file);

                const res = await axios.put(`${API}/user`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                if (res.status === 200) {
                    Noti.success("Cập nhập thành công");
                    setInitUser(res.data);
                }
            } catch (err) {
                if (err.status === 404) {
                    Noti.info("Người dùng không tồn tại");
                } else {
                    Noti.error("Lỗi hệ thống");
                }
            }
        },
    });

    const emailFormik = useFormik({
        initialValues: {
            email: initUser?.email ?? "",
            password: "",
        },
        onSubmit: async ({ email, password }, { resetForm }) => {
            try {
                await axios.put(`${API}/user/email`, {
                    _id: initUser._id,
                    email: email,
                    password: password,
                });
                Noti.success("Đổi email thành công");
                setIsChangelEmail(false);
                setInitUser({ ...initUser, email: email });
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
                    _id: initUser._id,
                    password: password,
                    newPassword: newPassword,
                    confirmNewPassword: confirmNewPassword,
                });
                Noti.success("Đổi mật khẩu thành công");
                setIsChangelPassword(false);
                setInitUser({ ...initUser, password: password });
                resetForm();
            } catch (err) {
                if (err.status === 404) Noti.error("Không tìm thấy người dùng");
                else if (err.status === 401) Noti.error("Sai mật khẩu");
                else Noti.error("Lỗi hệ thống");
            }
        },
    });

    const handleDiscard = () => {
        formik.resetForm({
            values: {
                avatar: initUser?.avatar ?? "",
                fullname: initUser?.fullname ?? "",
                email: initUser?.email ?? "",
                phone: initUser?.phone ?? "",
                address: initUser?.address ?? "",
            },
        });
    };
    const handleFileChange = (e) => {
        const newFile = e.target.files[0];
        if (newFile) {
            setFile(newFile);
            formik.setFieldValue("avatar", URL.createObjectURL(newFile));
        }
    };
    return (
        <div className='container'>
            <div className='profile-page'>
                {/* Begin: account card */}
                <div className='card'>
                    {/* Begin: card-header */}
                    <div className='card-header'>Tài khoản</div>
                    {/* End: card-header */}

                    <form onSubmit={formik.handleSubmit}>
                        {/* Begin: card-body */}
                        <div className='card-body'>
                            {/* Begin: row image */}
                            <div className='row'>
                                <label className='col-4'>Hình đại diện</label>
                                <div className='col-8'>
                                    <div className='image'>
                                        <img
                                            className='avatar'
                                            name='avatar'
                                            src={formik.values.avatar}
                                            alt='avatar'
                                        />
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
                                    </div>
                                    <div className='image-text'>
                                        Các loại tập tin được phép: png, jpg,
                                        jpeg
                                    </div>
                                </div>
                            </div>
                            {/* End: row image */}

                            {/* Begin: row name */}
                            <div className='row'>
                                <label className='col-4'>Họ tên</label>
                                <div className='col-8'>
                                    <input
                                        type='text'
                                        name='fullname'
                                        value={formik.values.fullname}
                                        onChange={formik.handleChange}
                                        placeholder='Tên người dùng'
                                    />
                                </div>
                            </div>
                            {/* End: row name */}

                            {/* Begin: row email */}
                            <div className='row'>
                                <label className='col-4'>Email</label>
                                <div className='col-8'>
                                    <input
                                        style={{
                                            backgroundColor: "#e3e4e9",
                                        }}
                                        disabled={true}
                                        type='email'
                                        name='email'
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        placeholder='Email'
                                    />
                                </div>
                            </div>
                            {/* End: row email */}

                            {/* Begin: row address */}
                            <div className='row'>
                                <label className='col-4'>Địa chỉ</label>
                                <div className='col-8'>
                                    <input
                                        type='text'
                                        name='address'
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        placeholder='Địa chỉ'
                                    />
                                </div>
                            </div>
                            {/* End: row address */}

                            {/* Begin: row phone */}
                            <div className='row'>
                                <label className='col-4'>Số điện thoại</label>
                                <div className='col-8'>
                                    <input
                                        type='text'
                                        name='phone'
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                        placeholder='Số điện thoại'
                                    />
                                </div>
                            </div>
                            {/* End: row phone */}
                        </div>
                        {/* End: card-body */}

                        {/* Begin: card-footer */}
                        <div className='card-footer'>
                            <button
                                type='button'
                                className='btn btn-gray'
                                onClick={handleDiscard}
                            >
                                Hoàn tác
                            </button>
                            <button type='submit' className='btn btn-blue'>
                                Lưu lại
                            </button>
                        </div>
                        {/* End: card-footer */}
                    </form>
                </div>

                {/* Begin: sign in method */}
                <div className='card'>
                    <div className='card-header'>Thông tin đăng nhập</div>
                    <div className='card-body'>
                        {/* Begin: change email */}
                        {!isChangeEmail ? (
                            <div className='sign-in-method'>
                                <div className='content'>
                                    <div className='primary'>Địa chỉ email</div>
                                    <div className='sub'>{initUser.email}</div>
                                </div>
                                <div>
                                    <button
                                        type='button'
                                        onClick={() => setIsChangelEmail(true)}
                                        className='btn btn-gray'
                                    >
                                        Đổi email
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='sign-in-method'>
                                <form
                                    style={{ width: "100%" }}
                                    onSubmit={emailFormik.handleSubmit}
                                >
                                    {/* Begin: input */}
                                    <div className='row'>
                                        {/* Begin: email */}
                                        <div className='col-6'>
                                            <div className='primary'>
                                                Nhập email mới
                                            </div>
                                            <input
                                                required
                                                type='email'
                                                name='email'
                                                value={emailFormik.values.email}
                                                onChange={
                                                    emailFormik.handleChange
                                                }
                                                placeholder='Địa chỉ email'
                                            />
                                        </div>
                                        {/* End: email */}

                                        {/* Begin: password */}
                                        <div className='col-6'>
                                            <div className='primary'>
                                                Xác nhận mật khẩu
                                            </div>
                                            <input
                                                required
                                                type='password'
                                                name='password'
                                                value={
                                                    emailFormik.values.password
                                                }
                                                onChange={
                                                    emailFormik.handleChange
                                                }
                                            />
                                        </div>
                                        {/* End: password */}
                                    </div>
                                    {/* End: input */}

                                    {/* Begin: button */}
                                    <div
                                        style={{ display: "flex", gap: "10px" }}
                                    >
                                        <button
                                            type='submit'
                                            className='btn btn-blue'
                                        >
                                            Xác nhận
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                setIsChangelEmail(false)
                                            }
                                            className='btn btn-gray'
                                        >
                                            Hủy bỏ
                                        </button>
                                    </div>
                                    {/* End: button */}
                                </form>
                            </div>
                        )}
                        {/* End: change email */}

                        <div className='seperator'></div>

                        {/* Begin: change password */}
                        {!isChanglePassword ? (
                            <div className='sign-in-method'>
                                <div className='content'>
                                    <div className='primary'>Mật khẩu</div>
                                    <div className='sub'>************</div>
                                </div>
                                <div className='button'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setIsChangelPassword(true)
                                        }
                                        className='btn btn-gray'
                                    >
                                        Đổi mật khẩu
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className='sign-in-method'>
                                <form
                                    style={{ width: "100%" }}
                                    onSubmit={passwordFormik.handleSubmit}
                                >
                                    <div className='row'>
                                        {/* Begin: password */}
                                        <div className='col-4'>
                                            <div className='primary'>
                                                Mật khẩu hiện tại
                                            </div>
                                            <input
                                                required
                                                type='password'
                                                name='password'
                                                value={formik.values.password}
                                                onChange={
                                                    passwordFormik.handleChange
                                                }
                                            />
                                        </div>
                                        {/* End: password */}

                                        {/* Begin: new password */}
                                        <div className='col-4'>
                                            <div className='primary'>
                                                Mật khẩu mới
                                            </div>
                                            <input
                                                required
                                                type='password'
                                                name='newPassword'
                                                value={
                                                    formik.values.newPassword
                                                }
                                                onChange={
                                                    passwordFormik.handleChange
                                                }
                                            />
                                        </div>
                                        {/* End: new password */}

                                        {/* Begin: confirm password */}
                                        <div className='col-4'>
                                            <div className='primary'>
                                                Xác nhận mật khẩu mới
                                            </div>
                                            <input
                                                required
                                                type='password'
                                                name='confirmNewPassword'
                                                value={
                                                    formik.values
                                                        .confirmNewPassword
                                                }
                                                onChange={
                                                    passwordFormik.handleChange
                                                }
                                            />
                                        </div>
                                        {/* End: confirm password */}
                                    </div>
                                    <div
                                        style={{ display: "flex", gap: "10px" }}
                                    >
                                        <button
                                            type='submit'
                                            className='btn btn-blue'
                                        >
                                            Xác nhận
                                        </button>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                setIsChangelPassword(false)
                                            }
                                            className='btn btn-gray'
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
                {/* End: sign in method */}
                {/* End: account-card */}
            </div>
        </div>
    );
};

export default AccountPage;
