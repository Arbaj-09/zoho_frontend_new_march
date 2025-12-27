export default function Topbar({ tabs, activeTabKey, onTabClick }) {
  return (
    <div className="border-b bg-white px-6">
      <div className="flex gap-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabClick(tab)}
            className={`py-3 text-sm font-medium border-b-2 transition
              ${
                activeTabKey === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
