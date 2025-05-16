const User = require("../models/user");
const Course = require("../models/course");
const ExamResult = require("../models/examResult");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const nodemailer = require("nodemailer");

// Get toàn bộ dữ liệu, query
const GetData = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const {} = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl

        data = await User.find({});

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        return res.status(200).json({ data, message: "Get all success" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// GET /user/get-one?id=...
const GetOne = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            data = await User.findById(id)
                .populate({
                    path: "histories",
                    model: "Activity",
                })
                .populate({ path: "storages", model: "Storage" })
                .populate({ path: "examResults", model: "ExamResult" });
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        return res.json({ data, message: "Get all data" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// GET /user/get-one?id=...
const GetStorage = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id, type } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            data = await User.findById(id).populate({
                path: "storages",
                model: "Storage",
                populate: {
                    path: "items",
                    model:
                        type === "lesson"
                            ? "Lesson"
                            : type === "exam"
                            ? "Exam"
                            : "Exercise",
                },
            });
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        let filterdData = data.storages.filter((d) => d.type === type);

        return res.json({ data: filterdData, message: "Get all data" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// GET /user/get-learning-hour?id=...
const GetLearningHour = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id, month, year } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // 404 - User not Found
        let user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "Data not found" });

        // Lọc learningHour theo tháng và năm (nếu có truyền vào)
        if (month && year) {
            const m = parseInt(month);
            const y = parseInt(year);

            data = user.learningHour.find((entry) => {
                const time = new Date(entry.time);
                return time.getMonth() === m && time.getFullYear() === y;
            });
        }

        // 404 - Not Found
        if (!data) return res.status(201).json({ data });

        // 200 - Success
        return res.status(200).json({ data: data });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};
// GET /user/get-progress?id=...
const GetProgress = async (req, res) => {
    try {
        const { id } = req.query;
        let data = []; // Dữ liệu return

        // Get User
        let user = await User.findById(id);

        // Get Course
        const courses = await Course.find().populate({
            path: "subjects",
            model: "Subject",
            populate: { path: "chapters", model: "Chapter" },
        });

        // Get Exam Result
        const examResults = await ExamResult.find({ user: id });
        const examChapterIds = examResults.map((e) => e.chapterId.toString());

        // 404 - Course Not Found
        if (!courses)
            return res.status(404).json({ message: "Data not found" });
        if (!user) return res.status(404).json({ message: "Data not found" });

        for (let learnedCourse of user.learned) {
            const course = courses.find(
                (c) => c._id.toString() === learnedCourse.courseId
            );
            if (!course) continue;

            for (let subjectProgress of learnedCourse.subjects) {
                const subject = course.subjects.find(
                    (s) => s._id.toString() === subjectProgress.subjectId
                );
                if (!subject) continue;

                const totalChapters = subject.chapters.length;
                let totalLessons = 0;
                let doneLessons = 0;
                let doneExams = 0;

                const learnedSubject = subjectProgress.lessons || [];

                doneLessons += learnedSubject.filter((l) => l.isDone).length;

                for (const chapter of subject.chapters) {
                    totalLessons += chapter.lessons.length;

                    if (examChapterIds.includes(chapter._id.toString())) {
                        doneExams += 1;
                    }
                }

                let progress =
                    totalLessons > 0 && totalChapters > 0
                        ? (doneLessons + doneExams) /
                          (totalLessons + totalChapters)
                        : 0;

                if (progress > 0)
                    data.push({
                        courseTitle: course.title,
                        subjectTitle: subject.title,
                        progress: (progress * 100).toFixed(0),
                        totalLessons: totalLessons,
                        doneLessons: doneLessons,
                        totalExams: totalChapters,
                        doneExams: doneExams,
                        link: `/study/${course.tag}/${subject.tag}/${subject.chapters[0].lessons[0]}`,
                    });
            }
        }
        console.log(data);

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

// GET /user/get-average-score?id=...&courseId=...
const GetAverageScore = async (req, res) => {
    try {
        const { id, courseId } = req.query;
        let data; // Return data

        // Get User và Course
        let user, course;
        if (id && courseId) {
            user = await User.findById(id).populate({
                path: "examResults",
                model: "ExamResult",
            });
            course = await Course.findById(courseId).populate({
                path: "subjects",
                model: "Subject",
                populate: { path: "chapters", model: "Chapter" },
            });
        }
        // 404 - Not Found
        if (!user || !course)
            return res.status(404).json({ message: "Data not found" });

        // Xử lí điểm trung bình
        let examCount = 0;
        let subjectScore = course.subjects.map((subject) => {
            let count = 0;
            let score = subject.chapters.reduce((average, item) => {
                let examResult = user.examResults.find(
                    (result) => result.chapterId === item._id.toString()
                );
                if (examResult) {
                    count += 1;
                    examCount += 1;
                }
                return examResult ? average + examResult.score : average + 0;
            }, 0);

            return {
                subject: subject.title,
                score: count > 0 ? Number((score / count).toFixed(2)) : 0,
            };
        });

        // Điểm trung bình cao nhất
        let highest = null;
        if (subjectScore.length > 0) {
            highest = subjectScore[0];
            for (let i = 1; i < subjectScore.length; i++) {
                if (subjectScore[i].score > highest.score)
                    highest = subjectScore[i];
            }
            if (highest.score === 0) highest = null;
        }
        // Điểm trung bình thấp nhất
        let lowest = null;
        if (subjectScore.length > 0) {
            lowest = subjectScore[0];
            for (let i = 1; i < subjectScore.length; i++) {
                if (
                    subjectScore[i].score < lowest.score &&
                    subjectScore[i].score !== 0
                )
                    lowest = subjectScore[i];
            }

            if (lowest.score === 0) lowest = null;
        }

        data = {
            averageScore:
                subjectScore.length > 0
                    ? Number(
                          (
                              subjectScore.reduce(
                                  (score, item) => (score += item.score),
                                  0
                              ) / subjectScore.length
                          ).toFixed(2)
                      )
                    : 0,
            examCount,
            highest: highest ? highest.subject : null,
            lowest: lowest ? lowest.subject : null,
            subjects: subjectScore,
        };

        // 200 - Success
        return res.json({ data });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// Create, input: avatar, fullname, email, password, phone, address
const Create = async (req, res) => {
    try {
        const { avatar, fullname, email, password, phone, address } = req.body;

        const courses = await Course.find();

        // Tạo mảng learned theo cấu trúc
        const learned = courses.map((course) => ({
            courseId: course._id.toString(),
            subjects: course.subjects.map((subject) => ({
                subjectId: subject._id.toString(),
                lessons: subject.lessons.map((lesson) => ({
                    lessonId: lesson._id.toString(),
                    isDone: false,
                })),
            })),
        }));

        const newData = new User({
            avatar,
            fullname,
            email,
            password,
            phone,
            address,
            learned,
        });
        newData.save();

        return res
            .status(200)
            .json({ data: newData, message: "Create thành công" });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
const Update = async (req, res) => {
    try {
        const { _id, password, fullname, email, address, phone } = req.body;

        const user = await User.findById(_id);
        if (!user) return res.status(404).json("Không tìm thấy user");

        if (req.file) {
            const avatarPath =
                "http://localhost:8080/uploads/avatars/" + req.file.filename;
            user.avatar = avatarPath;
        }

        if (fullname) user.fullname = fullname;
        if (email) user.email = email;
        if (address) user.address = address;
        if (phone) user.phone = phone;

        await user.save();
        console.log("Cập nhập user: ", user);

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json("Lỗi server");
    }
};
const UpdateEmail = async (req, res) => {
    try {
        const { _id, password, email } = req.body;

        const user = await User.findById(_id);
        // Tìm người dùng
        if (!user) return res.status(404).json("Không tìm thấy user");

        // Xác nhận mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json("Email đã tồn tại");

        // Cập nhập email
        user.email = email;

        await user.save();
        console.log("Cập nhập user: ", user);

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json("Lỗi server");
    }
};
const UpdatePassword = async (req, res) => {
    try {
        const { _id, password, newPassword, confirmNewPassword } = req.body;

        const user = await User.findById(_id);
        // Tìm người dùng
        if (!user) return res.status(404).json("Không tìm thấy user");

        // Xác nhận mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Sai mật khẩu" });

        // Cập nhập mật khẩu
        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();
        console.log("Cập nhập user: ", user);

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json("Lỗi server");
    }
};
// POST /user/login
const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm người dùng theo email
        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(404)
                .json({ data: [], message: "Người dùng không tồn tại" });

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

        // Tạo JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role || "user", // nếu bạn có phân quyền
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        res.status(200).json({
            data: { token, userId: user._id },
            message: "Đăng nhập thành công",
        });
    } catch (error) {
        res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// GET /user/verify-token
const VerifyToken = (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Không có token" });
        }

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return res.status(200).json({ userId: decoded.id });
        } catch (err) {
            return res.status(401).json({ message: "Token không hợp lệ" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};
// POST /user/register
const Register = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res
                .status(400)
                .json({ data: [], message: "Email đã được sử dụng" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const courses = await Course.find().populate({
            path: "subjects",
            model: "Subject",
            populate: {
                path: "chapters",
                model: "Chapter",
            },
        });

        // Tạo mảng learned theo cấu trúc
        const learned = courses.map((course) => ({
            courseId: course._id.toString(),
            subjects: course.subjects.map((subject) => ({
                subjectId: subject._id.toString(),
                lessons: subject.chapters.flatMap((chapter) =>
                    chapter.lessons.map((lesson) => ({
                        lessonId: lesson._id.toString(),
                        isDone: false,
                    }))
                ),
            })),
        }));

        const newUser = new User({ email, password: hashedPassword, learned });

        await newUser.save();

        res.status(200).json({ data: newUser, message: "Đăng ký thành công" });
    } catch (error) {
        res.status(500).json({ data: [], message: "Lỗi server" });
    }
};
// POST /user/send-otp
const SendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        // Tìm người dùng
        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(404)
                .json({ data: [], message: "Tài khoản không tồn tại" });

        // Tạo OTP ngẫu nhiên
        const OTP = Math.floor(1000 + Math.random() * 9000);

        // Cập nhật OTP và thời gian hết hạn (ví dụ: 5 phút)
        user.otp = OTP;
        await user.save();

        // Cấu hình Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "nguyenduy7003@gmail.com",
                pass: "tesf daab xvbr fyqo",
            },
        });

        // Nội dung email
        const mailOptions = {
            from: "nguyenduy7003@gmail.com",
            to: email,
            subject: "Xác thực OTP",
            text: `Xin chào,\n\nMã xác thực OTP của bạn là: ${OTP}.\n\nTrân trọng.`,
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ data: [], message: "OTP đã được gửi" });
    } catch (error) {
        console.error("Lỗi gửi OTP:", error);
        return res.status(500).json({
            message: "Lỗi server khi gửi OTP",
            error: error.message,
        });
    }
};
// POST /user/verify
const Verify = async (req, res) => {
    try {
        const { email, inputOtp } = req.body;

        // Tìm người dùng
        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(404)
                .json({ data: [], message: "Tài khoản không tồn tại" });

        // Cập nhật OTP và thời gian hết hạn (ví dụ: 5 phút)
        if (user.otp === inputOtp)
            return res.status(200).json({ message: "Xác thực thành công" });
        else return res.status(400).json({ message: "Xác thực thất bại" });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};
// POST /user/send-password
const SendPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Tài khoản không tồn tại" });
        }

        // Tạo mật khẩu mới
        const newPassword = Math.random().toString(36).slice(-8); // VD: "a1b2c3d4"
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu
        user.password = hashedPassword;
        await user.save();

        // Cấu hình gửi email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "nguyenduy7003@gmail.com", // Email bạn
                pass: "tesf daab xvbr fyqo", // App password
            },
        });

        const mailOptions = {
            from: "nguyenduy7003@gmail.com",
            to: email,
            subject: "Mật khẩu mới",
            text: `Xin chào,\n\nMật khẩu mới của bạn là: ${newPassword}.\n\nTrân trọng.`,
        };

        // Gửi email
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            message: "Mật khẩu mới đã được gửi đến email của bạn",
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi server",
        });
    }
};
// POST /user/check-learning-hour
const CheckLearningHour = async (req, res) => {
    try {
        const { userId } = req.body;

        // Kiểm tra user tồn tại
        const user = await User.findById(userId);

        // 404 - Not Found
        if (!user) return res.status(404).json({ message: "Not found" });

        // Kiểm tra thời gian học tập tháng này có chưa
        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
        );

        const hasThisMonth = user.learningHour.some((entry) => {
            const entryDate = new Date(entry.time);
            return entryDate >= startOfMonth && entryDate <= endOfMonth;
        });

        // Thêm learning hour mới vào user
        if (!hasThisMonth) {
            // Lấy danh sách tất cả course
            const allCourses = await Course.find({}).populate({
                path: "subjects",
                model: "Subject",
                populate: { path: "chapters", model: "Chapter" },
            });

            // Chuẩn bị dữ liệu để push
            const coursesForLearningHour = allCourses.map((course) => ({
                courseId: course._id.toString(),
                subjects: course.subjects.map((subject) => ({
                    link:
                        subject.chapters.length > 0 &&
                        subject.chapters[0].lessons.length > 0
                            ? `/study/${course.tag}/${subject.tag}/${subject.chapters[0].lessons[0]}`
                            : "",
                    subjectTitle: subject.title,
                    hour: 0, // khởi tạo số giờ học là 0
                })),
            }));

            // Push vào learningHour
            user.learningHour.push({
                time: now,
                courses: coursesForLearningHour,
            });

            user.save();
        }

        // Dù thêm mới hay chưa thì vẫn trả về dữ liệu bình thường
        res.status(200).json({
            message: "Mật khẩu mới đã được gửi đến email của bạn",
        });
    } catch (error) {
        res.status(500).json({
            message: "Lỗi server",
        });
    }
};
// PUT /user/lesson-done
const SetLessonDone = async (req, res) => {
    try {
        // Các query có thể có khi get data
        const { id, lessonId } = req.query;

        let data; // Biến lưu trữ dữ liệu ban đầu khi get

        // Nếu có 1 biến query phù hợp thì sẽ get còn không thì trả về toàn bộ dữ liệu trong csdl
        if (id) {
            data = await User.findById(id);
        }

        // Nếu không có dữ liệu nào thì báo lỗi 404 - Not Found
        if (!data)
            return res
                .status(404)
                .json({ data: [], message: "Data not found" });

        let updated = false;

        const updatedLearned = data.learned.map((course) => {
            const updatedSubjects = course.subjects.map((subject) => {
                const updatedLessons = subject.lessons.map((lesson) => {
                    if (lesson.lessonId === lessonId) {
                        updated = true;
                        return { ...lesson, isDone: true };
                    }
                    return lesson;
                });

                return { ...subject, lessons: updatedLessons };
            });

            return { ...course.toObject(), subjects: updatedSubjects };
        });

        if (!updated) {
            return res
                .status(404)
                .json({ message: "Lesson not found in user's learned data" });
        }

        data.learned = updatedLearned;
        await data.save();

        return res.json({ message: "Lesson set done", data: data });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

module.exports = {
    GetData,
    GetOne,
    GetStorage,
    GetLearningHour,
    GetProgress,
    GetAverageScore,
    Create,
    Update,
    UpdateEmail,
    UpdatePassword,
    CheckLearningHour,
    Login,
    VerifyToken,
    Register,
    SendOTP,
    Verify,
    SendPassword,
    SetLessonDone,
};
