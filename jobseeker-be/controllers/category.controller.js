const supabase = require("../config/connectDB");
const { serverErrorMessageRes } = require("../helpers/serverErrorMessage");

// GET /category — public get all categories
const getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("jobcategory")
      .select("*")
      .order("name", { ascending: true });

    if (error) return serverErrorMessageRes(res, error);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// POST /category — admin only create category
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required!",
      });
    }

    const { data, error } = await supabase
      .from("jobcategory")
      .insert({ name, description })
      .select()
      .single();

    if (error) return serverErrorMessageRes(res, error);

    return res.status(201).json({
      success: true,
      message: "Category created successfully!",
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// PUT /category/:id — admin only update category
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from("jobcategory")
      .update({ name, description })
      .eq("id", id)
      .select()
      .single();

    if (error) return serverErrorMessageRes(res, error);

    return res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      data,
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

// DELETE /category/:id — admin only delete category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("jobcategory")
      .delete()
      .eq("id", id);

    if (error) return serverErrorMessageRes(res, error);

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully!",
    });
  } catch (error) {
    serverErrorMessageRes(res, error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
