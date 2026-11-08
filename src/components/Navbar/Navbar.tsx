import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrentUser } from '../../api';
import Button from '../Button/Button';
import EditProfileModal from '../EditProfileModal/EditProfileModal';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const { data: user } = useCurrentUser(isAuthenticated);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMenuOpen(false);
    };

    const handleEditProfile = () => {
        setIsEditProfileOpen(true);
        setIsMenuOpen(false);
    };

    useEffect(() => {
        const handleScroll = () => {
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link to="/" className={styles.logo}>
                    <span className={styles.logoIcon}>⚽</span>
                    <span className={styles.logoText}>Gameplan</span>
                </Link>

                {isAuthenticated && (
                    <div className={styles.actions} ref={menuRef}>
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

                            <button
                                className={styles.menuItem}
                                onClick={handleEditProfile}
                            >
                                ✏️ Edit Profile
                            </button>

                            <div className={styles.menuDivider}></div>
                            <Button variant="secondary" onClick={handleLogout} className={styles.logoutButton}>
                                Logout
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
            />
        </nav>
    );
};

export default Navbar;
