import React from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, BookOpen, Clock, TrendingUp, UserCheck, Zap } from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from 'recharts';

// --- MOCK DATA DEFINITION ---

const mockClassroomInfo = {
  id: 'class-101',
  name: 'Lớp Super Kids 1',
  teacherName: 'Cô Nguyễn Thu Hà',
  studentCount: 20,
};

const mockKpis = {
  completionRate: 85,
  averageScore: 78,
  averageStudyTime: 120, // in minutes
  mostActiveStudent: { name: 'Trần Minh Khang', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
};

const mockStudentPerformanceData = [
  // High Achievers
  { name: 'Nguyễn Văn A', completion: 95, score: 92 },
  { name: 'Lê Thị An', completion: 98, score: 95 },
  { name: 'Vũ Minh Anh', completion: 92, score: 88 },
  { name: 'Đặng Bảo Châu', completion: 100, score: 91 },
  { name: 'Bùi Gia Hân', completion: 94, score: 96 },

  // Diligent but Struggling
  { name: 'Trần Thị B', completion: 90, score: 65 },
  { name: 'Phan Văn Bình', completion: 95, score: 70 },
  { name: 'Hoàng Minh Đức', completion: 88, score: 68 },
  { name: 'Ngô Gia Huy', completion: 92, score: 72 },
  { name: 'Lý Khánh Linh', completion: 85, score: 60 },

  // High Potential
  { name: 'Lê Văn C', completion: 50, score: 88 },
  { name: 'Mai Anh Tuấn', completion: 60, score: 90 },
  { name: 'Hà Phương Thảo', completion: 55, score: 85 },
  { name: 'Vương Gia Bảo', completion: 45, score: 82 },
  { name: 'Trịnh Ngọc Mai', completion: 65, score: 89 },

  // Needs Attention
  { name: 'Phạm Thị D', completion: 40, score: 55 },
  { name: 'Đỗ Tiến Dũng', completion: 30, score: 45 },
  { name: 'Nguyễn Thảo My', completion: 50, score: 60 },
  { name: 'Chu Diệp Anh', completion: 25, score: 50 },
  { name: 'Đinh Công Minh', completion: 45, score: 58 },
];

const mockChallengingActivities = [
  { id: 1, name: 'Luyện Viết: Miêu tả kỳ nghỉ', type: 'Writing', avgScore: 58, failureRate: 60 },
  { id: 2, name: 'Bài tập Nghe: Hội thoại sân bay', type: 'Listening', avgScore: 62, failureRate: 55 },
  { id: 3, name: 'Thuyết trình: Chủ đề Môi trường', type: 'Speaking', avgScore: 65, failureRate: 50 },
  { id: 4, name: 'Đọc hiểu: Khoa học vũ trụ', type: 'Reading', avgScore: 68, failureRate: 45 },
  { id: 5, name: 'Ngữ pháp: Câu điều kiện loại 3', type: 'Grammar', avgScore: 70, failureRate: 40 },
];

const mockCommonMistakes = [
  { category: 'Grammar', detail: "Sử dụng sai mạo từ 'a/an/the'", frequency: 45 },
  { category: 'Pronunciation', detail: "Không phát âm âm cuối /ed/", frequency: 35 },
  { category: 'Vocabulary', detail: "Nhầm lẫn giữa 'affect' và 'effect'", frequency: 30 },
  { category: 'Syntax', detail: 'Sai trật tự tính từ trong câu', frequency: 25 },
];

// --- UI COMPONENTS (Styled with Tailwind CSS, inspired by shadcn/ui) ---

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

type AvatarProps = {
  src: string;
  alt: string;
  className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ src, alt, className = '' }) => (
  <img src={src} alt={alt} className={`h-10 w-10 rounded-full ${className}`} />
);

// A simple table component structure
const Table: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className="w-full overflow-auto">
        <table className={`w-full caption-bottom text-sm ${className}`}>{children}</table>
    </div>
);
const TableHeader: React.FC<CardProps> = ({ children, className = '' }) => <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
const TableBody: React.FC<CardProps> = ({ children, className = '' }) => <tbody className={`[&_tr:last-child]:border-0 ${className}`}>{children}</tbody>;
const TableRow: React.FC<CardProps> = ({ children, className = '' }) => <tr className={`border-b transition-colors hover:bg-gray-50 ${className}`}>{children}</tr>;
const TableHead: React.FC<CardProps> = ({ children, className = '' }) => <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 ${className}`}>{children}</th>;
const TableCell: React.FC<CardProps> = ({ children, className = '' }) => <td className={`p-4 align-middle ${className}`}>{children}</td>;


// --- MAIN COMPONENT ---

const TeacherClassroomDashboardPage: React.FC = () => {
  const { classroomId } = useParams<{ classroomId: string }>();
  // In a real app, you would use classroomId to fetch data
  // For now, we use mock data.

  // In a real app, you would use classroomId to fetch data
  // For now, we use mock data.

  const avgCompletion = mockStudentPerformanceData.reduce((acc, s) => acc + s.completion, 0) / mockStudentPerformanceData.length;
  const avgScore = mockStudentPerformanceData.reduce((acc, s) => acc + s.score, 0) / mockStudentPerformanceData.length;

  return (
    <div className="space-y-8 pb-8">
      {/* 1. Header & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tổng quan Lớp học: {mockClassroomInfo.name}</h1>
          <p className="text-gray-500">
            GV: {mockClassroomInfo.teacherName} • Sĩ số: {mockClassroomInfo.studentCount} học sinh
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            defaultValue="this-week"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="this-week">Tuần này</option>
            <option value="this-month">Tháng này</option>
            <option value="this-semester">Học kỳ này</option>
          </select>
        </div>
      </div>

      {/* 2. Key Performance Indicators (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Tỷ lệ HT trung bình</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKpis.completionRate}%</div>
            <p className="text-xs text-gray-500">+5.2% so với tuần trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Điểm số trung bình</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKpis.averageScore}/100</div>
            <p className="text-xs text-gray-500">+1.5 điểm so với tuần trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Thời gian học TB</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockKpis.averageStudyTime} phút/tuần</div>
            <p className="text-xs text-gray-500">Mục tiêu: 150 phút</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Học sinh tích cực</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Avatar src={mockKpis.mostActiveStudent.avatarUrl} alt={mockKpis.mostActiveStudent.name} />
            <p className="font-semibold">{mockKpis.mostActiveStudent.name}</p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Student Performance Quadrant */}
      <Card>
        <CardHeader>
          <CardTitle>Sơ đồ Hiệu suất Học sinh</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="completion"
                type="number"
                name="Tỷ lệ hoàn thành"
                unit="%"
                domain={[0, 100]}
              >
                <Label value="Tỷ lệ hoàn thành bài tập (%)" offset={-15} position="insideBottom" />
              </XAxis>
              <YAxis
                dataKey="score"
                type="number"
                name="Điểm số trung bình"
                unit="%"
                domain={[0, 100]}
              >
                 <Label value="Điểm số trung bình (%)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
              </YAxis>
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-white p-2 shadow-sm">
                      <p className="font-bold">{data.name}</p>
                      <p>Điểm TB: {data.score}%</p>
                      <p>Tỷ lệ HT: {data.completion}%</p>
                    </div>
                  );
                }
                return null;
              }} />
              <ReferenceLine y={avgScore} stroke="#eab308" strokeDasharray="3 3">
                <Label value="Điểm TB" position="right" fill="#eab308" fontSize={12} />
              </ReferenceLine>
              <ReferenceLine x={avgCompletion} stroke="#22c55e" strokeDasharray="3 3">
                <Label value="Tỷ lệ HT TB" position="top" fill="#22c55e" fontSize={12} />
              </ReferenceLine>
              <Scatter name="Học sinh" data={mockStudentPerformanceData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 4 & 5. Challenging Activities and Common Mistakes */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Các hoạt động thử thách nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Điểm TB</TableHead>
                  <TableHead>Tỷ lệ &lt; TB</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockChallengingActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                        <p className="font-medium">{activity.name}</p>
                        <p className="text-xs text-gray-500">{activity.type}</p>
                    </TableCell>
                    <TableCell>{activity.avgScore}</TableCell>
                    <TableCell>{activity.failureRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Các lỗi sai phổ biến của cả lớp</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {mockCommonMistakes.map((mistake, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Zap className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                  <div>
                    <p className="font-semibold">{mistake.category}: <span className="font-normal">{mistake.detail}</span></p>
                    <p className="text-sm text-gray-500">{mistake.frequency}% số bài nộp gặp lỗi này</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherClassroomDashboardPage;