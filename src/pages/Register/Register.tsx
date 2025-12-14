import React, { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRegister } from '../../api';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import styles from './Register.module.css';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const register = useRegister();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || '/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            await register.mutateAsync({ name, email, password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login', { state: { from } });
            }, 2000);
        } catch (err: any) {
            setError(err?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join Gameplan to manage your matches</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            label="Name"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && <p className={styles.error}>{error}</p>}
                        {success && (
                            <p className={styles.success}>
                                Registration successful! Redirecting to login...
                            </p>
                        )}

                        <Button
                            type="submit"
                            isLoading={register.isPending}
                            className={styles.submitButton}
                        >
                            Create Account
                        </Button>

                        <p className={styles.footer}>
                            Already have an account?{' '}
                            <Link to="/login" className={styles.link}>
                                Sign in
                            </Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Register;
