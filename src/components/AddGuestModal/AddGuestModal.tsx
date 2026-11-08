import React, { useState, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAddGuest, groupKeys, useSportPositions } from '../../api';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './AddGuestModal.module.css';
import { displayPosition } from '../../utils/positionUtils';

interface AddGuestModalProps {
    isOpen: boolean;
    onClose: () => void;
    matchId: number;
    groupId: number;
    enablePositions?: boolean;
    sportType?: string | null;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({ isOpen, onClose, matchId, groupId, enablePositions, sportType }) => {
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [error, setError] = useState('');

    const queryClient = useQueryClient();
    const addGuest = useAddGuest();

    const normalizedSportType = sportType?.toUpperCase();
    const { data: positions, isLoading: isPositionsLoading } = useSportPositions(normalizedSportType || '');
    const hasPositions = positions && positions.length > 0;

    const isVolleyball = normalizedSportType === 'VOLLEYBALL';
    const isPositionMandatory = enablePositions && isVolleyball;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Guest name is required');
            return;
        }

        if (isPositionMandatory && !position.trim()) {
            setError('Position is required for volleyball matches');
            return;
        }

        try {
            await addGuest.mutateAsync({
                matchId,
                data: {
                    name: name.trim(),
                    position: enablePositions ? (position.trim() || undefined) : undefined,
                },
            });

            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            handleClose();
        } catch (err: any) {
            setError(err?.message || 'Failed to add guest');
        }
    };

    const handleClose = () => {
        setName('');
        setPosition('');
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add Guest">
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Guest Name"
                    type="text"
                    placeholder="e.g., John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                {enablePositions && (
                    isPositionsLoading ? (
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>Loading positions...</p>
                    ) : (hasPositions || isVolleyball) ? (
                        <div className={styles.selectContainer}>
                            <label className={styles.label}>Position {isPositionMandatory ? '' : '(Optional)'}</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className={styles.select}
                                required={isPositionMandatory}
                            >
                                <option value="">Select a position... {!isPositionMandatory && '(Optional)'}</option>
                                {(hasPositions ? positions : ['Outside hitter', 'Opposite', 'Setter', 'Middle blocker', 'Libero']).map(pos => (
                                    <option key={pos} value={pos}>{displayPosition(pos)}</option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <Input
                            label={`Position ${isPositionMandatory ? '' : '(Optional)'}`}
                            type="text"
                            placeholder="e.g., Goalkeeper"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            required={isPositionMandatory}
                        />
                    )
                )}

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.actions}>
                    <Button type="button" variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={addGuest.isPending}>
                        Add Guest
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default AddGuestModal;
