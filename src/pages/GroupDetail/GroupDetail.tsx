import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGroupMatches, useUserGroups, useGroupMembers, GroupMember, useCurrentUser, useRemoveMember } from '../../api';
import { useQueryClient } from '@tanstack/react-query';
import { groupKeys } from '../../api/hooks/useGroups';
import Navbar from '../../components/Navbar/Navbar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import MatchCard from '../../components/MatchCard/MatchCard';
import CreateMatchModal from '../../components/CreateMatchModal/CreateMatchModal';
import InviteSection from '../../components/InviteSection/InviteSection';
import Modal from '../../components/Modal/Modal';
import styles from './GroupDetail.module.css';

const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const groupId = parseInt(id || '0', 10);
    const queryClient = useQueryClient();

    const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
    const [isMembersExpanded, setIsMembersExpanded] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);

    const { data: matches, isLoading, error } = useGroupMatches(groupId);
    const { data: groups } = useUserGroups();
    const { data: user } = useCurrentUser();
    const { data: members, isLoading: isLoadingMembers } = useGroupMembers(groupId);
    const removeMemberMutation = useRemoveMember();

    const group = groups?.find(g => g.id === groupId);
    const isAdmin = user && group ? user.id === group.adminId : false;

    const handleRemoveMember = async (member: GroupMember) => {
        setMemberToRemove(member);
    };

    const confirmRemoveMember = async () => {
        if (!memberToRemove) return;

        try {
            await removeMemberMutation.mutateAsync({
                groupId,
                userId: memberToRemove.id,
            });

            // Invalidate and refetch members list
            queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) });

            setMemberToRemove(null);
        } catch (error) {
            console.error('Failed to remove member:', error);
            alert('Failed to remove member. Please try again.');
        }
    };

    const cancelRemoveMember = () => {
        setMemberToRemove(null);
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className={styles.loading}>
                    <Spinner size="large" />
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className={styles.container}>
                    <p className={styles.error}>Error loading matches: {error.message}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{group ? group.name : 'Group Matches'}</h1>
                        <p className={styles.subtitle}>Manage and join upcoming matches</p>
                    </div>
                    {/* Only show create match if admin? Or anyone? Current code allows anyone. Assuming okay. */}
                    <Button onClick={() => setIsCreateMatchModalOpen(true)}>
                        + Create Match
                    </Button>
                </div>

                <div className={styles.content}>
                    <div className={styles.matchesSection}>
                        <h2 className={styles.sectionTitle}>Upcoming Matches</h2>
                        {matches && matches.length > 0 ? (
                            <div className={styles.matchesList}>
                                {matches.map((match) => (
                                    <MatchCard key={match.id} match={match} groupId={groupId} isAdmin={isAdmin} groupName={group ? group.name : 'Group'} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <EmptyState
                                    message="No matches scheduled yet"
                                    action={
                                        <Button onClick={() => setIsCreateMatchModalOpen(true)}>
                                            Create First Match
                                        </Button>
                                    }
                                />
                            </Card>
                        )}
                    </div>

                    <div className={styles.sidePanel}>
                        <div className={styles.membersSection}>
                            <div
                                className={styles.sectionHeader}
                                onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                            >
                                <h2 className={styles.sectionTitle}>Members</h2>
                                <span className={styles.chevron}>
                                    {isMembersExpanded ? '▼' : '▶'}
                                </span>
                            </div>

                            {isMembersExpanded && (
                                <>
                                    {isLoadingMembers ? (
                                        <div className={styles.spinnerContainer}>
                                            <Spinner size="small" />
                                        </div>
                                    ) : members && members.length > 0 ? (
                                        <div className={styles.membersList}>
                                            {members.map((member: GroupMember) => (
                                                <div key={member.id} className={styles.memberItem}>
                                                    <span className={styles.memberName}>{member.name}</span>
                                                    {isAdmin && user && member.id !== user.id && (
                                                        <button
                                                            className={styles.removeButton}
                                                            onClick={() => handleRemoveMember(member)}
                                                            title="Remove member"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.emptyText}>No members found</p>
                                    )}
                                </>
                            )}
                        </div>

                        {isAdmin && (
                            <div className={styles.inviteSection}>
                                <InviteSection groupId={groupId} />
                            </div>
                        )}
                    </div>
                </div>

                <CreateMatchModal
                    isOpen={isCreateMatchModalOpen}
                    onClose={() => setIsCreateMatchModalOpen(false)}
                    groupId={groupId}
                />

                {/* Confirmation Dialog */}
                <Modal
                    isOpen={!!memberToRemove}
                    onClose={cancelRemoveMember}
                    title="Remove Member"
                >
                    <p>
                        Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from the group?
                    </p>
                    <div className={styles.modalActions}>
                        <Button variant="secondary" onClick={cancelRemoveMember}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmRemoveMember}
                            isLoading={removeMemberMutation.isPending}
                        >
                            Remove
                        </Button>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default GroupDetail;
