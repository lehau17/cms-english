import {
    CheckCircle as CheckCircleIcon,
    Download as DownloadIcon,
    Error as ErrorIcon,
    Upload as UploadIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Typography
} from '@mui/material';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { assignmentApi } from '../../apis/assignment';

interface ImportPreviewResult {
    assignment: any;
    activities: any[];
    errors: string[];
    warnings: string[];
}

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onImportConfirm: (data: ImportPreviewResult) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
    open,
    onClose,
    onImportConfirm,
}) => {
    const [importPreview, setImportPreview] = useState<ImportPreviewResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleDownloadTemplate = async () => {
        try {
            const response = await assignmentApi.downloadImportTemplate();

            const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'assignment-import-template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Template downloaded successfully');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error('Failed to download template');
        }
    };

    const handleFileUpload = useCallback(async (file: File) => {
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            toast.error('Please upload an Excel file (.xlsx or .xls)');
            return;
        }

        setIsUploading(true);
        try {
            const result = await assignmentApi.previewImportData(file);
            // Handle the response structure - data is nested
            const previewData = result.data || result;
            setImportPreview(previewData);

            if ((previewData.errors || []).length === 0) {
                toast.success('File processed successfully');
            } else {
                toast.error('File processed with errors');
            }
        } catch (error) {
            console.error('Import preview error:', error);
            toast.error('Failed to process file');
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleConfirm = () => {
        if (importPreview) {
            onImportConfirm(importPreview);
            setImportPreview(null);
            onClose();
        }
    };

    const handleClose = () => {
        setImportPreview(null);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                Import Assignment from Excel
            </DialogTitle>
            <DialogContent>
                {/* Step 1: Download Template */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        Step 1: Download Template
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadTemplate}
                        sx={{ mb: 2 }}
                    >
                        Download Excel Template
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                        Download the template, fill in your assignment data, and upload it below.
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Step 2: Upload File */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                        Step 2: Upload Completed File
                    </Typography>
                    <Paper
                        sx={{
                            border: '2px dashed',
                            borderColor: 'grey.300',
                            p: 3,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <input
                            accept=".xlsx,.xls"
                            style={{ display: 'none' }}
                            id="file-upload"
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFileUpload(file);
                                }
                            }}
                        />
                        <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                            <Typography variant="h6" gutterBottom>
                                Upload Excel File
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Click to browse files (.xlsx, .xls)
                            </Typography>
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<UploadIcon />}
                            >
                                Choose File
                            </Button>
                        </label>
                    </Paper>
                </Box>

                {/* Upload Progress */}
                {isUploading && (
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Processing file...
                        </Typography>
                    </Box>
                )}

                {/* Import Preview */}
                {importPreview && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                            Import Preview
                        </Typography>

                        {/* Errors */}
                        {(importPreview.errors || []).length > 0 && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600}>Errors:</Typography>
                                <List dense>
                                    {(importPreview.errors || []).map((error, index) => (
                                        <ListItem key={index} sx={{ py: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <ErrorIcon color="error" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary={error} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Alert>
                        )}

                        {/* Warnings */}
                        {(importPreview.warnings || []).length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600}>Warnings:</Typography>
                                <List dense>
                                    {(importPreview.warnings || []).map((warning, index) => (
                                        <ListItem key={index} sx={{ py: 0.5 }}>
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                <WarningIcon color="warning" fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText primary={warning} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Alert>
                        )}

                        {/* Success */}
                        {importPreview.errors.length === 0 && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" fontWeight={600}>Ready to Import:</Typography>
                                <List dense>
                                    <ListItem sx={{ py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 32 }}>
                                            <CheckCircleIcon color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`Assignment: ${importPreview.assignment?.title || 'Untitled'}`}
                                            secondary={`${(importPreview.activities || []).length} activities found`}
                                        />
                                    </ListItem>
                                </List>
                            </Alert>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!importPreview || importPreview.errors.length > 0}
                >
                    Import Assignment
                </Button>
            </DialogActions>
        </Dialog>
    );
};

