import { createPodcast } from "@/apis/podcast";
import { CreatePodcastDto, PodcastCategory, PodcastDifficulty, PodcastMediaType } from "@/interface/podcast.interface";
import {
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default function CreatePodcastPage() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState<CreatePodcastDto>({
        title: "",
        description: "",
        content: "",
        category: PodcastCategory.OTHER,
        difficulty: PodcastDifficulty.INTERMEDIATE,
        mediaType: PodcastMediaType.AUDIO,
        audioMode: "upload",
        thumbnailUrl: "",
        audioUrl: "",
        videoUrl: "",
    });

    const createMutation = useMutation({
        mutationFn: createPodcast,
        onSuccess: () => {
            alert("Tạo podcast thành công!");
            navigate("/podcasts");
        },
        onError: (error) => {
            console.error(error);
            alert("Có lỗi xảy ra khi tạo podcast");
        }
    });

    const handleChange = (field: keyof CreatePodcastDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        createMutation.mutate(formData);
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Tạo Podcast Mới
                </Typography>
            </Box>

            <Paper sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                        <Tab label="Thông tin cơ bản" />
                        <Tab label="Media" />
                        <Tab label="Nội dung (Transcript)" />
                    </Tabs>
                </Box>

                <CustomTabPanel value={tabValue} index={0}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <TextField
                            label="Tiêu đề"
                            fullWidth
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                        />
                        <TextField
                            label="Mô tả"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Danh mục"
                                    onChange={(e) => handleChange("category", e.target.value)}
                                >
                                    {Object.values(PodcastCategory).map((cat) => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Độ khó</InputLabel>
                                <Select
                                    value={formData.difficulty}
                                    label="Độ khó"
                                    onChange={(e) => handleChange("difficulty", e.target.value)}
                                >
                                    {Object.values(PodcastDifficulty).map((diff) => (
                                        <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        <TextField
                            label="Thumbnail URL"
                            fullWidth
                            value={formData.thumbnailUrl}
                            onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
                        />
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={tabValue} index={1}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel>Loại Media</InputLabel>
                            <Select
                                value={formData.mediaType}
                                label="Loại Media"
                                onChange={(e) => handleChange("mediaType", e.target.value)}
                            >
                                <MenuItem value={PodcastMediaType.AUDIO}>Audio</MenuItem>
                                <MenuItem value={PodcastMediaType.VIDEO}>Video</MenuItem>
                            </Select>
                        </FormControl>

                        {formData.mediaType === PodcastMediaType.AUDIO && (
                            <TextField
                                label="Audio URL"
                                fullWidth
                                value={formData.audioUrl}
                                onChange={(e) => handleChange("audioUrl", e.target.value)}
                                helperText="Nhập URL file mp3 hoặc upload (tính năng upload đang phát triển)"
                            />
                        )}

                        {formData.mediaType === PodcastMediaType.VIDEO && (
                            <TextField
                                label="Video URL"
                                fullWidth
                                value={formData.videoUrl}
                                onChange={(e) => handleChange("videoUrl", e.target.value)}
                                helperText="Nhập YouTube URL hoặc URL file video"
                            />
                        )}
                    </Box>
                </CustomTabPanel>

                <CustomTabPanel value={tabValue} index={2}>
                    <TextField
                        label="Nội dung / Transcript"
                        fullWidth
                        multiline
                        rows={15}
                        value={formData.content}
                        onChange={(e) => handleChange("content", e.target.value)}
                        placeholder="Nhập nội dung bài học hoặc transcript..."
                    />
                </CustomTabPanel>

                <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate("/podcasts")}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? "Đang tạo..." : "Tạo Podcast"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
