import { Icon } from "@iconify/react";

export const ParticipantsDrawer = ({
  setShowParticipantsPanel,
}: {
  setShowParticipantsPanel: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="drawer-side z-50">
      <label
        htmlFor="participants-drawer"
        aria-label="close sidebar"
        className="drawer-overlay"
        onClick={() => setShowParticipantsPanel(false)}
      />

      <div className="menu p-4 w-80 min-h-full bg-base-100 text-base-content border-l border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Participants</h3>
          <button
            onClick={() => setShowParticipantsPanel(false)}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <Icon icon="lineicons:close" className="w-5 h-5" />
          </button>
        </div>

        {/* Empty panel - user will add API calls here */}
        <div className="text-center text-base-content/70 py-8">
          <Icon
            icon="lineicons:users"
            className="w-12 h-12 mx-auto mb-4 opacity-50"
          />
          <p>Participants list will appear here</p>
        </div>
      </div>
    </div>
  );
};
