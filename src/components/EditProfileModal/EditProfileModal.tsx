import React, { useState, FormEvent, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useUpdateUser } from '../../api';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './EditProfileModal.module.css';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const { data: user } = useCurrentUser();
    const updateUser = useUpdateUser();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (isOpen && user) {
            setName(user.name);
            setError('');
            setSuccess(false);
        }
    }, [isOpen, user]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        try {
            await updateUser.mutateAsync({ name: name.trim() });

            // Invalidate the current user query to refresh the data
            queryClient.invalidateQueries({ queryKey: ['users', 'me'] });

            setSuccess(true);

            // Close modal after a short delay to show success message
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err: any) {
            setError(err?.message || 'Failed to update profile');
        }
    };

    const handleClose = () => {
        setError('');
        setSuccess(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Edit Profile">
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Name"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>Profile updated successfully!</p>}

                <div className={styles.actions}>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={updateUser.isPending}>
                        Save Changes
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditProfileModal;
