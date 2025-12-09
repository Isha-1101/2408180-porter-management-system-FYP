import Form from '../components/common/Form';
import { login } from '../store/authSlice';
import { loginUser } from '../service/authService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { loginFormValidator } from '../utils/formValidator';
import { setLoading } from '../store/loadingSlice';
import { useAppDispatch } from '../hooks/redux';

const Login = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const submitHandler = async (data) => {
        dispatch(setLoading(true));

        const validation = loginFormValidator(data.username, data.password);
        if (validation) {
            toast.error(validation);
            dispatch(setLoading(false));
            return;
        }

        try {
            const res = await loginUser(data.username, data.password);

            if (res.success) {
                dispatch(login(res));
                dispatch(setLoading(false));
                toast.success(res.message);

                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                dispatch(setLoading(false));
                throw new Error(res.message);
            }
        } catch (error) {
            dispatch(setLoading(false));
            const errMsg = error.message;
            console.log(errMsg);
            toast.error(errMsg);
        }
    };

    return (
        <div>
            <Form submitHandler={submitHandler} formType="login" />
        </div>
    );
};

export default Login;
