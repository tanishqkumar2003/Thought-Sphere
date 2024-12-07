import axios from "axios";
import { useState } from "react"; // Import useState
import { Blog } from "../hooks/useBlogHook";
import { Appbar } from "./Appbar";
import { BACKEND_URL } from "@/config";
import { useNavigate, useParams } from "react-router-dom";

export const BlogView = ({ blog }: { blog: Blog }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const handleEdit = () => {
    alert("Edit section is under development and will be available soon");
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        data: {
          email: localStorage.getItem("username"),
        },
      });
      alert("Blog post deleted successfully.");

      navigate("/edit");
    } catch (error: any) {
      console.error("Error deleting blog:", error);
      alert(
        `Failed to delete blog: ${
          error.response?.data?.message || "An unexpected error occurred"
        }`
      );
    }
  };

  const handleSummarizeClick = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog/summarize`,
        {
          prompt: blog.content,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      if (response?.data) {
        setSummary(response.data.content);
        console.log("AI Response:", response);
      } else {
        console.warn("No data received from AI.");
      }
    } catch (e) {
      alert("Error while fetching data from AI. Please try again later.");
      console.error("Error during API call:", e);
    }
        setShowModal(true); 
  };
  

  const closeModal = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen">
      <Appbar />
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-2xl transition-transform hover:-translate-y-1 hover:shadow-lg duration-300 relative">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
          <div className="font-bold text-3xl text-gray-800 mb-2">
            {blog.title}
          </div>
          <button
            onClick={handleSummarizeClick}
            className="shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Summarize with AI
            </span>
          </button>
        </div>

        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-end">
            <div className="relative inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full shadow-md">
              <span className="text-gray-800 font-semibold text-lg">
                {blog.author.name ? blog.author.name[0].toUpperCase() : "A"}
              </span>
            </div>
            <div className="ml-4">
              <p className="text-gray-800 font-semibold">
                {blog.author.name || "Anonymous"}
              </p>
              <p className="text-sm text-gray-500">Author</p>
            </div>
            <button
              type="button"
              className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-3"
            >
              Join Community
            </button>
          </div>
        </div>

        {localStorage.getItem("name") === blog.author.name && (
          <div className="absolute left-8 bottom-8 flex space-x-4">
            <button
              onClick={handleEdit}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow-lg transition"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-lg transition"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Modal Component */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl text-center">
            <h2 className="text-2xl font-semibold mb-4">AI Summary</h2>
            <p className="text-gray-600 mb-4">
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: summary }}
              ></div>
            </p>
            <button
              onClick={closeModal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// import axios from "axios";
// import { Blog } from "../hooks/useBlogHook";
// import { Appbar } from "./Appbar";
// import { BACKEND_URL } from "@/config";
// import { useNavigate, useParams } from "react-router-dom";

// export const BlogView = ({ blog }: { blog: Blog }) => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
// const handleEdit = () => {
//     alert("Edit section is under development and will be available soon");
//   };

//   const handleDelete = async () => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this post?"
//     );
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
//         headers: {
//           Authorization: "Bearer " + localStorage.getItem("token"),
//         },
//         data: {
//           email: localStorage.getItem("username"),
//         },
//       });
//       alert("Blog post deleted successfully.");

//       navigate("/edit");
//     } catch (error: any) {
//       console.error("Error deleting blog:", error);
//       alert(
//         `Failed to delete blog: ${
//           error.response?.data?.message || "An unexpected error occurred"
//         }`
//       );
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-gray-100 to-gray-300 min-h-screen">
//       <Appbar />
//       <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-2xl transition-transform hover:-translate-y-1 hover:shadow-lg duration-300 relative">
//         <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-200">
//           <div className="font-bold text-3xl text-gray-800 mb-2">
//             {blog.title}
//           </div>
//           <button className="shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
//             <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
//               Summarize with AI
//             </span>
//           </button>
//         </div>

//         <div
//           className="prose"
//           dangerouslySetInnerHTML={{ __html: blog.content }}
//         ></div>

//         <div className="border-t border-gray-200 pt-6">
//           <div className="flex items-center justify-end">
//             <div className="relative inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full shadow-md">
//               <span className="text-gray-800 font-semibold text-lg">
//                 {blog.author.name ? blog.author.name[0].toUpperCase() : "A"}
//               </span>
//             </div>
//             <div className="ml-4">
//               <p className="text-gray-800 font-semibold">
//                 {blog.author.name || "Anonymous"}
//               </p>
//               <p className="text-sm text-gray-500">Author</p>
//             </div>
//             <button
//               type="button"
//               className="text-white bg-gradient-to-br from-green-400 to-blue-600 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 ml-3"
//             >
//               Join Community
//             </button>
//           </div>
//         </div>

//         {localStorage.getItem("name") === blog.author.name && (
//           <div className="absolute left-8 bottom-8 flex space-x-4">
//             <button
//               onClick={handleEdit}
//               className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 shadow-lg transition"
//             >
//               Edit
//             </button>
//             <button
//               onClick={handleDelete}
//               className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 shadow-lg transition"
//             >
//               Delete
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
