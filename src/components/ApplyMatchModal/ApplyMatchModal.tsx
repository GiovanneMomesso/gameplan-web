import React, { useState, FormEvent } from 'react';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './ApplyMatchModal.module.css';

interface ApplyMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (position: string) => void;
    isLoading?: boolean;
}

const ApplyMatchModal: React.FC<ApplyMatchModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const [position, setPosition] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!position.trim()) {
            setError('Position is required');
            return;
        }
        onConfirm(position.trim());
    };

    const handleClose = () => {
        setPosition('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Join Match">
            <form onSubmit={handleSubmit} className={styles.form}>
                <p>Please specify your preferred position for this match.</p>
                <Input
                    label="Position"
                    placeholder="e.g., Goalkeeper, Striker"
                    value={position}
                    onChange={(e) => {
                        setPosition(e.target.value);
                        setError('');
                    }}
                    error={error}
                    required
                    autoFocus
                />

                <div className={styles.actions}>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Join Match
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ApplyMatchModal;
