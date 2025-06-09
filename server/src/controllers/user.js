const User = require("../models/user");
const Course = require("../models/course");
const Exam = require("../models/exam");
const ExamResult = require("../models/examResult");
const Lesson = require("../models/lesson");
const Todo = require("../models/todo");
const bcrypt = require("bcryptjs");
const cloudinary = require("../configs/cloudinary");
const streamifier = require("streamifier");

// Get all users
exports.getAll = async (req, res) => {
    try {
        const users = await User.find().sort({ timestamp: -1 });
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one user by ID
exports.getOne = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get bài học đã hoàn thành
exports.getDoneLessonsByUser = async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Lọc các lesson đã hoàn thành
        const doneLessons = [];

        user.learned.forEach((course) => {
            course.subjects.forEach((subject) => {
                subject.lessons.forEach((lesson) => {
                    if (lesson.isDone) {
                        doneLessons.push(lesson.lessonId);
                    }
                });
            });
        });
        console.log(doneLessons);

        res.json(doneLessons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get bài kiểm tra đã lưu trữ
exports.getSavesByUser = async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId).populate({
            path: "saves",
            modal: "Exam",
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user.saves.reverse());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get bài học đã yêu thích
exports.getLikesByUser = async (req, res) => {
    try {
        const { userId } = req.query;

        const user = await User.findById(userId).populate({
            path: "likes",
            modal: "Lesson",
            populate: {
                path: "chapterId",
                model: "Chapter",
                populate: {
                    path: "subjectId",
                    model: "Subject",
                    populate: {
                        path: "courseId",
                        model: "Course",
                        select: "title", // chỉ lấy course title
                    },
                    select: "title", // chỉ lấy subject title
                },
            },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let lessons = user.likes.reverse();
        const formattedLessons = lessons.map((lesson) => ({
            ...lesson.toObject(),
            subjectTitle: lesson.chapterId?.subjectId?.title || null,
            courseTitle: lesson.chapterId?.subjectId?.courseId?.title || null,
            link: `/lesson${lesson._id}`,
        }));

        res.json(formattedLessons);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /user/get-learning-hour?id=...
exports.getLearningHour = async (req, res) => {
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
        console.log(id);

        // 404 - Not Found
        if (!data) return res.status(201).json({ data });

        // 200 - Success
        return res.status(200).json({ data: data });
    } catch (err) {
        return res.status(500).json({ message: "Lỗi server" });
    }
};
// GET /user/get-progress?id=...
exports.getProgress = async (req, res) => {
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
                        link: `/study/lesson/${subject.chapters[0].lessons[0]}`,
                    });
            }
        }

        // 200 - Success
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ data: [], message: "Lỗi server" });
    }
};

// GET /user/get-average-score?id=...&courseId=...
exports.getAverageScore = async (req, res) => {
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
        console.log(user);

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
// Get lịch sử tìm kiếm
exports.getSearch = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Sắp xếp searchs theo timestamp giảm dần và lấy 20 phần tử đầu tiên
        const sortedSearches = user.searchs
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        res.json(sortedSearches);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Thêm lịch sử học mới
exports.addHistory = async (req, res) => {
    try {
        const { userId, link, lessonId, examId } = req.body;

        let user = await User.findById(userId);

        // Xóa link nếu đã tồn tại
        user.histories = user.histories.filter((item) => item !== link);

        // Thêm link vào đầu danh sách
        user.histories.unshift(link);

        // Lưu lại
        await user.save();

        if (lessonId) {
            let lesson = await Lesson.findById(lessonId);
            lesson.views += 1;
            await lesson.save();
        }

        if (examId) {
            let exam = await Exam.findById(examId);
            exam.views += 1;
            await exam.save();
        }

        res.status(201).json(user);
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
    }
};
// POST /user/check-learning-hour
exports.checkLearningHour = async (req, res) => {
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
                            ? `/study/lesson/${subject.chapters[0].lessons[0]}`
                            : "",
                    subjectTitle: subject.title,
                    subjectId: subject._id,
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
// Create a new user
exports.create = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            status,
            fullname,
            gender,
            address,
            phone,
            birthdate,
            school,
            grade,
            hobby,
            interests,
        } = req.body;

        let existingUser = await User.findOne({
            $or: [{ username }, { email }],
        });
        if (existingUser)
            return res.status(404).json("Tên đăng nhập hoặc email đã tồn tại");

        const courses = await Course.find().populate({
            path: "subjects",
            model: "Subject",
            populate: {
                path: "chapters",
                model: "Chapter",
                populate: {
                    path: "lessons",
                    model: "Lesson",
                },
            },
        });
        // Tạo mảng learned theo cấu trúc mới
        const learned = courses.map((course) => ({
            courseId: course._id.toString(),
            subjects: course.subjects.map((subject) => {
                // Gom tất cả lesson từ tất cả chapters
                const allLessons = subject.chapters.flatMap((chapter) =>
                    chapter.lessons.map((lesson) => ({
                        lessonId: lesson._id.toString(),
                        isDone: false,
                    }))
                );

                return {
                    subjectId: subject._id.toString(),
                    lessons: allLessons,
                };
            }),
        }));
        const user = new User({
            ...req.body,
            learned: learned,
        });

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        if (status) user.status = status;
        if (fullname) user.profile.fullname = fullname;
        if (gender) user.profile.gender = gender;
        if (address) user.profile.address = address;
        if (phone) user.profile.phone = phone;
        if (birthdate) user.profile.birthdate = birthdate;
        if (school) user.profile.school = school;
        if (grade) user.profile.grade = grade;
        if (hobby) user.profile.hobby = hobby;
        if (interests) user.profile.interests = interests;

        const file = req.file;
        if (file) {
            try {
                const uploadResult = await streamUpload(file.buffer);
                user.profile.avatarUrl = uploadResult.secure_url;
            } catch (err) {
                return res.status(500).json({ message: "Lỗi upload ảnh" });
            }
        }

        let todo = new Todo({ name: "Công việc" });
        await todo.save();
        user.todos.push(todo._id);

        const newUser = await user.save();

        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json(err.message);
    }
};

// Thêm lịch sử tìm kiếm
exports.addSearch = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { link, ...rest } = req.body;
        const now = Date.now();

        // Tìm xem đã có search nào trùng link chưa
        const existingSearch = user.searchs.find(
            (search) => search.link === link
        );

        if (existingSearch) {
            // Nếu có thì cập nhật timestamp
            existingSearch.timestamp = now;
        } else {
            // Nếu không có thì thêm mới
            user.searchs.push({ link, ...rest, timestamp: now });
        }

        await user.save();
        res.status(201).json({ link, ...rest, timestamp: now });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update email
exports.updateEmail = async (req, res) => {
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

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json("Lỗi server");
    }
};

// Update mật khẩu
exports.updatePassword = async (req, res) => {
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

// Update hồ sơ
exports.updateProfile = async (req, res) => {
    try {
        const {
            fullname,
            gender,
            address,
            phone,
            birthdate,
            school,
            grade,
            hobby,
            interests,
        } = req.body;

        let updatedUser = await User.findById(req.params.id);
        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });
        // Update
        if (fullname) updatedUser.profile.fullname = fullname;
        if (gender) updatedUser.profile.gender = gender;
        if (address) updatedUser.profile.address = address;
        if (phone) updatedUser.profile.phone = phone;
        if (birthdate) updatedUser.profile.birthdate = birthdate;
        if (school) updatedUser.profile.school = school;
        if (grade) updatedUser.profile.grade = grade;
        if (hobby) updatedUser.profile.hobby = hobby;
        if (interests) updatedUser.profile.interests = interests;

        const file = req.file;
        if (file) {
            try {
                const uploadResult = await streamUpload(file.buffer);
                updatedUser.profile.avatarUrl = uploadResult.secure_url;
            } catch (err) {
                return res.status(500).json({ message: "Lỗi upload ảnh" });
            }
        }

        await updatedUser.save();

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update user
exports.update = async (req, res) => {
    try {
        const {
            _id,
            password,
            status,
            fullname,
            gender,
            address,
            phone,
            birthdate,
            school,
            grade,
            hobby,
            interests,
        } = req.body;
        let updatedUser = await User.findById(_id);

        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });
        // Update
        if (password) {
            updatedUser.password = await bcrypt.hash(password, 10);
        }
        if (status) updatedUser.status = status;
        if (fullname) updatedUser.profile.fullname = fullname;
        if (gender) updatedUser.profile.gender = gender;
        if (address) updatedUser.profile.address = address;
        if (phone) updatedUser.profile.phone = phone;
        if (birthdate) updatedUser.profile.birthdate = birthdate;
        if (school) updatedUser.profile.school = school;
        if (grade) updatedUser.profile.grade = grade;
        if (hobby) updatedUser.profile.hobby = hobby;
        if (interests) updatedUser.profile.interests = interests;

        const file = req.file;
        if (file) {
            try {
                const uploadResult = await streamUpload(file.buffer);
                updatedUser.profile.avatarUrl = uploadResult.secure_url;
            } catch (err) {
                return res.status(500).json({ message: "Lỗi upload ảnh" });
            }
        }

        await updatedUser.save();

        res.json(updatedUser);
    } catch (err) {
        console.log(err);

        res.status(400).json({ message: err.message });
    }
};

// Lưu trữ / hủy lưu trữ bài kiểm tra
exports.saveExam = async (req, res) => {
    try {
        const { userId, examId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại" });
        }
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res
                .status(404)
                .json({ message: "Bài kiểm tra không tồn tại" });
        }

        let isSaved = false;

        // Kiểm tra nếu đã lưu rồi thì xóa khỏi saves, ngược lại thì thêm vào
        const index = user.saves.indexOf(examId);
        if (index > -1) {
            user.saves.splice(index, 1);
            isSaved = false;
            exam.saves -= 1;
        } else {
            user.saves.push(examId);
            isSaved = true;
            exam.saves += 1;
        }

        await user.save();
        await exam.save();

        // Loại bỏ password trước khi trả về
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            user: userObj,
            isSaved,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Yêu thích / hủy yêu thích bài học
exports.likeLesson = async (req, res) => {
    try {
        const { userId, lessonId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "Người dùng không tồn tại" });
        }
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: "Bài học không tồn tại" });
        }

        let isLiked = false;

        // Kiểm tra nếu đã lưu rồi thì xóa khỏi saves, ngược lại thì thêm vào
        const index = user.likes.indexOf(lessonId);
        if (index > -1) {
            user.likes.splice(index, 1);
            isLiked = false;
            lesson.likes -= 1;
        } else {
            user.likes.push(lessonId);
            isLiked = true;
            lesson.likes += 1;
        }

        await user.save();
        await lesson.save();

        // Loại bỏ password trước khi trả về
        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            user: userObj,
            isLiked,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Xử lý hoàn thành bài học
exports.learnedLesson = async (req, res) => {
    try {
        const { userId, lessonId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json("Không tìm thấy user");

        // Duyệt qua từng course
        for (const course of user.learned) {
            // Duyệt qua từng subject
            for (const subject of course.subjects) {
                // Duyệt qua từng lesson
                const lesson = subject.lessons.find(
                    (l) => l.lessonId === lessonId
                );
                if (lesson) {
                    lesson.isDone = true;
                }
            }
        }

        await user.save();

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json(userObj);
    } catch (err) {
        console.error(err);
        res.status(500).json("Lỗi server");
    }
};

// Add new image to custom theme
exports.addImageToTheme = async (req, res) => {
    try {
        const { id } = req.body;
        const buffer = req.file.buffer;

        const updatedUser = await User.findById(id);
        if (!updatedUser)
            return res.status(404).json({ message: "User not found" });

        if (buffer) {
            try {
                const uploadResult = await streamUpload(buffer);
                updatedUser.customThemes.push(uploadResult.secure_url);
            } catch (err) {
                return res.status(500).json({ message: "Lỗi upload ảnh" });
            }
        }
        await updatedUser.save();

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image", folder: "backgrounds" },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// Delete image of custom theme
exports.deleteImageOfTheme = async (req, res) => {
    try {
        const { id, image } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Tìm vị trí ảnh trong mảng customThemes
        const index = user.customThemes.indexOf(image);
        if (index === -1) {
            return res
                .status(404)
                .json({ message: "Image not found in user theme" });
        }

        // Xóa ảnh khỏi Cloudinary
        const publicId = extractPublicId(image);
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error("Lỗi xoá ảnh Cloudinary:", err);
            return res
                .status(500)
                .json({ message: "Lỗi xoá ảnh trên Cloudinary" });
        }

        // Xóa ảnh khỏi mảng customThemes
        user.customThemes.splice(index, 1);
        await user.save();

        res.json({ message: "Xóa ảnh thành công" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
// Hàm helper: trích xuất public_id từ secure_url
const extractPublicId = (secureUrl) => {
    const parts = secureUrl.split("/");
    const fileName = parts[parts.length - 1].split(".")[0]; // Ví dụ: "abc123"
    const folder = parts[parts.length - 2]; // Ví dụ: "custom_themes"
    return `${folder}/${fileName}`;
};

// Delete a user by ID
exports.delete = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser)
            return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.logTime = async (req, res) => {
    try {
        const { userId, subjectId, second } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Tìm bản ghi learningHour có cùng tháng và năm
        let monthEntry = user.learningHour.find((entry) => {
            const entryDate = new Date(entry.time);
            return (
                entryDate.getMonth() === currentMonth &&
                entryDate.getFullYear() === currentYear
            );
        });
        // Đã có entry của tháng
        if (monthEntry) {
            // Duyệt qua từng course để tìm subject
            let subjectFound = false;

            for (let course of monthEntry.courses) {
                const subject = course.subjects.find(
                    (s) => s.subjectId === subjectId
                );
                if (subject) {
                    console.log(subject.second + second);

                    subject.second += second;
                    subjectFound = true;
                    break;
                }
            }
        }
        await user.save();
        res.status(200).json({ message: "Time logged successfully" });
    } catch (error) {
        console.error("logTime error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
