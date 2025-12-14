import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../api';
import Button from '../Button/Button';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const { data: user } = useCurrentUser(isAuthenticated);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <span className={styles.logoIcon}>⚽</span>
                    <span className={styles.logoText}>Gameplan</span>
                </Link>

                {isAuthenticated && (
                    <div className={styles.actions}>
                        {user && <span className={styles.userName}>{user.name}</span>}
                        <button
                            className={styles.hamburger}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <span className={styles.hamburgerLine}></span>
                            <span className={styles.hamburgerLine}></span>
                            <span className={styles.hamburgerLine}></span>
                        </button>

                        <div className={`${styles.menu} ${isMenuOpen ? styles.menuOpen : ''}`}>
                            <button
                                className={styles.menuItem}
                                onClick={() => handleNavigate('/')}
                            >
                                🏠 My Groups
                            </button>

                            <div className={styles.menuDivider}></div>
                            <Button variant="secondary" onClick={handleLogout} className={styles.logoutButton}>
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
