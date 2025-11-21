import { broadcastNotification } from "@/apis/notification";
import { UserRole } from "@/interface/enum.interface";
import { CreateBroadcastNotificationDto, NotificationChannel, NotificationTarget } from "@/interface/notification.interface";
import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControl,
    FormControlLabel,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    TextField,
    Typography
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateNotificationPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<CreateBroadcastNotificationDto>({
        target: 'all',
        title: "",
        body: "",
        channel: NotificationChannel.in_app,
        targetRoles: [],
        targetUserIds: [],
    });

    const createMutation = useMutation({
        mutationFn: broadcastNotification,
        onSuccess: (data) => {
            alert(`Gửi thông báo thành công! Đã tạo ${data.data.count} thông báo.`);
            navigate("/notifications");
        },
        onError: (error) => {
            console.error(error);
            alert("Có lỗi xảy ra khi gửi thông báo");
        }
    });

    const handleChange = (field: keyof CreateBroadcastNotificationDto, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        createMutation.mutate(formData);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4, mt: 2 }}>
                <Typography variant="h4" fontWeight="bold">
                    Gửi Thông báo Mới
                </Typography>
            </Box>

            <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                <TextField
                    label="Tiêu đề"
                    fullWidth
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                />
                <TextField
                    label="Nội dung"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.body}
                    onChange={(e) => handleChange("body", e.target.value)}
                />

                <FormControl fullWidth>
                    <InputLabel>Đối tượng nhận</InputLabel>
                    <Select
                        value={formData.target}
                        label="Đối tượng nhận"
                        onChange={(e) => handleChange("target", e.target.value)}
                    >
                        <MenuItem value="all">Tất cả người dùng</MenuItem>
                        <MenuItem value="role">Theo vai trò (Role)</MenuItem>
                        <MenuItem value="users">Danh sách người dùng cụ thể</MenuItem>
                    </Select>
                </FormControl>

                {formData.target === 'role' && (
                    <FormControl fullWidth>
                        <InputLabel>Chọn vai trò</InputLabel>
                        <Select
                            multiple
                            value={formData.targetRoles || []}
                            onChange={(e) => handleChange("targetRoles", e.target.value)}
                            input={<OutlinedInput label="Chọn vai trò" />}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {Object.values(UserRole).map((role) => (
                                <MenuItem key={role} value={role}>
                                    <Checkbox checked={(formData.targetRoles || []).indexOf(role) > -1} />
                                    <ListItemText primary={role} />
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}

                {formData.target === 'users' && (
                    <TextField
                        label="Danh sách User IDs (phân cách bằng dấu phẩy)"
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="uuid1, uuid2, ..."
                        onChange={(e) => {
                            const ids = e.target.value.split(',').map(id => id.trim()).filter(id => id);
                            handleChange("targetUserIds", ids);
                        }}
                    />
                )}

                <FormControl fullWidth>
                    <InputLabel>Kênh gửi</InputLabel>
                    <Select
                        value={formData.channel}
                        label="Kênh gửi"
                        onChange={(e) => handleChange("channel", e.target.value)}
                    >
                        {Object.values(NotificationChannel).map((channel) => (
                            <MenuItem key={channel} value={channel}>{channel}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                    <Button variant="outlined" onClick={() => navigate("/notifications")}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={createMutation.isPending || !formData.title}
                    >
                        {createMutation.isPending ? "Đang gửi..." : "Gửi Thông báo"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
