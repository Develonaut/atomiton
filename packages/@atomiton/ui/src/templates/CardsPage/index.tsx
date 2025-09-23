import Image from "#components/Image";
import Layout from "#components/Layout";
import Group from "#components/Group";
import RowCards from "#components/RowCards";
import Card from "#components/Card";
import PriceCard from "#components/PriceCard";
import AssetCard from "#components/AssetCard";
import SceneCard from "#components/SceneCard";
import SceneCardSkeleton from "#components/SceneCardSkeleton";
import ExploreCardSm from "#components/ExploreCardSm";
import ExploreCard from "#components/ExploreCard";
import AssetItem from "#components/AssetItem";

function CardsPage() {
  return (
    <Layout title="Cards">
      <Group title="Pricing card">
        <RowCards>
          <Card className="h-150" title="Free" span={3} center>
            <PriceCard
              item={{
                title: "Free",
                description:
                  "Perfect for hobbyists, students, or early-stage creators.",
                price: "0",
                features: [
                  "Access to a basic asset library",
                  "15-second video animation",
                  "Generate up to 10 scenes/month",
                  "Watermarked exports",
                  "Try basic AI prompts",
                ],
              }}
            />
          </Card>
          <Card className="h-150" title="Studio" span={3} center>
            <PriceCard
              item={{
                title: "Studio",
                description: "For teams and studios that need power, speed.",
                price: "40",
                features: [
                  "Everything in Creator",
                  "Unlimited 3D scene generation",
                  "Full access to premium asset library",
                  "Animations up to 60 seconds",
                  "Unlimited Video AI models",
                ],
              }}
            />
          </Card>
          <Card className="h-150" title="Creator" span={3} center>
            <PriceCard
              item={{
                title: "Creator",
                description:
                  "For indie creators, and startups who need high-quality output",
                price: "20",
                features: [
                  "Everything in Free",
                  "Unlimited 3D scene generation",
                  "Premium asset library access",
                  "Animations up to 30 seconds",
                  "20+ Video AI models",
                ],
              }}
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Slide item">
        <RowCards>
          <Card className="h-50" title="Default, Hover" span={2} center>
            <div className="border border-[#ECECEC] bg-[#F8F7F7] rounded-xl overflow-hidden transition-colors cursor-pointer hover:border-[#E2E2E2] hover:bg-[#FCFCFC]">
              <Image
                src="/images/3d-objects/8.png"
                width={50}
                height={50}
                alt=""
              />
            </div>
          </Card>
          <Card className="h-50" title="Active" span={2} center>
            <div className="border border-[#ECECEC] bg-[#FCFCFC] rounded-xl overflow-hidden cursor-pointer transition-colors shadow-[0px_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)]">
              <Image
                src="/images/3d-objects/8.png"
                width={50}
                height={50}
                alt=""
              />
            </div>
          </Card>
        </RowCards>
      </Group>
      <Group title="Asset">
        <RowCards>
          <Card className="h-100" title="Default, Hover" center>
            <AssetCard image="/images/3d-objects/6.png" />
          </Card>
        </RowCards>
      </Group>
      <Group title="Asset">
        <RowCards>
          <Card className="h-120" title="Default, Hover" span={2} center>
            <SceneCard
              value={{
                title: "Futuristic Humanoid Robot",
                category: "Untitled Folder",
                image: "/images/scenes/2.jpg",
                type: "image",
              }}
            />
          </Card>
          <Card className="h-120" title="Skeleton" span={2} center>
            <SceneCardSkeleton />
          </Card>
        </RowCards>
      </Group>
      <Group title="Explore tags">
        <RowCards>
          <Card className="h-59" title="Default, Hover" center>
            <ExploreCardSm
              value={{
                title: "Product Design",
                description: "Minimalist, soft",
                images: "/images/effects/2.png",
              }}
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Explore tags">
        <RowCards>
          <Card className="h-120" title="Default, Hover" center>
            <ExploreCard
              value={{
                title: "Tran Mau Tri Tam ✪",
                image: "/images/gallery/3.jpg",
              }}
            />
          </Card>
        </RowCards>
      </Group>
      <Group title="Asset">
        <RowCards>
          <Card
            className="aspect-square max-[1023px]:aspect-[1.8]"
            title="Ratio"
            span={3}
            center
          >
            <div className="flex justify-center items-center size-15 rounded-[0.625rem] bg-[#F1F1F1] border border-[#ECECEC] text-[0.75rem] leading-[1rem] font-medium text-[#7B7B7B]">
              3:4
            </div>
          </Card>
          <Card
            className="aspect-square max-[1023px]:aspect-[1.8]"
            title="Material, Add"
            span={3}
            center
          >
            <AssetItem
              value={{
                image: "/images/materials/5.png",
                fullSizeImage: false,
              }}
            />
          </Card>
          <Card
            className="aspect-square max-[1023px]:aspect-[1.8]"
            title="Style, Add"
            span={3}
            center
          >
            <AssetItem
              value={{
                image: "/images/effects/2.png",
                fullSizeImage: true,
              }}
            />
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
}

export default CardsPage;
