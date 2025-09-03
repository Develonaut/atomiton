import Icon from "@/components/Icon";

type Props = {
  title: string;
  rightContent?: React.ReactNode;
  withoutAddButton?: boolean;
  children?: React.ReactNode;
};

const Group = ({ title, rightContent, withoutAddButton, children }: Props) => (
  <div className="border-t border-s-01 first:border-t-0">
    <div className="flex justify-between items-center min-h-12 px-4 py-3 text-body-md-str">
      {title}
      {rightContent ? (
        rightContent
      ) : withoutAddButton ? null : (
        <button className="btn-icon shrink-0 size-6">
          <Icon className="!size-4" name="plus" />
        </button>
      )}
    </div>
    {children && <div className="p-4 pt-0">{children}</div>}
  </div>
);

export default Group;
