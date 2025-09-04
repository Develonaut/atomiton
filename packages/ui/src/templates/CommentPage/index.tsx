import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import CommentCursor from "@/components/CommentCursor";
import CommentPin from "@/components/CommentPin";
import NewComment from "@/components/NewComment";
import Comment from "@/components/Comment";

const HomePage = () => {
  return (
    <Layout title="Comment">
      <Group title="Comment cursor, pin">
        <RowCards>
          <Card className="h-50" title="Point" span={4} center>
            <CommentCursor />
          </Card>
          <Card className="h-50" title="Pinned" span={4} center>
            <CommentCursor pinned />
          </Card>
          <Card className="h-50" title="Uploading" span={4} center>
            <CommentCursor uploading />
          </Card>
          <Card className="h-50" title="Typing" span={4} center>
            <CommentCursor typing />
          </Card>
          <Card className="h-50" title="Conversation" span={4} center>
            <CommentPin
              avatars={["/images/avatars/3.png", "/images/avatars/6.png"]}
              isRead
            />
          </Card>
          <Card className="h-50" title="Single comment" span={4} center>
            <CommentPin avatars={["/images/avatars/3.png"]} />
          </Card>
        </RowCards>
      </Group>
      <Group title="Comment Popup">
        <RowCards>
          <Card
            className="h-70"
            title="Add comment, Typing, Image uploaded, File uploaded, Upload image"
            center
          >
            <NewComment />
          </Card>
          <Card className="h-110" title="Single comment" span={2} center>
            <Comment
              comments={[
                {
                  name: "Luna Starfield ✪",
                  content: (
                    <>
                      I love this bag, it looks great. Could you make it with
                      leather material? 🤔
                    </>
                  ),
                  time: "2s",
                  avatar: "/images/avatars/3.png",
                },
              ]}
            />
          </Card>
          <Card className="h-110" title="Conversation" span={2} center>
            <Comment
              isRead
              comments={[
                {
                  name: "Luna Starfield ✪",
                  content: (
                    <>
                      I love this bag, it looks great. Could you make it with
                      leather material? 🤔
                    </>
                  ),
                  time: "2s",
                  avatar: "/images/avatars/3.png",
                },
                {
                  name: "Sam",
                  content: (
                    <>
                      <span>@Luna</span> Thank, I’m working on it
                    </>
                  ),
                  time: "1s",
                  avatar: "/images/avatars/6.png",
                },
              ]}
            />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default HomePage;
