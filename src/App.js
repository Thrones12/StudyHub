import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { pdfjs } from "react-pdf";
import { AuthProvider } from "./context/AuthContext";
// Layout
import { ProfileLayout, BasicLayout, MainLayout, StudyLayout } from "./layouts";
// Page dùng main layout
import HomePage from "./pages/HomePage/HomePage";
import {
    AccountPage,
    StatisPage,
    ActivitiesPage,
    CoursePage,
    StudyPage,
    StoragePage,
    StorageItemPage,
    StudyExamPage,
    ExamPage,
    NotificationPage,
    CalendarPage,
} from "./pages";
// Page dùng basic layout
import SoundSpacePage from "./pages/SoundSpacePage/SoundSpacePage";
import StudyGroupPage from "./pages/StudyGroupPage/StudyGroupPage";
import { AuthPage, ForgotPage, VerifyPage } from "./pages";

// Cấu hình đường dẫn worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path='/' element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path='course' element={<CoursePage />} />
                        <Route path='storage' element={<StoragePage />} />
                        <Route
                            path='storage/:storageId'
                            element={<StorageItemPage />}
                        />
                        <Route path='exam' element={<ExamPage />} />
                        <Route
                            path='sound-space'
                            element={<SoundSpacePage />}
                        />
                        <Route
                            path='notification'
                            element={<NotificationPage />}
                        />
                        <Route path='calendar' element={<CalendarPage />} />
                        <Route
                            path='calendar/:year/:month'
                            element={<CalendarPage />}
                        />
                    </Route>
                    <Route path='/' element={<BasicLayout />}>
                        <Route
                            path='exam/:examId'
                            element={<StudyExamPage />}
                        />
                    </Route>
                    {/* Auth */}
                    <Route path='/auth/' element={<BasicLayout />}>
                        <Route index element={<AuthPage />} />
                        <Route path='forgot' element={<ForgotPage />} />
                        <Route path='verify' element={<VerifyPage />} />
                    </Route>
                    {/* Profile */}
                    <Route path='/profile/' element={<ProfileLayout />}>
                        <Route index element={<AccountPage />} />
                        <Route path='account' element={<AccountPage />} />
                        <Route path='statis' element={<StatisPage />} />
                        <Route path='activities' element={<ActivitiesPage />} />
                    </Route>
                    {/* Study  */}
                    <Route
                        path='/study/:courseTag/:subjectTag/'
                        element={<StudyLayout />}
                    >
                        <Route path=':lessonId' element={<StudyPage />} />
                        <Route
                            path='exam/:chapterId'
                            element={<StudyExamPage />}
                        />
                    </Route>
                    {/* Other */}
                    <Route path='/study-group/' element={<BasicLayout />}>
                        <Route index element={<StudyGroupPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
