import { getPodcastById, updatePodcast } from "@/apis/podcast"; // Hàm gọi API lấy chi tiết và cập nhật podcast
import { uploadFile } from "@/apis/upload"; // Hàm upload file lên server
import { PodcastCategory, PodcastDifficulty, PodcastMediaType, UpdatePodcastDto } from "@/interface/podcast.interface"; // Interface và enum cho podcast
import {
    Box,
    Button,
    CircularProgress,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Hook quản lý state và cache
import { Upload, X } from "lucide-react"; // Icon upload và xóa
import { useEffect, useRef, useState } from "react"; // Hook quản lý state và side effects
import toast from "react-hot-toast"; // Thông báo toast
import { useNavigate, useParams } from "react-router-dom"; // Hook lấy params URL và điều hướng

interface TabPanelProps { // Interface cho component TabPanel
    children?: React.ReactNode; // Nội dung bên trong tab panel
    index: number; // Index của tab (0, 1, 2, 3...)
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

export default function EditPodcastPage() { // Component trang chỉnh sửa podcast
    const { id } = useParams<{ id: string }>(); // Lấy podcast id từ URL
    const navigate = useNavigate(); // Dùng để chuyển trang sau khi cập nhật thành công
    const queryClient = useQueryClient(); // Dùng để invalidate cache sau khi cập nhật
    const [tabValue, setTabValue] = useState(0); // State quản lý tab đang được chọn (0: Thông tin cơ bản, 1: Media, 2: Nội dung, 3: Gaps)
    const [formData, setFormData] = useState<UpdatePodcastDto>({}); // State chứa dữ liệu form (chỉ chứa các field được cập nhật)
    const [isDragOverThumbnail, setIsDragOverThumbnail] = useState(false); // State để highlight khi drag file vào vùng thumbnail
    const [isDragOverMedia, setIsDragOverMedia] = useState(false); // State để highlight khi drag file vào vùng media
    const thumbnailInputRef = useRef<HTMLInputElement>(null); // Ref để trigger click input file thumbnail
    const mediaInputRef = useRef<HTMLInputElement>(null); // Ref để trigger click input file media

    const { data: podcastData, isLoading } = useQuery({
        queryKey: ["podcast", id], // Key cache phụ thuộc vào id
        queryFn: () => getPodcastById(id as string), // Hàm gọi API lấy chi tiết podcast
        enabled: !!id, // Chỉ gọi nếu có id
    });

    useEffect(() => {
        if (podcastData?.data) { // Khi có dữ liệu podcast từ API
            const podcast = podcastData.data;
            setFormData({
                title: podcast.title, // Điền tiêu đề
                description: podcast.description, // Điền mô tả
                content: podcast.transcript, // Điền transcript vào field content
                category: podcast.category, // Điền danh mục
                difficulty: podcast.difficulty, // Điền độ khó
                mediaType: podcast.mediaType, // Điền loại media
                thumbnailUrl: podcast.thumbnailUrl, // Điền URL thumbnail
                audioUrl: podcast.audioUrl, // Điền URL audio
                videoUrl: podcast.videoUrl, // Điền URL video
            }); // Populate form với dữ liệu hiện có của podcast
        }
    }, [podcastData]); // Chạy lại khi podcastData thay đổi

    const uploadThumbnailMutation = useMutation({
        mutationFn: uploadFile, // Hàm upload file lên server
        onSuccess: (data) => {
            const url = `${data.data.url}?t=${Date.now()}`; // Thêm timestamp để tránh cache
            handleChange("thumbnailUrl", url); // Cập nhật URL thumbnail vào form
            toast.success("Upload thumbnail thành công!"); // Thông báo thành công
        },
        onError: () => toast.error("Upload thumbnail thất bại!"), // Thông báo lỗi
    });

    const uploadMediaMutation = useMutation({
        mutationFn: uploadFile, // Hàm upload file lên server
        onSuccess: (data) => {
            const url = `${data.data.url}?t=${Date.now()}`; // Thêm timestamp để tránh cache
            if (formData.mediaType === PodcastMediaType.AUDIO) {
                handleChange("audioUrl", url); // Nếu là audio thì cập nhật audioUrl
            } else {
                handleChange("videoUrl", url); // Nếu là video thì cập nhật videoUrl
            }
            toast.success("Upload media thành công!"); // Thông báo thành công
        },
        onError: () => toast.error("Upload media thất bại!"), // Thông báo lỗi
    });

    const updateMutation = useMutation({
        mutationFn: (data: UpdatePodcastDto) => updatePodcast(id as string, data), // Hàm gọi API cập nhật podcast
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["podcasts"] }); // Làm mới cache danh sách podcast
            queryClient.invalidateQueries({ queryKey: ["podcast", id] }); // Làm mới cache chi tiết podcast
            toast.success("Cập nhật podcast thành công!"); // Thông báo thành công
            navigate("/podcasts"); // Quay lại trang danh sách podcast
        },
        onError: (error) => {
            console.error(error); // Log lỗi ra console
            toast.error("Có lỗi xảy ra khi cập nhật podcast"); // Thông báo lỗi
        }
    });

    const handleChange = (field: keyof UpdatePodcastDto, value: any) => { // Cập nhật giá trị field trong form
        setFormData(prev => ({ ...prev, [field]: value })); // Merge với state cũ
    };

    const handleSubmit = () => { // Xử lý khi submit form
        updateMutation.mutate(formData); // Gọi mutation để cập nhật podcast
    };

    const handleThumbnailUpload = (file: File) => { // Xử lý upload thumbnail
        if (!file.type.startsWith("image/")) { // Validate: chỉ chấp nhận file ảnh
            toast.error("Chỉ chấp nhận file hình ảnh!");
            return;
        }
        uploadThumbnailMutation.mutate(file); // Gọi mutation upload
    };

    const handleMediaUpload = (file: File) => { // Xử lý upload media (audio/video)
        const isAudio = formData.mediaType === PodcastMediaType.AUDIO; // Kiểm tra loại media
        if (isAudio && !file.type.startsWith("audio/")) { // Validate: nếu chọn audio thì file phải là audio
            toast.error("Chỉ chấp nhận file audio!");
            return;
        }
        if (!isAudio && !file.type.startsWith("video/")) { // Validate: nếu chọn video thì file phải là video
            toast.error("Chỉ chấp nhận file video!");
            return;
        }
        uploadMediaMutation.mutate(file); // Gọi mutation upload
    };

    if (isLoading) return <Typography>Loading...</Typography>; // Hiển thị loading khi đang fetch dữ liệu

    return (
        <Container maxWidth="lg"> {/* Container giới hạn chiều rộng lớn */}
            {/* Header */}
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Chỉnh sửa Podcast {/* Tiêu đề trang */}
                </Typography>
            </Box>

            {/* Form chỉnh sửa podcast với tabs */}
            <Paper sx={{ width: '100%' }}>
                {/* Tabs navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}> {/* Khi click tab => đổi tabValue */}
                        <Tab label="Thông tin cơ bản" /> {/* Tab 0: Thông tin cơ bản */}
                        <Tab label="Media" /> {/* Tab 1: Media (audio/video) */}
                        <Tab label="Nội dung (Transcript)" /> {/* Tab 2: Nội dung transcript */}
                        <Tab label="Gaps (Điền từ)" /> {/* Tab 3: Xem gaps đã tạo */}
                    </Tabs>
                </Box>

                {/* Tab Panel 0: Thông tin cơ bản */}
                <CustomTabPanel value={tabValue} index={0}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Input tiêu đề */}
                        <TextField
                            label="Tiêu đề"
                            fullWidth
                            value={formData.title || ""}
                            onChange={(e) => handleChange("title", e.target.value)} // Cập nhật tiêu đề
                        />
                        {/* Input mô tả */}
                        <TextField
                            label="Mô tả"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)} // Cập nhật mô tả
                        />
                        {/* Dropdown danh mục và độ khó (nằm cạnh nhau) */}
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Danh mục</InputLabel>
                                <Select
                                    value={formData.category || ""}
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
                                    value={formData.difficulty || ""}
                                    label="Độ khó"
                                    onChange={(e) => handleChange("difficulty", e.target.value)} // Đổi độ khó
                                >
                                    {Object.values(PodcastDifficulty).map((diff) => ( // Lặp qua tất cả độ khó
                                        <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                        {/* Upload thumbnail với drag & drop */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Thumbnail</Typography>
                            <input
                                ref={thumbnailInputRef}
                                type="file"
                                accept="image/*" // Chỉ chấp nhận file ảnh
                                style={{ display: "none" }} // Ẩn input file, dùng ref để trigger
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleThumbnailUpload(file); // Xử lý khi chọn file
                                }}
                            />
                            {/* Vùng drag & drop thumbnail */}
                            <Box
                                onClick={() => !uploadThumbnailMutation.isPending && thumbnailInputRef.current?.click()} // Click để mở file picker
                                onDragOver={(e) => { e.preventDefault(); setIsDragOverThumbnail(true); }} // Khi drag file vào vùng
                                onDragLeave={() => setIsDragOverThumbnail(false)} // Khi drag file ra khỏi vùng
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragOverThumbnail(false);
                                    const file = e.dataTransfer.files[0]; // Lấy file từ drag & drop
                                    if (file) handleThumbnailUpload(file); // Xử lý upload
                                }}
                                sx={{
                                    border: "2px dashed",
                                    borderColor: isDragOverThumbnail ? "primary.main" : "grey.300", // Đổi màu khi drag over
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: "center",
                                    cursor: uploadThumbnailMutation.isPending ? "wait" : "pointer", // Đổi cursor khi đang upload
                                    bgcolor: isDragOverThumbnail ? "action.hover" : "transparent", // Đổi nền khi drag over
                                    transition: "all 0.2s",
                                    position: "relative",
                                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" }, // Hover effect
                                }}
                            >
                                {uploadThumbnailMutation.isPending && ( // Hiển thị loading khi đang upload
                                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.8)", borderRadius: 2, zIndex: 1 }}>
                                        <CircularProgress size={40} />
                                    </Box>
                                )}
                                {formData.thumbnailUrl ? ( // Nếu đã có thumbnail
                                    <Box sx={{ position: "relative", display: "inline-block" }}>
                                        <img src={formData.thumbnailUrl} alt="Thumbnail" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} /> {/* Hiển thị ảnh */}
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="error"
                                            onClick={(e) => { e.stopPropagation(); handleChange("thumbnailUrl", ""); }} // Xóa thumbnail
                                            sx={{ position: "absolute", top: 8, right: 8, minWidth: "auto", p: 0.5 }}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </Box>
                                ) : ( // Nếu chưa có thumbnail
                                    <Box sx={{ color: "text.secondary" }}>
                                        <Upload size={40} style={{ marginBottom: 8 }} />
                                        <Typography>Kéo thả hoặc click để upload thumbnail</Typography>
                                        <Typography variant="caption">Hỗ trợ: JPG, PNG, GIF</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CustomTabPanel>

                {/* Tab Panel 1: Media */}
                <CustomTabPanel value={tabValue} index={1}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Dropdown chọn loại media */}
                        <FormControl fullWidth>
                            <InputLabel>Loại Media</InputLabel>
                            <Select
                                value={formData.mediaType || ""}
                                label="Loại Media"
                                onChange={(e) => handleChange("mediaType", e.target.value)} // Đổi loại media (AUDIO/VIDEO)
                            >
                                <MenuItem value={PodcastMediaType.AUDIO}>Audio</MenuItem>
                                <MenuItem value={PodcastMediaType.VIDEO}>Video</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Upload media với drag & drop */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {formData.mediaType === PodcastMediaType.AUDIO ? "Audio File" : "Video File"} {/* Đổi label theo loại media */}
                            </Typography>
                            <input
                                ref={mediaInputRef}
                                type="file"
                                accept={formData.mediaType === PodcastMediaType.AUDIO ? "audio/*" : "video/*"} // Chỉ chấp nhận audio hoặc video
                                style={{ display: "none" }} // Ẩn input file, dùng ref để trigger
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleMediaUpload(file); // Xử lý khi chọn file
                                }}
                            />
                            {/* Vùng drag & drop media */}
                            <Box
                                onClick={() => !uploadMediaMutation.isPending && mediaInputRef.current?.click()} // Click để mở file picker
                                onDragOver={(e) => { e.preventDefault(); setIsDragOverMedia(true); }} // Khi drag file vào vùng
                                onDragLeave={() => setIsDragOverMedia(false)} // Khi drag file ra khỏi vùng
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragOverMedia(false);
                                    const file = e.dataTransfer.files[0]; // Lấy file từ drag & drop
                                    if (file) handleMediaUpload(file); // Xử lý upload
                                }}
                                sx={{
                                    border: "2px dashed",
                                    borderColor: isDragOverMedia ? "primary.main" : "grey.300", // Đổi màu khi drag over
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: "center",
                                    cursor: uploadMediaMutation.isPending ? "wait" : "pointer", // Đổi cursor khi đang upload
                                    bgcolor: isDragOverMedia ? "action.hover" : "transparent", // Đổi nền khi drag over
                                    transition: "all 0.2s",
                                    position: "relative",
                                    "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" }, // Hover effect
                                }}
                            >
                                {uploadMediaMutation.isPending && ( // Hiển thị loading khi đang upload
                                    <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.8)", borderRadius: 2, zIndex: 1 }}>
                                        <CircularProgress size={40} />
                                    </Box>
                                )}
                                {(formData.audioUrl || formData.videoUrl) ? ( // Nếu đã có media
                                    <Box>
                                        {/* Player video */}
                                        {formData.mediaType === PodcastMediaType.VIDEO && formData.videoUrl && (
                                            <video src={formData.videoUrl} controls style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8 }} />
                                        )}
                                        {/* Player audio */}
                                        {formData.mediaType === PodcastMediaType.AUDIO && formData.audioUrl && (
                                            <audio src={formData.audioUrl} controls style={{ width: "100%" }} />
                                        )}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (formData.mediaType === PodcastMediaType.AUDIO) {
                                                    handleChange("audioUrl", ""); // Xóa audio URL
                                                } else {
                                                    handleChange("videoUrl", ""); // Xóa video URL
                                                }
                                            }}
                                            sx={{ mt: 2 }}
                                        >
                                            <X size={16} style={{ marginRight: 4 }} />
                                            Xóa
                                        </Button>
                                    </Box>
                                ) : ( // Nếu chưa có media
                                    <Box sx={{ color: "text.secondary" }}>
                                        <Upload size={40} style={{ marginBottom: 8 }} />
                                        <Typography>
                                            Kéo thả hoặc click để upload {formData.mediaType === PodcastMediaType.AUDIO ? "audio" : "video"}
                                        </Typography>
                                        <Typography variant="caption">
                                            Hỗ trợ: {formData.mediaType === PodcastMediaType.AUDIO ? "MP3, WAV, OGG" : "MP4, WEBM, OGV"}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CustomTabPanel>

                {/* Tab Panel 2: Nội dung transcript */}
                <CustomTabPanel value={tabValue} index={2}>
                    <TextField
                        label="Nội dung / Transcript"
                        fullWidth
                        multiline
                        rows={15} // Textarea lớn (15 dòng)
                        value={formData.content || ""}
                        onChange={(e) => handleChange("content", e.target.value)} // Cập nhật nội dung transcript
                    />
                </CustomTabPanel>

                {/* Tab Panel 3: Gaps (Điền từ) - Chỉ xem, không chỉnh sửa */}
                <CustomTabPanel value={tabValue} index={3}>
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Gaps - Điền từ ({podcastData?.data?.gaps?.length || 0}) {/* Hiển thị số lượng gaps */}
                        </Typography>
                        {podcastData?.data?.gaps && podcastData.data.gaps.length > 0 ? ( // Nếu có gaps
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {podcastData.data.gaps.map((gap, index) => ( // Lặp qua từng gap
                                    <Paper key={gap.id} sx={{ p: 2, bgcolor: "grey.50" }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
                                                    Gap #{gap.orderNo} {/* Số thứ tự gap */}
                                                </Typography>
                                                {/* Thông tin vị trí và độ dài */}
                                                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Vị trí: {gap.startIndex} - {gap.endIndex} {/* Vị trí trong transcript */}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Độ dài: {gap.endIndex - gap.startIndex} ký tự {/* Số ký tự của gap */}
                                                    </Typography>
                                                </Box>
                                                {/* Hiển thị đáp án */}
                                                <Box sx={{ bgcolor: "white", p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                        Đáp án:
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="bold">
                                                        "{gap.answer}" {/* Đáp án đúng */}
                                                    </Typography>
                                                </Box>
                                                {/* Hiển thị đoạn text xung quanh gap */}
                                                <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "info.lighter", borderRadius: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Đoạn text:
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                        {/* Text trước gap (20 ký tự) */}
                                                        {podcastData.data.transcript.substring(
                                                            Math.max(0, gap.startIndex - 20),
                                                            gap.startIndex
                                                        )}
                                                        {/* Highlight đáp án */}
                                                        <Typography component="span" sx={{ bgcolor: "warning.light", px: 0.5, fontWeight: "bold" }}>
                                                            {gap.answer}
                                                        </Typography>
                                                        {/* Text sau gap (20 ký tự) */}
                                                        {podcastData.data.transcript.substring(
                                                            gap.endIndex,
                                                            Math.min(podcastData.data.transcript.length, gap.endIndex + 20)
                                                        )}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Paper>
                                ))}
                            </Box>
                        ) : ( // Nếu chưa có gaps
                            <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
                                <Typography color="text.secondary">
                                    Chưa có gaps nào được tạo cho podcast này
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                </CustomTabPanel>

                {/* Nút hành động: Hủy và Lưu thay đổi */}
                <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button variant="outlined" onClick={() => navigate("/podcasts")}>
                        Hủy {/* Quay lại trang danh sách podcast */}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit} // Gửi form cập nhật podcast
                        disabled={updateMutation.isPending} // Disable nếu đang cập nhật
                    >
                        {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"} {/* Đổi text theo trạng thái */}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
