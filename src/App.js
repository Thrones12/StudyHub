import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { pdfjs } from "react-pdf";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import { MainLayout, BasicLayout, ProfileLayout, StudyLayout } from "./layouts";

// Route files
import MainRoutes from "./routes/MainRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import ProfileRoutes from "./routes/ProfileRoutes";
import StudyRoutes from "./routes/StudyRoutes";

// Cấu hình PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path='/' element={<MainLayout />}>
                        {MainRoutes}
                    </Route>

                    <Route path='/auth'>{AuthRoutes}</Route>

                    <Route path='/profile' element={<ProfileLayout />}>
                        {ProfileRoutes}
                    </Route>

                    <Route
                        path='/study/:courseTag/:subjectTag'
                        element={<StudyLayout />}
                    >
                        {StudyRoutes}
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
