import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  MapPin,
  Mic,
  Monitor,
  Plus,
  Search,
  Trash2,
  Users,
  Wifi
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// Mock data interface
interface Room {
  id: string;
  name: string;
  code: string;
  location?: string;
  capacity: number;
  description?: string;
  equipment?: any;
  facilities?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
const generateMockRooms = (): Room[] => {
  const rooms: Room[] = [];
  const buildings = ['A', 'B', 'C', 'D'];
  const floors = ['1', '2', '3', '4', '5'];
  const roomTypes = ['Lecture Hall', 'Lab', 'Seminar Room', 'Conference Room', 'Study Room'];

  for (let i = 1; i <= 50; i++) {
    const building = buildings[Math.floor(Math.random() * buildings.length)];
    const floor = floors[Math.floor(Math.random() * floors.length)];
    const roomNum = String(Math.floor(Math.random() * 30) + 1).padStart(2, '0');
    const code = `${building}${floor}${roomNum}`;
    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];

    rooms.push({
      id: `room-${i}`,
      name: `${roomType} ${code}`,
      code: code,
      location: `Building ${building}, Floor ${floor}`,
      capacity: Math.floor(Math.random() * 80) + 20,
      description: `A modern ${roomType?.toLowerCase()} equipped with state-of-the-art facilities for educational purposes.`,
      equipment: {
        projector: Math.random() > 0.3,
        whiteboard: Math.random() > 0.2,
        computer: Math.random() > 0.4,
        audioSystem: Math.random() > 0.5,
        wifi: Math.random() > 0.1,
      },
      facilities: {
        airConditioner: Math.random() > 0.2,
        lighting: true,
        powerOutlets: Math.floor(Math.random() * 20) + 5,
        windows: Math.random() > 0.3,
      },
      isActive: Math.random() > 0.1,
      createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      updatedAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    });
  }

  return rooms.sort((a, b) => a.code.localeCompare(b.code));
};

// Mock hook for room management
const useRoomManagement = () => {
  const [allRooms] = useState<Room[]>(generateMockRooms());
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredRooms = useMemo(() => {
    return allRooms.filter(room =>
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.code.toLowerCase().includes(search.toLowerCase()) ||
      (room.location && room.location.toLowerCase().includes(search.toLowerCase()))
    );
  }, [allRooms, search]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredRooms.slice(startIndex, endIndex);
    const totalItems = filteredRooms.length;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data: {
        data: data,
        page,
        limit,
        totalItems,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      }
    };
  }, [filteredRooms, page, limit]);

  return {
    data: paginatedData,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    request: { page, limit, search },
  };
};

// Modal components (simplified for demo)
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

const CreateRoomModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Create New Room">
    <div className="p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter room name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., A101, B205"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Building A, Floor 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Room
        </button>
      </div>
    </div>
  </Modal>
);

const ViewRoomModal: React.FC<{ isOpen: boolean; onClose: () => void; room: Room | null }> = ({
  isOpen,
  onClose,
  room
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Room Details">
    {room && (
      <div className="p-6">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Room Name</label>
              <p className="text-lg font-semibold text-gray-900">{room.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Room Code</label>
              <p className="text-lg font-semibold text-gray-900">{room.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-gray-900">{room.location || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Capacity</label>
              <p className="text-gray-900">{room.capacity} people</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900 mt-1">{room.description}</p>
          </div>

          {room.equipment && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Equipment</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(room.equipment).map(([key, value]: [any, any]) => (
                  value && (
                    <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {key === 'wifi' && <Wifi className="w-3 h-3 mr-1" />}
                      {key === 'projector' && <Monitor className="w-3 h-3 mr-1" />}
                      {key === 'audioSystem' && <Mic className="w-3 h-3 mr-1" />}
                      {key === 'computer' && <Monitor className="w-3 h-3 mr-1" />}
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str: any) => str.toUpperCase())}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )}
  </Modal>
);

const EditRoomModal: React.FC<{ isOpen: boolean; onClose: () => void; room: Room | null }> = ({
  isOpen,
  onClose,
  room
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Edit Room">
    {room && (
      <div className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
            <input
              type="text"
              defaultValue={room.name}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
            <input
              type="text"
              defaultValue={room.code}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                defaultValue={room.location}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input
                type="number"
                defaultValue={room.capacity}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Room
          </button>
        </div>
      </div>
    )}
  </Modal>
);

const DeleteRoomModal: React.FC<{ isOpen: boolean; onClose: () => void; room: Room | null }> = ({
  isOpen,
  onClose,
  room
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Delete Room">
    {room && (
      <div className="p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Room</h3>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete "{room.name}" ({room.code})? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    )}
  </Modal>
);

// Main component
const RoomManagementPage: React.FC = () => {
  const {
    data: roomData,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    request,
  } = useRoomManagement();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const handleView = (room: Room) => {
    setSelectedRoom(room);
    setIsViewModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleDelete = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteModalOpen(true);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedRoom(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (roomData?.data.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  const handleSearch = (search: string) => {
    setSearch(search);
  };

  const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const rooms = roomData?.data.data || [];
  const pagination = roomData?.data;

  const renderEquipmentIcons = (equipment: any) => {
    if (!equipment) return null;

    const icons = [];
    if (equipment.projector) icons.push(<Monitor key="projector" className="w-4 h-4 text-blue-500" />);
    if (equipment.wifi) icons.push(<Wifi key="wifi" className="w-4 h-4 text-green-500" />);
    if (equipment.audioSystem) icons.push(<Mic key="audio" className="w-4 h-4 text-purple-500" />);
    if (equipment.computer) icons.push(<Monitor key="computer" className="w-4 h-4 text-gray-600" />);

    return (
      <div className="flex space-x-1">
        {icons.slice(0, 3)}
        {icons.length > 3 && <span className="text-xs text-gray-500">+{icons.length - 3}</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Room Management</h1>
            <p className="text-gray-600">Manage all rooms and their facilities.</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Room</span>
          </button>
        </div>

        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-72">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by room name, code, or location..."
                  value={request.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <select
                value={request.limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={isLoading}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Equipment</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{room.name}</div>
                        <div className="text-sm text-gray-500">Code: {room.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{room.location || 'Not specified'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{room.capacity} people</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderEquipmentIcons(room.equipment)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${room.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(room.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleView(room)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(room)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Room"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(room)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && rooms.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Rooms Found</h3>
              <p className="text-gray-600 mb-4">Create a new room to get started.</p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Room</span>
              </button>
            </div>
          )}
        </div>

        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
            <div className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems || 0)} of {pagination.totalItems || 0} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <div className="flex space-x-1">
                {[...Array(pagination.totalPages || 0)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handlePageChange(index + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pagination.page === index + 1
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModals}
      />

      <EditRoomModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        room={selectedRoom}
      />

      <DeleteRoomModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        room={selectedRoom}
      />

      <ViewRoomModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        room={selectedRoom}
      />
    </div>
  );
};

export default RoomManagementPage;
