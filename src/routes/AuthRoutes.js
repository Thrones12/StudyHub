import { Route } from "react-router-dom";
import { AuthPage, RegisterPage, ForgotPage, VerifyPage } from "../pages";

const AuthRoutes = (
    <>
        <Route index element={<AuthPage />} />
        <Route path='register' element={<RegisterPage />} />
        <Route path='forgot' element={<ForgotPage />} />
        <Route path='verify' element={<VerifyPage />} />
    </>
);

export default AuthRoutes;
