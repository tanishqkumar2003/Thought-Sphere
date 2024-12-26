import { Link } from "react-router-dom";
import { Aavtar } from "./Avatar";

interface BlogCardProps {
  id: number;
  authorName: string;
  title: string;
  content: string;
  publishedDate: string;
  imageUrl?: string;
}

export const BlogCard = ({
  id,
  authorName,
  title,
  content,
  publishedDate,
}: BlogCardProps) => {
  return (
    <Link to={`/blog/${id}`}>
      <div className="bg-slate-50 shadow-lg rounded-lg p-6 mb-4 border border-gray-200 flex flex-col md:flex-row">
        <div className="md:w-2/3 md:ml-6">
          <div className="flex items-center mb-4 text-sm text-gray-600">
            <Aavtar name={authorName} />
            <span className="ml-2 font-medium">{authorName}</span>
            <span className="mx-2">·</span>
            <span>{publishedDate}</span>
          </div>

          <div className="font-bold text-2xl text-gray-800 mb-2">{title}</div>

          <div
            className="text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ __html: content.slice(0, 200) + "..." }}
          ></div>

          <div className="text-gray-500 text-sm mb-4">{`${Math.ceil(
            content.length / 109000
          )} minutes read`}</div>
        </div>

        {/* <div className="text-gray-500 text-sm mb-4">
          {published ? "Published" : "Draft"}{" "}
        </div> */}
      </div>
    </Link>
  );
};
