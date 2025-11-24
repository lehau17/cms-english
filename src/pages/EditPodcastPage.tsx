import { getPodcastById, updatePodcast } from "@/apis/podcast";
import { uploadFile } from "@/apis/upload";
import { PodcastCategory, PodcastDifficulty, PodcastMediaType, UpdatePodcastDto } from "@/interface/podcast.interface";
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
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

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

export default function EditPodcastPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<UpdatePodcastDto>({});
  const [isDragOverThumbnail, setIsDragOverThumbnail] = useState(false);
  const [isDragOverMedia, setIsDragOverMedia] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const { data: podcastData, isLoading } = useQuery({
    queryKey: ["podcast", id],
    queryFn: () => getPodcastById(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (podcastData?.data) {
      const podcast = podcastData.data;
      setFormData({
        title: podcast.title,
        description: podcast.description,
        content: podcast.transcript,
        category: podcast.category,
        difficulty: podcast.difficulty,
        mediaType: podcast.mediaType,
        thumbnailUrl: podcast.thumbnailUrl,
        audioUrl: podcast.audioUrl,
        videoUrl: podcast.videoUrl,
      });
    }
  }, [podcastData]);

  const uploadThumbnailMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      const url = `${data.data.url}?t=${Date.now()}`;
      handleChange("thumbnailUrl", url);
      toast.success("Upload thumbnail thành công!");
    },
    onError: () => toast.error("Upload thumbnail thất bại!"),
  });

  const uploadMediaMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      const url = `${data.data.url}?t=${Date.now()}`;
      if (formData.mediaType === PodcastMediaType.AUDIO) {
        handleChange("audioUrl", url);
      } else {
        handleChange("videoUrl", url);
      }
      toast.success("Upload media thành công!");
    },
    onError: () => toast.error("Upload media thất bại!"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePodcastDto) => updatePodcast(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      queryClient.invalidateQueries({ queryKey: ["podcast", id] });
      toast.success("Cập nhật podcast thành công!");
      navigate("/podcasts");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Có lỗi xảy ra khi cập nhật podcast");
    }
  });

  const handleChange = (field: keyof UpdatePodcastDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  const handleThumbnailUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file hình ảnh!");
      return;
    }
    uploadThumbnailMutation.mutate(file);
  };

  const handleMediaUpload = (file: File) => {
    const isAudio = formData.mediaType === PodcastMediaType.AUDIO;
    if (isAudio && !file.type.startsWith("audio/")) {
      toast.error("Chỉ chấp nhận file audio!");
      return;
    }
    if (!isAudio && !file.type.startsWith("video/")) {
      toast.error("Chỉ chấp nhận file video!");
      return;
    }
    uploadMediaMutation.mutate(file);
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Chỉnh sửa Podcast
        </Typography>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab label="Thông tin cơ bản" />
            <Tab label="Media" />
            <Tab label="Nội dung (Transcript)" />
            <Tab label="Gaps (Điền từ)" />
          </Tabs>
        </Box>

        <CustomTabPanel value={tabValue} index={0}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              value={formData.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              rows={3}
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category || ""}
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
                  value={formData.difficulty || ""}
                  label="Độ khó"
                  onChange={(e) => handleChange("difficulty", e.target.value)}
                >
                  {Object.values(PodcastDifficulty).map((diff) => (
                    <MenuItem key={diff} value={diff}>{diff}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Thumbnail</Typography>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleThumbnailUpload(file);
                }}
              />
              <Box
                onClick={() => !uploadThumbnailMutation.isPending && thumbnailInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOverThumbnail(true); }}
                onDragLeave={() => setIsDragOverThumbnail(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverThumbnail(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleThumbnailUpload(file);
                }}
                sx={{
                  border: "2px dashed",
                  borderColor: isDragOverThumbnail ? "primary.main" : "grey.300",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: uploadThumbnailMutation.isPending ? "wait" : "pointer",
                  bgcolor: isDragOverThumbnail ? "action.hover" : "transparent",
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                }}
              >
                {uploadThumbnailMutation.isPending && (
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.8)", borderRadius: 2, zIndex: 1 }}>
                    <CircularProgress size={40} />
                  </Box>
                )}
                {formData.thumbnailUrl ? (
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <img src={formData.thumbnailUrl} alt="Thumbnail" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={(e) => { e.stopPropagation(); handleChange("thumbnailUrl", ""); }}
                      sx={{ position: "absolute", top: 8, right: 8, minWidth: "auto", p: 0.5 }}
                    >
                      <X size={16} />
                    </Button>
                  </Box>
                ) : (
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

        <CustomTabPanel value={tabValue} index={1}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Loại Media</InputLabel>
              <Select
                value={formData.mediaType || ""}
                label="Loại Media"
                onChange={(e) => handleChange("mediaType", e.target.value)}
              >
                <MenuItem value={PodcastMediaType.AUDIO}>Audio</MenuItem>
                <MenuItem value={PodcastMediaType.VIDEO}>Video</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {formData.mediaType === PodcastMediaType.AUDIO ? "Audio File" : "Video File"}
              </Typography>
              <input
                ref={mediaInputRef}
                type="file"
                accept={formData.mediaType === PodcastMediaType.AUDIO ? "audio/*" : "video/*"}
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMediaUpload(file);
                }}
              />
              <Box
                onClick={() => !uploadMediaMutation.isPending && mediaInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragOverMedia(true); }}
                onDragLeave={() => setIsDragOverMedia(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverMedia(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleMediaUpload(file);
                }}
                sx={{
                  border: "2px dashed",
                  borderColor: isDragOverMedia ? "primary.main" : "grey.300",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  cursor: uploadMediaMutation.isPending ? "wait" : "pointer",
                  bgcolor: isDragOverMedia ? "action.hover" : "transparent",
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                }}
              >
                {uploadMediaMutation.isPending && (
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.8)", borderRadius: 2, zIndex: 1 }}>
                    <CircularProgress size={40} />
                  </Box>
                )}
                {(formData.audioUrl || formData.videoUrl) ? (
                  <Box>
                    {formData.mediaType === PodcastMediaType.VIDEO && formData.videoUrl && (
                      <video src={formData.videoUrl} controls style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8 }} />
                    )}
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
                          handleChange("audioUrl", "");
                        } else {
                          handleChange("videoUrl", "");
                        }
                      }}
                      sx={{ mt: 2 }}
                    >
                      <X size={16} style={{ marginRight: 4 }} />
                      Xóa
                    </Button>
                  </Box>
                ) : (
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

        <CustomTabPanel value={tabValue} index={2}>
          <TextField
            label="Nội dung / Transcript"
            fullWidth
            multiline
            rows={15}
            value={formData.content || ""}
            onChange={(e) => handleChange("content", e.target.value)}
          />
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={3}>
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gaps - Điền từ ({podcastData?.data?.gaps?.length || 0})
            </Typography>
            {podcastData?.data?.gaps && podcastData.data.gaps.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {podcastData.data.gaps.map((gap, index) => (
                  <Paper key={gap.id} sx={{ p: 2, bgcolor: "grey.50" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
                          Gap #{gap.orderNo}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Vị trí: {gap.startIndex} - {gap.endIndex}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Độ dài: {gap.endIndex - gap.startIndex} ký tự
                          </Typography>
                        </Box>
                        <Box sx={{ bgcolor: "white", p: 1.5, borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Đáp án:
                          </Typography>
                          <Typography variant="body1" fontWeight="bold">
                            "{gap.answer}"
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "info.lighter", borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Đoạn text:
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {podcastData.data.transcript.substring(
                              Math.max(0, gap.startIndex - 20),
                              gap.startIndex
                            )}
                            <Typography component="span" sx={{ bgcolor: "warning.light", px: 0.5, fontWeight: "bold" }}>
                              {gap.answer}
                            </Typography>
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
            ) : (
              <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
                <Typography color="text.secondary">
                  Chưa có gaps nào được tạo cho podcast này
                </Typography>
              </Paper>
            )}
          </Box>
        </CustomTabPanel>

        <Box sx={{ p: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/podcasts")}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
