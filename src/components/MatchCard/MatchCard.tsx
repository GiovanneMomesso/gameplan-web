import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MatchSummary, useApplyForMatch, useDeleteMatch, useCancelMatchApplication, useCurrentUser, groupKeys } from '../../api';
import { formatDateTime } from '../../utils/dateFormatter';
import Card from '../Card/Card';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import EditMatchModal from '../EditMatchModal/EditMatchModal';
import ApplyMatchModal from '../ApplyMatchModal/ApplyMatchModal';
import styles from './MatchCard.module.css';

interface MatchCardProps {
    match: MatchSummary;
    groupId: number;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, groupId }) => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);

    const [copiedAddress, setCopiedAddress] = useState(false);

    const queryClient = useQueryClient();
    const applyForMatch = useApplyForMatch();
    const cancelApplication = useCancelMatchApplication();
    const deleteMatch = useDeleteMatch();
    const { data: user } = useCurrentUser();

    const isParticipant = user && match.participants.some(p => {
        const pId = p.userId || p.id;
        return pId && String(pId) === String(user.id);
    });

    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    const handleApplyClick = () => {
        if (match.enablePositions) {
            setIsApplyModalOpen(true);
        } else {
            handleJoinMatch();
        }
    };

    const handleJoinMatch = async (position?: string) => {
        try {
            await applyForMatch.mutateAsync({ matchId: match.id, position });
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            setIsApplyModalOpen(false);
        } catch (error) {
            console.error('Failed to apply for match:', error);
        }
    };

    const handleLeave = async () => {
        try {
            await cancelApplication.mutateAsync(match.id);
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
        } catch (error) {
            console.error('Failed to leave match:', error);
        }
    };

    const handleDeleteClick = () => {
        setIsMenuOpen(false);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteMatch.mutateAsync(match.id);
            queryClient.invalidateQueries({ queryKey: groupKeys.matches(groupId) });
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Failed to delete match:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <>
            <Card className={styles.matchCard}>
                <div className={styles.header}>
                    <div>
                        <h3 className={styles.location}>{match.location}</h3>
                        {match.address && (
                            <div className={styles.addressWrapper}>
                                <p className={styles.address}>{match.address}</p>
                                <button
                                    onClick={() => handleCopyAddress(match.address)}
                                    className={`${styles.copyButton} ${copiedAddress ? styles.copyButtonSuccess : ''}`}
                                    aria-label="Copy address"
                                    title="Copy address"
                                >
                                    {copiedAddress ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                        <p className={styles.time}>{formatDateTime(match.time)}</p>
                    </div>
                    <div className={styles.headerRight}>
                        <div className={styles.price}>${match.pricePerMember}</div>
                        <div className={styles.menuContainer} ref={menuRef}>
                            <button
                                className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonActive : ''}`}
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label="Match options"
                            >
                                ⋮
                            </button>
                            {isMenuOpen && (
                                <div className={styles.dropdown}>
                                    <button
                                        className={styles.menuItem}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsEditModalOpen(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={`${styles.menuItem} ${styles.menuItemDelete}`}
                                        onClick={handleDeleteClick}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.participants}>
                    <p className={styles.participantsLabel}>
                        Participants ({match.participants.length})
                    </p>
                    <div className={styles.participantsList}>
                        {match.participants.map((participant) => (
                            <span key={participant.userId || participant.id} className={styles.participant}>
                                <span className={styles.participantName}>
                                    {participant.name || `User ${participant.userId || participant.id}`}
                                </span>
                                {participant.position && (
                                    <span className={styles.participantPosition}>
                                        ({participant.position})
                                    </span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                <div className={styles.actions}>
                    {isParticipant ? (
                        <Button variant="danger" onClick={handleLeave} isLoading={cancelApplication.isPending}>
                            Leave
                        </Button>
                    ) : (
                        <Button onClick={handleApplyClick} isLoading={applyForMatch.isPending}>
                            Apply
                        </Button>
                    )}
                </div>
            </Card>

            <EditMatchModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                match={match}
                groupId={groupId}
            />

            <ApplyMatchModal
                isOpen={isApplyModalOpen}
                onClose={() => setIsApplyModalOpen(false)}
                onConfirm={handleJoinMatch}
                isLoading={applyForMatch.isPending}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Match"
            >
                <p>Are you sure you want to delete this match? This action cannot be undone.</p>
                <div className={styles.modalActions}>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} isLoading={deleteMatch.isPending}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default MatchCard;
