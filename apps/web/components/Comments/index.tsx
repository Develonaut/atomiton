import { useState, useEffect } from "react";
import NewComment from "./NewComment";
import Comment from "./Comment";

const Comments = () => {
  const [newComment, setNewComment] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isReserve, setIsReserve] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && newComment) {
        setNewComment(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [newComment]);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".new-comment")) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let top = e.clientY - rect.top;
    let left = e.clientX - rect.left;

    const commentWidth = 328;
    const commentHeight = 120;

    if (left + commentWidth > rect.width) {
      left = rect.width - commentWidth - 40;
      setIsReserve(true);
    } else {
      setIsReserve(false);
    }

    if (top + commentHeight > rect.height) {
      top = rect.height - commentHeight - 10;
    }

    left = Math.max(10, left);
    top = Math.max(10, top);

    setNewComment({ top, left });
  };

  const handleCloseNewComment = () => {
    setNewComment(null);
  };

  const handleSubmitComment = (comment: string) => {
    console.log("New comment:", comment);
  };

  return (
    <>
      {/* <div className="fixed top-0 left-0 right-0 bottom-0 z-19 bg-black/50" /> */}
      <div
        className={`comments fixed top-18 left-66 right-66 bottom-36 z-3 ${
          newComment ? "z-20" : ""
        }`}
        onClick={handleClick}
      >
        {newComment && (
          <NewComment
            top={newComment.top}
            left={newComment.left}
            onClose={handleCloseNewComment}
            onSubmit={handleSubmitComment}
            reserve={isReserve}
          />
        )}
        <Comment isRead={false} />
      </div>
    </>
  );
};

export default Comments;
