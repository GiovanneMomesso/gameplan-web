import React, { useState, FormEvent } from 'react';
import { useSportPositions } from '../../api';
import { displayPosition } from '../../utils/positionUtils';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './ApplyMatchModal.module.css';

interface ApplyMatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (position: string) => void;
    isLoading?: boolean;
    sportType?: string | null;
}

const ApplyMatchModal: React.FC<ApplyMatchModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
    sportType,
}) => {
    const [position, setPosition] = useState('');
    const [error, setError] = useState('');

    const { data: positions, isLoading: isPositionsLoading } = useSportPositions(sportType);

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

    const hasPositions = positions && positions.length > 0;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Join Match">
            <form onSubmit={handleSubmit} className={styles.form}>
                <p>Please specify your preferred position for this match.</p>
                
                {isPositionsLoading ? (
                    <p>Loading positions...</p>
                ) : hasPositions ? (
                    <div className={styles.selectContainer}>
                        <label className={styles.label}>Position</label>
                        <select
                            value={position}
                            onChange={(e) => {
                                setPosition(e.target.value);
                                setError('');
                            }}
                            className={styles.select}
                            required
                        >
                            <option value="">Select a position...</option>
                            {positions?.map(pos => (
                                <option key={pos} value={pos}>{displayPosition(pos)}</option>
                            ))}
                        </select>
                        {error && <span className={styles.errorText}>{error}</span>}
                    </div>
                ) : (
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
                )}

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
