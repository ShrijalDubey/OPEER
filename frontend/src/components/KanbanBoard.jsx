
import React, { useState, useEffect } from 'react';
import styles from './KanbanBoard.module.css';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const COLUMNS = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    done: 'Done'
};

const KanbanBoard = ({ projectId }) => {
    const { user } = useAuth();
    const toast = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggingId, setDraggingId] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTaskStatus, setNewTaskStatus] = useState('todo'); // For default column
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch(`/api/projects/${projectId}/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTasks(data.tasks || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Drag and Drop Handlers
    const onDragStart = (e, taskId) => {
        setDraggingId(taskId);
        e.dataTransfer.setData('taskId', taskId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const onDrop = async (e, status) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');

        if (!taskId) return;

        // Optimistic Update
        const originalTasks = [...tasks];
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        if (tasks[taskIndex].status === status) return; // No change

        const newTasks = [...tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], status };
        setTasks(newTasks);
        setDraggingId(null);

        // API Call
        try {
            const token = localStorage.getItem('opeer_token');
            const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                throw new Error('Failed to move');
            }
        } catch (err) {
            toast.error('Failed to move task');
            setTasks(originalTasks); // Revert
        }
    };

    // CRUD Handlers
    const handleSaveTask = async () => {
        if (!formData.title.trim()) return;

        try {
            const token = localStorage.getItem('opeer_token');
            const url = editingTask
                ? `/api/projects/${projectId}/tasks/${editingTask.id}`
                : `/api/projects/${projectId}/tasks`;

            const method = editingTask ? 'PATCH' : 'POST';
            const body = {
                ...formData,
                status: editingTask ? formData.status : newTaskStatus
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                if (editingTask) {
                    setTasks(prev => prev.map(t => t.id === editingTask.id ? data.task : t));
                    toast.success('Task updated');
                } else {
                    setTasks(prev => [data.task, ...prev]);
                    toast.success('Task created');
                }
                closeModal();
            } else {
                toast.error('Failed to save task');
            }
        } catch (err) {
            toast.error('Something went wrong');
        }
    };

    const handleDelete = async (taskId) => {
        if (!await toast.confirm('Delete this task?')) return;

        try {
            const token = localStorage.getItem('opeer_token');
            await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(prev => prev.filter(t => t.id !== taskId));
            toast.success('Task deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const openModal = (task = null, status = 'todo') => {
        if (task) {
            setEditingTask(task);
            setFormData({ title: task.title, description: task.description || '', priority: task.priority });
        } else {
            setEditingTask(null);
            setNewTaskStatus(status);
            setFormData({ title: '', description: '', priority: 'medium' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };

    return (
        <>
            <div className={styles.boardContainer}>
                {Object.entries(COLUMNS).map(([status, label]) => (
                    <div
                        key={status}
                        className={styles.column}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, status)}
                    >
                        <div className={styles.columnHeader}>
                            <div className={styles.columnTitle}>
                                {label}
                                <span className={styles.columnCount}>
                                    {tasks.filter(t => t.status === status).length}
                                </span>
                            </div>
                            <button
                                className={styles.actionBtn}
                                onClick={() => openModal(null, status)}
                            >
                                +
                            </button>
                        </div>

                        <div className={styles.taskList}>
                            {tasks
                                .filter(t => t.status === status)
                                .map(task => (
                                    <div
                                        key={task.id}
                                        className={styles.taskCard}
                                        draggable
                                        onDragStart={(e) => onDragStart(e, task.id)}
                                        onClick={() => openModal(task)}
                                    >
                                        <div className={styles.taskHeader}>
                                            <span className={`${styles.taskPriority} ${styles[`priority-${task.priority}`]}`}>
                                                {task.priority}
                                            </span>
                                            <button
                                                className={`${styles.actionBtn} ${styles.taskActions}`}
                                                onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className={styles.taskTitle}>{task.title}</div>
                                        {task.assignee && (
                                            <div className={styles.taskFooter}>
                                                <div className={styles.assignee} title={task.assignee.name}>
                                                    {task.assignee.avatarUrl ? (
                                                        <img src={task.assignee.avatarUrl} alt="" style={{ width: '100%', height: '100%' }} />
                                                    ) : (
                                                        task.assignee.name[0].toUpperCase()
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            <button className={styles.addTaskBtn} onClick={() => openModal(null, status)}>
                                + Add Task
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 style={{ color: '#fff', marginBottom: '20px' }}>
                            {editingTask ? 'Edit Task' : 'New Task'}
                        </h2>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Title</label>
                            <input
                                className={styles.input}
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Description</label>
                            <textarea
                                className={styles.textarea}
                                rows={3}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Priority</label>
                            <select
                                className={styles.select}
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSaveTask}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KanbanBoard;
