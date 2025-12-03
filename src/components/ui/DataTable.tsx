import {
    Box,
    Card,
    Checkbox,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import React, { ReactNode } from 'react';

export interface TableColumn<T> {
    id: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    render?: (row: T) => ReactNode;
    minWidth?: number;
}

export interface ActionButton<T> {
    icon: ReactNode;
    label: string;
    color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
    onClick: (row: T) => void;
}

interface DataTableProps<T> {
    columns: TableColumn<T>[];
    data: T[];
    isLoading?: boolean;
    actions?: ActionButton<T>[];
    emptyState?: {
        icon?: ReactNode;
        title: string;
        description: string;
        actionButton?: ReactNode;
    };
    getRowId: (row: T) => string | number;
    selectedRows?: (string | number)[];
    onSelectionChange?: (selected: (string | number)[]) => void;
}

export function DataTable<T>({
    columns,
    data,
    isLoading = false,
    actions,
    emptyState,
    getRowId,
    selectedRows = [],
    onSelectionChange,
}: DataTableProps<T>) {
    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onSelectionChange) {
            if (event.target.checked) {
                onSelectionChange(data.map(getRowId));
            } else {
                onSelectionChange([]);
            }
        }
    };

    const handleSelectRow = (rowId: string | number) => {
        if (!onSelectionChange) return;
        const isSelected = selectedRows.includes(rowId);
        if (isSelected) {
            onSelectionChange(selectedRows.filter((id) => id !== rowId));
        } else {
            onSelectionChange([...selectedRows, rowId]);
        }
    };

    const isAllSelected = data.length > 0 && selectedRows.length === data.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;
    if (isLoading) {
        return (
            <Card>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress />
                </Box>
            </Card>
        );
    }

    if (data.length === 0 && emptyState) {
        return (
            <Card>
                <Box textAlign="center" py={8}>
                    {emptyState.icon}
                    <Typography variant="h6" gutterBottom>
                        {emptyState.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        {emptyState.description}
                    </Typography>
                    {emptyState.actionButton}
                </Box>
            </Card>
        );
    }

    return (
        <Card>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            {onSelectionChange && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={isIndeterminate}
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                            )}
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align || 'left'}
                                    sx={{ minWidth: column.minWidth }}
                                >
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        {column.label}
                                    </Typography>
                                </TableCell>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableCell align="right">
                                    <Typography variant="subtitle2" fontWeight={600}>
                                        Actions
                                    </Typography>
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => {
                            const rowId = getRowId(row);
                            const isSelected = selectedRows.includes(rowId);
                            return (
                                <TableRow key={rowId} hover selected={isSelected}>
                                    {onSelectionChange && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleSelectRow(rowId)}
                                            />
                                        </TableCell>
                                    )}
                                    {columns.map((column) => (
                                        <TableCell key={column.id} align={column.align || 'left'}>
                                            {column.render ? column.render(row) : String((row as any)[column.id] || '')}
                                        </TableCell>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <TableCell align="right">
                                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                {actions.map((action, index) => (
                                                    <Tooltip key={index} title={action.label}>
                                                        <IconButton
                                                            size="small"
                                                            color={action.color || 'primary'}
                                                            onClick={() => action.onClick(row)}
                                                        >
                                                            {action.icon}
                                                        </IconButton>
                                                    </Tooltip>
                                                ))}
                                            </Stack>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Card>
    );
}

