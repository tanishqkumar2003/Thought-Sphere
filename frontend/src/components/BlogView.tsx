import axios from "axios";
import { useState } from "react";
import { Blog } from "../hooks/useBlogHook";
import { Appbar } from "./Appbar";
import { BACKEND_URL } from "@/config";
import { useNavigate, useParams } from "react-router-dom";

export const BlogView = ({ blog }: { blog: Blog }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string>("");

  const handleEdit = async () => {
    if (title === "") setTitle(blog.title);
    setLoading(true);
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/blog/update/${id}`,
        {
          title,
          published: !isDraft,
          username: localStorage.getItem("username"),
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      navigate("/myblogs");
    } catch (e) {
      alert("Error while updating blog. Please try again later.");
    }
    setLoading(false);
    setEditModal(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        data: { email: localStorage.getItem("username") },
      });
      alert("Blog post deleted successfully.");
      navigate("/myblogs");
    } catch (e) {
      alert("Error while deleting blog.");
    }
  };

  const handleSummarizeClick = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog/summarize`,
        { prompt: blog.content },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setSummary(response?.data?.content || "No summary available.");
    } catch (e) {
      alert("Error while summarizing blog.");
    }
    setLoading(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditModal(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen">
      <Appbar />
      <div className="max-w-3xl mx-auto mt-6 p-4 md:p-8 bg-white rounded-xl shadow-2xl hover:shadow-lg transition duration-300 relative">
        {/* Blog Title */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <h1 className="font-bold text-2xl md:text-3xl text-gray-800 mb-4 md:mb-0">
            {blog.title}
          </h1>
          <button
            onClick={handleSummarizeClick}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition shadow-md"
          >
            {loading ? "Summarizing..." : "Summarize with AI"}
          </button>
        </div>

        {/* Blog Content */}
        <div
          className="prose max-w-full text-gray-700"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>

        {/* Author Info and Community Button */}
        <div className="mt-6 flex items-center justify-between border-t pt-6 border-gray-200 flex-wrap">
          {/* Author Info */}
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">
                {blog.author.name?.[0]?.toUpperCase() || "A"}
              </span>
            </div>
            {/* Author Name */}
            <div className="text-gray-800">
              <p className="font-semibold">{blog.author.name || "Anonymous"}</p>
              <p className="text-sm text-gray-500">Author</p>
            </div>
          </div>

          {/* Join Community Button */}
          {localStorage.getItem("name") !== blog.author.name && (
            <button
              onClick={() =>
                alert(
                  "Community section is under development and will be available soon!"
                )
              }
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition mt-4 md:mt-0"
            >
              Join Community
            </button>
          )}
        </div>

        {/* Edit and Delete Buttons */}
        {localStorage.getItem("name") === blog.author.name && (
          <div className="flex space-x-4 mt-6">
            <button
              onClick={() => setEditModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              AI Summary
            </h2>
            <div
              className="prose max-w-full text-gray-700"
              dangerouslySetInnerHTML={{ __html: summary }}
            ></div>
            <button
              onClick={closeModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg block mx-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Edit Blog
            </h2>
            <textarea
              placeholder="Edit title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-lg mb-6 focus:ring-2 focus:ring-blue-400"
              rows={3}
            ></textarea>
            <div className="flex justify-between">
              <button
                onClick={() => setIsDraft(!isDraft)}
                className={`px-4 py-2 rounded-lg ${
                  isDraft ? "bg-yellow-500" : "bg-green-500"
                } text-white`}
              >
                {isDraft ? "Publish" : "Draft"}
              </button>
              <div className="space-x-4">
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  {loading ? "Editing..." : "Save"}
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
