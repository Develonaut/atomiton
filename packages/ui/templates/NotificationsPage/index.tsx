"use client";

import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";
import Notification from "@/components/Notification";
import Notifications from "@/components/Notifications";

const MenuPage = () => {
  return (
    <Layout title="Notifications">
      <Group title="Variations">
        <RowCards>
          <Card className="h-63" title="Comment" span={2} center>
            <div className="w-96.5">
              <Notification
                item={{
                  id: 0,
                  title: "Randomdash",
                  time: "1h ago",
                  type: "comment",
                  avatar: "/images/avatars/3.png",
                  details: "Classic Car in Studio",
                  content:
                    "These draggabale sliders look really cool. Maybe these could be displayed when you hold shift, to rotate exactly on the X or Y. But by default I don't think we need these controllers, you could just rotate the object by clicking and dragging anywhere as expected on any 3D tool (theoretically).",
                  new: true,
                }}
              />
            </div>
          </Card>
          <Card className="h-63" title="Image generated" span={2} center>
            <div className="w-96.5">
              <Notification
                item={{
                  id: 1,
                  title: "Cute Turtle is generated",
                  time: "2h ago",
                  type: "image",
                  avatar: "/images/avatars/1.png",
                  details: "Matte texture - UI8 Style",
                  content: "Prompt: Create 3D character dancing",
                  new: true,
                }}
              />
            </div>
          </Card>
          <Card className="h-63" title="Invite" span={2} center>
            <div className="w-96.5">
              <Notification
                item={{
                  id: 2,
                  title: "3D object is generated",
                  time: "4h ago",
                  type: "invite",
                  avatar: "/images/avatars/4.png",
                  details: "Minimalist Architecture Scene",
                  new: true,
                }}
              />
            </div>
          </Card>
          <Card className="h-63" title="Like" span={2} center>
            <div className="w-96.5">
              <Notification
                item={{
                  id: 3,
                  title: "Marina",
                  time: "10h ago",
                  type: "like",
                  avatar: "/images/avatars/5.png",
                  details: "Classic Car in Studio",
                  new: false,
                }}
              />
            </div>
          </Card>
          <Card className="h-63" title="Video generated" span={2} center>
            <div className="w-96.5">
              <Notification
                item={{
                  id: 5,
                  title: "Animation is generated",
                  time: "1d ago",
                  type: "video",
                  avatar: "/images/avatars/1.png",
                  details: "12s – 720p",
                  content: "Prompt: Create 3D character dancing",
                  new: false,
                }}
              />
            </div>
          </Card>
        </RowCards>
      </Group>
      <Group title="Notification Dropdown">
        <RowCards>
          <Card
            className="py-38 bg-[#F8F7F7]"
            title="Notifications"
            centerHorizontal
          >
            <Notifications className="w-96 h-200 flex flex-col bg-[#FCFCFC] border border-[#ECECEC] rounded-[1.25rem] shadow-2xl" />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default MenuPage;
