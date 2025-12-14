import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserGroups } from '../../api';
import Navbar from '../../components/Navbar/Navbar';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Spinner from '../../components/Spinner/Spinner';
import EmptyState from '../../components/EmptyState/EmptyState';
import CreateGroupModal from '../../components/CreateGroupModal/CreateGroupModal';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: groups, isLoading, error } = useUserGroups();
    const navigate = useNavigate();

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
                    <p className={styles.error}>Error loading groups: {error.message}</p>
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
                        <h1 className={styles.title}>My Groups</h1>
                        <p className={styles.subtitle}>Manage your sports groups and matches</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        + Create Group
                    </Button>
                </div>

                {groups && groups.length > 0 ? (
                    <div className={styles.grid}>
                        {groups.map((group) => (
                            <Card
                                key={group.id}
                                onClick={() => navigate(`/groups/${group.id}`)}
                                className={styles.groupCard}
                            >
                                <h3 className={styles.groupName}>{group.name}</h3>
                                <div className={styles.groupInfo}>
                                    <p className={styles.admin}>
                                        <span className={styles.label}>Admin:</span> {group.adminName}
                                    </p>
                                    <p className={styles.members}>
                                        <span className={styles.label}>Members:</span> {group.members.length}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        message="You haven't joined any groups yet"
                        action={
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                Create Your First Group
                            </Button>
                        }
                    />
                )}

                <CreateGroupModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                />
            </div>
        </>
    );
};

export default Dashboard;
