import { Icon, styled } from "@atomiton/ui";

export const NodeContainer = styled("div", {
  name: "NodeContainer",
})(
  "relative w-20 h-20 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-200",
  {
    variants: {
      selected: {
        true: "",
        false: "",
      },
    },
  },
);

export const InnerContent = styled("div", {
  name: "InnerContent",
})("bg-white rounded-lg relative flex items-center justify-center");

export const StyledIcon = styled(Icon, {
  name: "StyledIcon",
})("transition-colors duration-200", {
  variants: {
    selected: {
      true: "text-gray-700",
      false: "text-gray-500",
    },
  },
});

export const getContainerStyle = (selected: boolean) => ({
  background: "#fafafa",
  border: selected
    ? "1px solid rgba(0, 0, 0, 0.2)"
    : "1px solid rgba(0, 0, 0, 0.08)",
  boxShadow: selected
    ? "0 2px 8px -2px rgba(0, 0, 0, 0.12), 0 1px 3px -1px rgba(0, 0, 0, 0.08)"
    : "none",
});

export const getInnerStyle = () => ({
  width: "calc(100% - 6px)",
  height: "calc(100% - 6px)",
  margin: "3px",
});

export const getHandleStyle = (selected: boolean) => ({
  background: selected ? "#6b7280" : "#d1d5db",
  width: 12,
  height: 12,
  border: "2px solid #fafafa",
  borderRadius: "50%",
  transition: "all 0.2s ease",
  zIndex: 10,
});
