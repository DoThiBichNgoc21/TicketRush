import supabase from '../config/supabase.js';

export const getAllTasks = async (request, response) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*');

        if (error) return response.status(400).json({ error: error.message });
        response.status(200).json(data);
    } catch (err) {
        response.status(500).json({ error: "Lỗi server nội bộ" });
    }
};

export const createTask = async (request, response) => {
    try {
        const { name, is_completed } = request.body;
        const { data, error } = await supabase
            .from('users')
            .insert([{ name, is_completed }])
            .select();

        if (error) return response.status(400).json({ error: error.message });
        response.status(201).json({ message: "Đã thêm thành công", data });
    } catch (err) {
        response.status(500).json({ error: "Lỗi server nội bộ" });
    }
};

export const updateTask = async (request, response) => {
    try {
        const { id } = request.params;
        const { name, is_completed } = request.body;
        const { data, error } = await supabase
            .from('users')
            .update({ name, is_completed })
            .eq('id', id)
            .select();

        if (error) return response.status(400).json({ error: error.message });
        response.status(200).json({ message: "Đã update thành công", data });
    } catch (err) {
        response.status(500).json({ error: "Lỗi server nội bộ" });
    }
};

export const deleteTask = async (request, response) => {
    try {
        const { id } = request.params;
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) return response.status(400).json({ error: error.message });
        response.status(200).json({ message: "Đã xóa thành công" });
    } catch (err) {
        response.status(500).json({ error: "Lỗi server nội bộ" });
    }
};


