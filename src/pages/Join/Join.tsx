import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSubmitInvite } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/Spinner/Spinner';
import Card from '../../components/Card/Card';
import styles from './Join.module.css';

const Join: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isInitializing } = useAuth();
    const submitInvite = useSubmitInvite();

    const hash = searchParams.get('hash');

    useEffect(() => {
        const handleJoin = async () => {
            if (!hash) {
                return;
            }

            // Wait for auth initialization
            if (isInitializing) {
                return;
            }

            if (!isAuthenticated) {
                // Determine existing redirect or current full URL
                // We want to redirect back to /join?hash=...
                const currentPath = location.pathname + location.search;
                navigate('/login', { state: { from: currentPath } });
                return;
            }

            // Attempt to join
            try {
                const groupId = await submitInvite.mutateAsync({ secretHash: hash });
                navigate(`/groups/${groupId}`);
            } catch (error) {
                console.error('Failed to join group:', error);
                // Error handling is managed by rendering logic below
            }
        };

        handleJoin();
    }, [hash, isAuthenticated, isInitializing, navigate, submitInvite, location]);

    if (!hash) {
        return (
            <div className={styles.container}>
                <Card>
                    <div className={styles.error}>
                        <h2>Invalid Invite Link</h2>
                        <p>The invite link is missing a required code.</p>
                        <button onClick={() => navigate('/')} className={styles.button}>
                            Go Home
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    if (submitInvite.isError) {
        return (
            <div className={styles.container}>
                <Card>
                    <div className={styles.error}>
                        <h2>Failed to Join Group</h2>
                        <p>{submitInvite.error?.message || 'The invite link may be invalid or expired.'}</p>
                        <button onClick={() => navigate('/')} className={styles.button}>
                            Go Home
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.loading}>
                <Spinner size="large" />
                <p>Joining group...</p>
            </div>
        </div>
    );
};

export default Join;
