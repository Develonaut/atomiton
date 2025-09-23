import Icon from "#components/Icon";
import Item from "./Item";

function Settings() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center h-6 mb-4">
        <div className="text-body-md-str">Export images</div>
        <button className="btn-icon size-6">
          <Icon className="!size-4" name="plus" />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Item defaultSize={0} />
        <Item defaultSize={1} />
      </div>
    </div>
  );
}

export default Settings;
