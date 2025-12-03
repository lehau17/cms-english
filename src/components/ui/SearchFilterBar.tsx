import { Search as SearchIcon } from '@mui/icons-material';
import {
    Card,
    CardContent,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import React from 'react';

interface SearchFilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    limitValue: number;
    onLimitChange: (value: number) => void;
    limitOptions?: number[];
    isLoading?: boolean;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
    searchValue,
    onSearchChange,
    searchPlaceholder = 'Search...',
    limitValue,
    onLimitChange,
    limitOptions = [5, 10, 20],
    isLoading = false,
}) => {
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    <TextField
                        fullWidth
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 120 } }}>
                        <InputLabel>Show</InputLabel>
                        <Select
                            value={limitValue}
                            label="Show"
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            disabled={isLoading}
                        >
                            {limitOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            </CardContent>
        </Card>
    );
};


