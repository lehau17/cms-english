import { Card, CardContent, Pagination, Stack, Typography } from '@mui/material';
import React from 'react';

interface PaginationBarProps {
    page: number;
    totalPages: number | undefined;
    totalItems: number | undefined;
    limit: number;
    onPageChange: (page: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({
    page,
    totalPages,
    totalItems,
    limit,
    onPageChange,
}) => {
    const safeTotalPages = totalPages ?? 1;
    const safeTotalItems = totalItems ?? 0;

    if (safeTotalPages <= 1) {
        return null;
    }

    const startItem = ((page - 1) * limit) + 1;
    const endItem = Math.min(page * limit, safeTotalItems);

    return (
        <Card sx={{ mt: 3 }}>
            <CardContent>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="body2" color="text.secondary">
                        Showing {startItem} to {endItem} of {safeTotalItems} results
                    </Typography>
                    <Pagination
                        count={safeTotalPages}
                        page={page}
                        onChange={(_event, newPage) => onPageChange(newPage)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Stack>
            </CardContent>
        </Card>
    );
};

