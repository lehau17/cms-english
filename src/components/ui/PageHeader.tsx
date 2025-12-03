import { Add as AddIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    createButtonLabel?: string;
    onCreateClick?: () => void;
    actionButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    createButtonLabel,
    onCreateClick,
    actionButton,
}) => {
    return (
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            flexWrap="wrap"
            gap={2}
            mb={3}
        >
            <Box>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {title}
                </Typography>
                {description && (
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                )}
            </Box>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                {onCreateClick && createButtonLabel && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={onCreateClick}
                        sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                    >
                        {createButtonLabel}
                    </Button>
                )}
                {actionButton}
            </Box>
        </Box>
    );
};

