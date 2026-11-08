import React from 'react';
import { ParticipantStatus } from '../../api';
import styles from './ParticipantStatusBadge.module.css';

interface ParticipantStatusBadgeProps {
    status: ParticipantStatus;
}

const ParticipantStatusBadge: React.FC<ParticipantStatusBadgeProps> = ({ status }) => {
    const getStatusConfig = () => {
        switch (status) {
            case ParticipantStatus.PENDING:
                return {
                    className: styles.pending,
                    label: 'Pending',
                    icon: '⏳',
                };
            case ParticipantStatus.APPROVED:
                return {
                    className: styles.approved,
                    label: 'Approved',
                    icon: '✓',
                };
            case ParticipantStatus.REFUSED:
                return {
                    className: styles.refused,
                    label: 'Refused',
                    icon: '✗',
                };
            default:
                return {
                    className: styles.approved,
                    label: 'Approved',
                    icon: '✓',
                };
        }
    };

    const config = getStatusConfig();

    return (
        <span className={`${styles.badge} ${config.className}`}>
            <span className={styles.icon}>{config.icon}</span>
            <span className={styles.label}>{config.label}</span>
        </span>
    );
};

export default ParticipantStatusBadge;
