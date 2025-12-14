import React, { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSubmitInvite } from '../../api';
import Navbar from '../../components/Navbar/Navbar';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './AcceptInvite.module.css';

const AcceptInvite: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [secretHash, setSecretHash] = useState(searchParams.get('secret') || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const submitInvite = useSubmitInvite();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!secretHash) {
            setError('Secret hash is required');
            return;
        }

        try {
            await submitInvite.mutateAsync({
                secretHash: secretHash.trim(),
            });

            setSuccess(true);
            setTimeout(() => {
                navigate('/');
            }, 2000);
        } catch (err: any) {
            setError(err?.message || 'Failed to accept invite');
        }
    };

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Accept Invite</h1>
                        <p className={styles.subtitle}>Join a group using your invite code</p>
                    </div>

                    <Card>
                        <form onSubmit={handleSubmit} className={styles.form}>


                            <Input
                                label="Secret Hash"
                                type="text"
                                placeholder="Enter the invite secret hash"
                                value={secretHash}
                                onChange={(e) => setSecretHash(e.target.value)}
                                required
                            />

                            {error && <p className={styles.error}>{error}</p>}
                            {success && (
                                <p className={styles.success}>
                                    Invite accepted! Redirecting to dashboard...
                                </p>
                            )}

                            <Button
                                type="submit"
                                isLoading={submitInvite.isPending}
                                className={styles.submitButton}
                            >
                                Accept Invite
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default AcceptInvite;
