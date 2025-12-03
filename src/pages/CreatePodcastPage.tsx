import { createPodcast } from "@/apis/podcast"; // Hàm gọi API tạo podcast mới
import { CreatePodcastDto, PodcastCategory, PodcastDifficulty, PodcastMediaType } from "@/interface/podcast.interface"; // Interface và enum cho podcast
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
} from "@mui/material"; // Component UI từ Material-UI
import { useMutation } from "@tanstack/react-query"; // Hook mutation để gửi request tạo podcast
import { useState } from "react"; // Hook quản lý state
import { useNavigate } from "react-router-dom"; // Hook điều hướng trang

interface TabPanelProps { // Interface cho component TabPanel
    children?: React.ReactNode; // Nội dung bên trong tab panel
    index: number; // Index của tab (0, 1, 2...)
    value: number; // Giá trị tab đang được chọn
}

function CustomTabPanel(props: TabPanelProps) { // Component hiển thị nội dung của từng tab
    const { children, value, index, ...other } = props; // Destructure props

    return (
        <div
            role="tabpanel" // ARIA role cho accessibility
            hidden={value !== index} // Ẩn panel nếu không phải tab đang chọn
            id={`simple-tabpanel-${index}`} // ID cho ARIA
            aria-labelledby={`simple-tab-${index}`} // Liên kết với tab label
            {...other} // Spread các props khác
        >
            {value === index && ( // Chỉ render nội dung khi tab này đang được chọn
                <Box sx={{ p: 3 }}>
                    {children} {/* Render nội dung bên trong */}
                </Box>
            )}
        </div>
    );
}

export default function CreatePodcastPage() { // Component trang tạo podcast mới
    const navigate = useNavigate(); // Dùng để chuyển trang sau khi tạo thành công
    const [tabValue, setTabValue] = useState(0); // State quản lý tab đang được chọn (0: Thông tin cơ bản, 1: Media, 2: Nội dung)
    const [formData, setFormData] = useState<CreatePodcastDto>({
        title: "", // Tiêu đề podcast
        description: "", // Mô tả podcast
        content: "", // Nội dung/transcript của podcast
        category: PodcastCategory.OTHER, // Danh mục mặc định: OTHER
        difficulty: PodcastDifficulty.INTERMEDIATE, // Độ khó mặc định: INTERMEDIATE
        mediaType: PodcastMediaType.AUDIO, // Loại media mặc định: AUDIO
        audioMode: "upload", // Chế độ audio: "upload" (tính năng đang phát triển)
        thumbnailUrl: "", // URL ảnh thumbnail
        audioUrl: "", // URL file audio (nếu mediaType = AUDIO)
        videoUrl: "", // URL file video (nếu mediaType = VIDEO)
    });

    const createMutation = useMutation({
        mutationFn: createPodcast, // Hàm gọi API tạo podcast
        onSuccess: () => {
            alert("Tạo podcast thành công!"); // Thông báo thành công
            navigate("/podcasts"); // Quay lại trang danh sách podcast
        },
        onError: (error) => {
            console.error(error); // Log lỗi ra console
            alert("Có lỗi xảy ra khi tạo podcast"); // Thông báo lỗi
        }
    });

    const handleChange = (field: keyof CreatePodcastDto, value: any) => { // Cập nhật giá trị field trong form
        setFormData(prev => ({ ...prev, [field]: value })); // Merge với state cũ
    };

    const handleSubmit = () => { // Xử lý khi submit form
        createMutation.mutate(formData); // Gọi mutation để tạo podcast
    };

    return (
        <Container maxWidth="lg"> {/* Container giới hạn chiều rộng lớn */}
            {/* Header */}
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Tạo Podcast Mới {/* Tiêu đề trang */}
                </Typography>
            </Box>

            {/* Form tạo podcast với tabs */}
            <Paper sx={{ width: '100%' }}>
                {/* Tabs navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}> {/* Khi click tab => đổi tabValue */}
                        <Tab label="Thông tin cơ bản" /> {/* Tab 0: Thông tin cơ bản */}
                        <Tab label="Media" /> {/* Tab 1: Media (audio/video) */}
                        <Tab label="Nội dung (Transcript)" /> {/* Tab 2: Nội dung transcript */}
                    </Tabs>
                </Box>

                {/* Tab Panel 0: Thông tin cơ bản */}
                <CustomTabPanel value={tabValue} index={0}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Input tiêu đề */}
                        <TextField
                            label="Tiêu đề"
                            fullWidth
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)} // Cập nhật tiêu đề
                        />
                        {/* Input mô tả */}
                        <TextField
                            label="Mô tả"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => handleChange("description", e.target.value)} // Cập nhật mô tả
                        />
                        {/* Dropdown danh mục và độ khó (nằm cạnh nhau) */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Danh mục"
                                    onChange={(e) => handleChange("category", e.target.value)} // Đổi danh mục
                                >
                                    {Object.values(PodcastCategory).map((cat) => ( // Lặp qua tất cả danh mục
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Độ khó</InputLabel>
                                <Select
                                    value={formData.difficulty}
                                    label="Độ khó"
                                    onChange={(e) => handleChange("difficulty", e.target.value)} // Đổi độ khó
                                >
                                    {Object.values(PodcastDifficulty).map((diff) => ( // Lặp qua tất cả độ khó
                                        <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        {/* Input thumbnail URL */}
                        <TextField
                            label="Thumbnail URL"
                            fullWidth
                            value={formData.thumbnailUrl}
                            onChange={(e) => handleChange("thumbnailUrl", e.target.value)} // Cập nhật URL thumbnail
                        />
                    </Box>
                </CustomTabPanel>

                {/* Tab Panel 1: Media */}
                <CustomTabPanel value={tabValue} index={1}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Dropdown chọn loại media */}
                        <FormControl fullWidth>
                            <InputLabel>Loại Media</InputLabel>
                            <Select
                                value={formData.mediaType}
                                label="Loại Media"
                                onChange={(e) => handleChange("mediaType", e.target.value)} // Đổi loại media (AUDIO/VIDEO)
                            >
                                <MenuItem value={PodcastMediaType.AUDIO}>Audio</MenuItem>
                                <MenuItem value={PodcastMediaType.VIDEO}>Video</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Hiển thị input Audio URL nếu chọn mediaType = AUDIO */}
                        {formData.mediaType === PodcastMediaType.AUDIO && (
                            <TextField
                                label="Audio URL"
                                fullWidth
                                value={formData.audioUrl}
                                onChange={(e) => handleChange("audioUrl", e.target.value)} // Cập nhật URL audio
                                helperText="Nhập URL file mp3 hoặc upload (tính năng upload đang phát triển)" // Gợi ý cho người dùng
                            />
                        )}

                        {/* Hiển thị input Video URL nếu chọn mediaType = VIDEO */}
                        {formData.mediaType === PodcastMediaType.VIDEO && (
                            <TextField
                                label="Video URL"
                                fullWidth
                                value={formData.videoUrl}
                                onChange={(e) => handleChange("videoUrl", e.target.value)} // Cập nhật URL video
                                helperText="Nhập YouTube URL hoặc URL file video" // Gợi ý cho người dùng
                            />
                        )}
                    </Box>
                </CustomTabPanel>

                {/* Tab Panel 2: Nội dung transcript */}
                <CustomTabPanel value={tabValue} index={2}>
                    <TextField
                        label="Nội dung / Transcript"
                        fullWidth
                        multiline
                        rows={15} // Textarea lớn (15 dòng)
                        value={formData.content}
                        onChange={(e) => handleChange("content", e.target.value)} // Cập nhật nội dung transcript
                        placeholder="Nhập nội dung bài học hoặc transcript..." // Placeholder gợi ý
                    />
                </CustomTabPanel>

                {/* Nút hành động: Hủy và Tạo Podcast */}
                <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate("/podcasts")}>
                        Hủy {/* Quay lại trang danh sách podcast */}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit} // Gửi form tạo podcast
                        disabled={createMutation.isPending} // Disable nếu đang tạo
                    >
                        {createMutation.isPending ? "Đang tạo..." : "Tạo Podcast"} {/* Đổi text theo trạng thái */}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
