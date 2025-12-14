import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGroupMatches, useUserGroups, useGroupMembers, GroupMember } from '../../api';
import Navbar from '../../components/Navbar/Navbar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import MatchCard from '../../components/MatchCard/MatchCard';
import CreateMatchModal from '../../components/CreateMatchModal/CreateMatchModal';
import InviteSection from '../../components/InviteSection/InviteSection';
import styles from './GroupDetail.module.css';

const GroupDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const groupId = parseInt(id || '0', 10);

    const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
    const [isMembersExpanded, setIsMembersExpanded] = useState(false);
    const { data: matches, isLoading, error } = useGroupMatches(groupId);
    const { data: groups } = useUserGroups();
    const { data: members, isLoading: isLoadingMembers } = useGroupMembers(groupId);
    const group = groups?.find(g => g.id === groupId);

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
                                    <MatchCard key={match.id} match={match} groupId={groupId} />
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
                                                    {member.name}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className={styles.emptyText}>No members found</p>
                                    )}
                                </>
                            )}
                        </div>

                        <div className={styles.inviteSection}>
                            <InviteSection groupId={groupId} />
                        </div>
                    </div>
                </div>

                <CreateMatchModal
                    isOpen={isCreateMatchModalOpen}
                    onClose={() => setIsCreateMatchModalOpen(false)}
                    groupId={groupId}
                />
            </div>
        </>
    );
};

export default GroupDetail;
