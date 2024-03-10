import { useState } from 'react';

import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { useEditor, EditorContent } from '@tiptap/react';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import Paragraph from '@tiptap/extension-paragraph';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Text from '@tiptap/extension-text';
import Document from '@tiptap/extension-document';


import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';


/**
 * Moves an element within an array from one position to another.
 * 
 * @param arr - The array from which the element is to be moved.
 * @param from - The index of the element to move.
 * @param to - The index where the element should be moved to.
 * @returns A new array with the element moved to the new position.
 * 
 * Note: This function does not mutate the original array; instead, it returns a new array.
 */
const arrayMove = (arr: unknown[], from: number, to: number) => {
    const clone = [...arr];
    const [removed] = clone.splice(from, 1);
    clone.splice(to, 0, removed);
    return clone;
};


const initialBlocks = [
    {
        id: 'block-1',
        orderNumber: 1,
        type: 'Purpose',
        content: {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'The purpose of this section is to provide a clear and concise description of the project objectives.' }
                    ]
                },
                // More paragraphs or other content as needed
            ]
        }
    },
    {
        id: 'block-2',
        orderNumber: 2,
        type: 'Scope',
        content: {
            type: 'doc',
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: "The project's primary objective is to develop a new medicine intended to treat [specific condition]. This involves the discovery and formulation of a drug that is both safe and effective, adhering to the highest scientific and regulatory standards." }
                    ]
                },
            ]
        }
    },

    {
        id: 'block-3',
        orderNumber: 3,
        type: 'Material',
        content: {
            type: 'doc',
            content: [
                {
                    type: 'table',
                    content: [
                        {
                            type: 'tableRow',
                            content: [
                                { type: 'tableHeader', content: [{ type: 'text', text: 'Material' }] },
                                { type: 'tableHeader', content: [{ type: 'text', text: 'Quantity' }] },
                                { type: 'tableHeader', content: [{ type: 'text', text: 'Provider' }] },
                            ]
                        },
                        {
                            type: 'tableRow',
                            content: [
                                { type: 'tableCell', content: [{ type: 'text', text: 'Material A' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: '100 units' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: 'Supplier X' }] },
                            ]
                        },
                        // Additional rows as needed
                    ]
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: "...." }
                    ]
                },
            ]
        }
    },
    {
        id: 'block-4',
        orderNumber: 4,
        type: 'Responsibilities',
        content: {
            type: 'doc',
            content: [
                {
                    type: 'table',
                    content: [
                        {
                            type: 'tableRow',
                            content: [
                                { type: 'tableHeader', content: [{ type: 'text', text: 'Role' }] },
                                { type: 'tableHeader', content: [{ type: 'text', text: 'Responsibility' }] },
                                { type: 'tableHeader', content: [{ type: 'text', text: 'Assignee' }] },
                            ]
                        },
                        {
                            type: 'tableRow',
                            content: [
                                { type: 'tableCell', content: [{ type: 'text', text: 'UI/UX Designer' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: 'Design interface and create user experience flows' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: 'Alex Johnson' }] },
                            ]
                        },
                        {
                            type: 'tableRow',
                            content: [
                                { type: 'tableCell', content: [{ type: 'text', text: 'Frontend Developer' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: 'Implement designs and interact with backend APIs' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: 'Maria Garcia' }] },
                            ]
                        },
                        {
                            type: 'tableRow',
                            content: [
                                { type: 'tableCell', content: [{ type: 'text', text: 'Backend Developer' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: 'Develop server, database, and application logic' }] },
                                { type: 'tableCell', content: [{ type: 'text', text: 'Chen Wei' }] },
                            ]
                        },

                    ]
                },
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: "...." }
                    ]
                },
            ]
        }
    }

    // Additional blocks as needed
];


const SortableItem = ({ id, type, content, onHeaderChange, orderNumber, isEditing }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const editor = useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            BulletList,
            ListItem,
            Heading,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content,
        editable: true,
    });



    return (
        <div
            ref={setNodeRef}
            style={{
                transform: `translate3d(${transform ? transform.x : 0}px, ${transform ? transform.y : 0}px, 0)`, // Use translate3d for better performance
                transition,
                position: 'relative',
                zIndex: isDragging ? 10 : 2,
            }}
            className={`bg-white p-4 mb-4 rounded shadow hover:ring-2 ring-blue-500 ${isDragging ? 'shadow-2xl ring-2 ring-green-500' : 'hover:shadow-md'
                } `}
        >
            <div className={`flex items-center space-x-2`}>
                <div {...listeners} {...attributes} className="cursor-grab">
                    <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                    </svg>
                </div>
                <div className="flex-1 flex items-center space-x-2">
                    <span className="font-semibold text-lg">{orderNumber || 0}.</span>
                    <input
                        type="text"
                        value={type}
                        onChange={(e) => onHeaderChange(id, e.target.value)}
                        className={`font-semibold text-lg flex-1 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 outline-none transition duration-150 ease-in-out ${isEditing ? 'border-blue-500' : ''
                            }`}
                        placeholder="Enter section title"
                    />
                </div>
            </div>
            <div className={`p-2 ${isDragging ? ' hidden' : ''}`} >
                {editor && <EditorContent editor={editor} className="ProseMirror ring-0 focus:ring-0" />}
            </div>
        </div >
    );
};

const App = () => {
    const [blocks, setBlocks] = useState(initialBlocks.sort((a, b) => a.orderNumber - b.orderNumber));
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const handleHeaderChange = (_, newValue: any, index: number) => {
        setBlocks(blocks.map((block, i) => {
            if (i === index) {
                return { ...block, type: newValue };
            }
            return block;
        }));
    };


    const onDragEnd = (event: { active: any; over: any; }) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setBlocks((currentBlocks) => {
                const oldIndex = currentBlocks.findIndex(block => block.id === active.id);
                const newIndex = currentBlocks.findIndex(block => block.id === over.id);
                const updatedBlocks = arrayMove(currentBlocks, oldIndex, newIndex);

                // Update the order numbers after reordering
                return updatedBlocks.map((block: any, index) => ({ ...block, orderNumber: index + 1 }));
            });
        }
    };

    return (
        <div className="flex h-svh">
            {/* Left Sidebar */}
            <div className="w-1/4 bg-gray-100 p-4">
                <div className="animate-pulse">
                    <div className="bg-gray-300 h-4 mb-4 rounded"></div>
                    <div className="bg-gray-300 h-4 mb-4 rounded"></div>
                    {/* More skeleton elements */}
                </div>
            </div>

            {/* Center Content - Draggable Area */}
            <div className="w-1/2 p-4">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {blocks.map((block, index) => (
                                <SortableItem
                                    key={block.id}
                                    id={block.id}
                                    orderNumber={block.orderNumber}
                                    type={block.type}
                                    content={block.content}
                                    onHeaderChange={(id: any, newValue: any) => handleHeaderChange(id, newValue, index)}
                                    isEditing={false}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Right Sidebar */}
            <div className="w-1/4 bg-gray-100 p-4">
                <div className="animate-pulse">
                    <div className="bg-gray-300 h-4 mb-4 rounded"></div>
                    <div className="bg-gray-300 h-4 mb-4 rounded"></div>
                    {/* More skeleton elements */}
                </div>
            </div>
        </div>
    );
};

export default App;
