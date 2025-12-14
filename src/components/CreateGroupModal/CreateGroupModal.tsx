import React, { useState, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateGroup, groupKeys } from '../../api';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './CreateGroupModal.module.css';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const queryClient = useQueryClient();
    const createGroup = useCreateGroup();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Group name is required');
            return;
        }

        try {
            await createGroup.mutateAsync({ name: name.trim() });
            queryClient.invalidateQueries({ queryKey: groupKeys.list() });
            setName('');
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to create group');
        }
    };

    const handleClose = () => {
        setName('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Create New Group">
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Group Name"
                    type="text"
                    placeholder="Enter group name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={error}
                    required
                />

                <div className={styles.actions}>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={createGroup.isPending}>
                        Create Group
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateGroupModal;
