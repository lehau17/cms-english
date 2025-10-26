import React, { useState } from 'react';
import { CertificateLayout } from '../../types/certificate.type';

interface LayoutEditorFormProps {
    layout: CertificateLayout | undefined;
    onChange: (layout: CertificateLayout) => void;
}

type TabType = 'basic' | 'typography' | 'decorations' | 'json';

const LayoutEditorForm: React.FC<LayoutEditorFormProps> = ({ layout, onChange }) => {
    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [jsonError, setJsonError] = useState<string>('');

    // Initialize with defaults
    const currentLayout: CertificateLayout = layout || {
        template: 'classic-elegant',
        border: { width: 20, color: '#1a365d', style: 'solid' },
        background: { type: 'color', color: '#ffffff' },
        header: {
            logo: { enabled: true },
            title: { fontSize: 48, color: '#1a365d', fontFamily: 'Georgia', fontWeight: 'bold' }
        },
        body: {
            studentName: { fontSize: 36, color: '#2d3748', fontFamily: 'Georgia', fontWeight: 'bold', transform: 'uppercase' },
            courseName: { fontSize: 28, color: '#1a365d', fontFamily: 'Georgia', fontStyle: 'italic' }
        },
        footer: {
            signature: { enabled: true },
            qrCode: { enabled: true, size: 100 }
        }
    };

    const updateLayout = (updates: Partial<CertificateLayout>) => {
        onChange({ ...currentLayout, ...updates });
    };

    const updateNested = (path: string[], value: any) => {
        const newLayout = JSON.parse(JSON.stringify(currentLayout));
        let current = newLayout;
        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) current[path[i]] = {};
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        onChange(newLayout);
    };

    const handleJsonChange = (jsonString: string) => {
        try {
            const parsed = JSON.parse(jsonString);
            onChange(parsed);
            setJsonError('');
        } catch (e) {
            setJsonError('Invalid JSON: ' + (e as Error).message);
        }
    };

    const tabs: { id: TabType; label: string; icon: string }[] = [
        { id: 'basic', label: 'Basic', icon: '🎨' },
        { id: 'typography', label: 'Typography', icon: '✍️' },
        { id: 'decorations', label: 'Decorations', icon: '⭐' },
        { id: 'json', label: 'JSON', icon: '{ }' }
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                            ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[600px] overflow-y-auto">
                {/* Basic Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Styling</h3>

                        {/* Container */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Container</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                                    <input
                                        type="text"
                                        placeholder="48px"
                                        value={currentLayout.container?.padding || ''}
                                        onChange={(e) => updateNested(['container', 'padding'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                                    <input
                                        type="text"
                                        placeholder="12px"
                                        value={currentLayout.container?.borderRadius || currentLayout.border?.radius || ''}
                                        onChange={(e) => updateNested(['container', 'borderRadius'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Box Shadow</label>
                                    <input
                                        type="text"
                                        placeholder="0 20px 60px rgba(0,0,0,0.3)"
                                        value={currentLayout.container?.boxShadow || ''}
                                        onChange={(e) => updateNested(['container', 'boxShadow'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Border */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Border</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                                    <input
                                        type="number"
                                        value={currentLayout.border?.width || 20}
                                        onChange={(e) => updateNested(['border', 'width'], parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                                    <select
                                        value={currentLayout.border?.style || 'solid'}
                                        onChange={(e) => updateNested(['border', 'style'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="solid">Solid</option>
                                        <option value="dashed">Dashed</option>
                                        <option value="dotted">Dotted</option>
                                        <option value="double">Double</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={currentLayout.border?.color || '#1a365d'}
                                            onChange={(e) => updateNested(['border', 'color'], e.target.value)}
                                            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={currentLayout.border?.color || '#1a365d'}
                                            onChange={(e) => updateNested(['border', 'color'], e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Background */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Background</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={currentLayout.background?.type || 'color'}
                                        onChange={(e) => updateNested(['background', 'type'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="color">Solid Color</option>
                                        <option value="gradient">Gradient</option>
                                    </select>
                                </div>

                                {currentLayout.background?.type === 'color' ? (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={currentLayout.background?.color || '#ffffff'}
                                                onChange={(e) => updateNested(['background', 'color'], e.target.value)}
                                                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={currentLayout.background?.color || '#ffffff'}
                                                onChange={(e) => updateNested(['background', 'color'], e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gradient Start</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={currentLayout.background?.gradientStart || '#667eea'}
                                                    onChange={(e) => updateNested(['background', 'gradientStart'], e.target.value)}
                                                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentLayout.background?.gradientStart || '#667eea'}
                                                    onChange={(e) => updateNested(['background', 'gradientStart'], e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gradient End</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={currentLayout.background?.gradientEnd || '#764ba2'}
                                                    onChange={(e) => updateNested(['background', 'gradientEnd'], e.target.value)}
                                                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={currentLayout.background?.gradientEnd || '#764ba2'}
                                                    onChange={(e) => updateNested(['background', 'gradientEnd'], e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gradient Angle</label>
                                            <input
                                                type="text"
                                                placeholder="135deg"
                                                value={currentLayout.background?.gradientAngle || '135deg'}
                                                onChange={(e) => updateNested(['background', 'gradientAngle'], e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Typography Tab */}
                {activeTab === 'typography' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>

                        {/* Header Title */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Header Title</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (px)</label>
                                    <input
                                        type="number"
                                        value={currentLayout.header?.title?.fontSize || 48}
                                        onChange={(e) => updateNested(['header', 'title', 'fontSize'], parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={currentLayout.header?.title?.color || '#1a365d'}
                                            onChange={(e) => updateNested(['header', 'title', 'color'], e.target.value)}
                                            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={currentLayout.header?.title?.color || '#1a365d'}
                                            onChange={(e) => updateNested(['header', 'title', 'color'], e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Letter Spacing</label>
                                    <input
                                        type="text"
                                        placeholder="normal or 3px"
                                        value={currentLayout.header?.title?.letterSpacing || ''}
                                        onChange={(e) => updateNested(['header', 'title', 'letterSpacing'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Transform</label>
                                    <select
                                        value={currentLayout.header?.title?.textTransform || 'none'}
                                        onChange={(e) => updateNested(['header', 'title', 'textTransform'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="none">None</option>
                                        <option value="uppercase">UPPERCASE</option>
                                        <option value="lowercase">lowercase</option>
                                        <option value="capitalize">Capitalize</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Text Shadow</label>
                                    <input
                                        type="text"
                                        placeholder="2px 2px 4px rgba(0,0,0,0.1)"
                                        value={currentLayout.header?.title?.textShadow || ''}
                                        onChange={(e) => updateNested(['header', 'title', 'textShadow'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Student Name */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Student Name</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (px)</label>
                                    <input
                                        type="number"
                                        value={currentLayout.body?.studentName?.fontSize || 36}
                                        onChange={(e) => updateNested(['body', 'studentName', 'fontSize'], parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={currentLayout.body?.studentName?.color || '#2d3748'}
                                            onChange={(e) => updateNested(['body', 'studentName', 'color'], e.target.value)}
                                            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={currentLayout.body?.studentName?.color || '#2d3748'}
                                            onChange={(e) => updateNested(['body', 'studentName', 'color'], e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Letter Spacing</label>
                                    <input
                                        type="text"
                                        placeholder="4px"
                                        value={currentLayout.body?.studentName?.letterSpacing || ''}
                                        onChange={(e) => updateNested(['body', 'studentName', 'letterSpacing'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Course Name */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">Course Name</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (px)</label>
                                    <input
                                        type="number"
                                        value={currentLayout.body?.courseName?.fontSize || 28}
                                        onChange={(e) => updateNested(['body', 'courseName', 'fontSize'], parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={currentLayout.body?.courseName?.color || '#1a365d'}
                                            onChange={(e) => updateNested(['body', 'courseName', 'color'], e.target.value)}
                                            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={currentLayout.body?.courseName?.color || '#1a365d'}
                                            onChange={(e) => updateNested(['body', 'courseName', 'color'], e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decorations Tab */}
                {activeTab === 'decorations' && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Decorations & Effects</h3>

                        {/* Watermark */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-700">Watermark</h4>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentLayout.decorations?.watermark?.enabled || false}
                                        onChange={(e) => updateNested(['decorations', 'watermark', 'enabled'], e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Enable</span>
                                </label>
                            </div>

                            {currentLayout.decorations?.watermark?.enabled && (
                                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-indigo-200">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                                        <input
                                            type="text"
                                            placeholder="CERTIFIED"
                                            value={currentLayout.decorations?.watermark?.text || ''}
                                            onChange={(e) => updateNested(['decorations', 'watermark', 'text'], e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size (px)</label>
                                        <input
                                            type="number"
                                            placeholder="120"
                                            value={currentLayout.decorations?.watermark?.fontSize || 120}
                                            onChange={(e) => updateNested(['decorations', 'watermark', 'fontSize'], parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Opacity (0-1)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            placeholder="0.05"
                                            value={currentLayout.decorations?.watermark?.opacity || 0.03}
                                            onChange={(e) => updateNested(['decorations', 'watermark', 'opacity'], parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={currentLayout.decorations?.watermark?.color || '#000000'}
                                                onChange={(e) => updateNested(['decorations', 'watermark', 'color'], e.target.value)}
                                                className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={currentLayout.decorations?.watermark?.color || '#000000'}
                                                onChange={(e) => updateNested(['decorations', 'watermark', 'color'], e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rotation</label>
                                        <input
                                            type="text"
                                            placeholder="-45deg"
                                            value={currentLayout.decorations?.watermark?.rotation || '-45deg'}
                                            onChange={(e) => updateNested(['decorations', 'watermark', 'rotation'], e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* QR Code */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-700">QR Code</h4>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentLayout.footer?.qrCode?.enabled !== false}
                                        onChange={(e) => updateNested(['footer', 'qrCode', 'enabled'], e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Enable</span>
                                </label>
                            </div>

                            {currentLayout.footer?.qrCode?.enabled !== false && (
                                <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-indigo-200">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Size (px)</label>
                                        <input
                                            type="number"
                                            value={currentLayout.footer?.qrCode?.size || 100}
                                            onChange={(e) => updateNested(['footer', 'qrCode', 'size'], parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Border Width</label>
                                        <input
                                            type="text"
                                            placeholder="2px"
                                            value={currentLayout.footer?.qrCode?.borderWidth || '2px'}
                                            onChange={(e) => updateNested(['footer', 'qrCode', 'borderWidth'], e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Logo */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-700">Logo</h4>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={currentLayout.header?.logo?.enabled !== false}
                                        onChange={(e) => updateNested(['header', 'logo', 'enabled'], e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Enable</span>
                                </label>
                            </div>

                            {currentLayout.header?.logo?.enabled !== false && (
                                <div className="pl-4 border-l-2 border-indigo-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Size</label>
                                    <input
                                        type="text"
                                        placeholder="80px"
                                        value={currentLayout.header?.logo?.size || '80px'}
                                        onChange={(e) => updateNested(['header', 'logo', 'size'], e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* JSON Tab */}
                {activeTab === 'json' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">JSON Editor</h3>
                            <span className="text-xs text-gray-500">For advanced users</span>
                        </div>

                        {jsonError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {jsonError}
                            </div>
                        )}

                        <textarea
                            value={JSON.stringify(currentLayout, null, 2)}
                            onChange={(e) => handleJsonChange(e.target.value)}
                            className="w-full h-[450px] px-4 py-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            spellCheck={false}
                        />

                        <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-md">
                            <p className="text-sm text-blue-800">
                                <strong>Tip:</strong> You can paste JSON config from examples or edit directly here.
                                Changes will reflect in the preview instantly.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LayoutEditorForm;

