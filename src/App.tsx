import FlexibleScreen from './components/FlexibleScreen'

export default function App() {
  return (
    <div className="h-screen w-screen">
      <FlexibleScreen
        storageKey="flexible-screen-layout"
        minTopPct={20}
        minBottomPct={20}
        minLeftPct={15}
        minRightPct={15}
        initial={{ topPct: 70, leftPct: 50 }}
        renderTopLeft={() => (
          <div className="h-full w-full flex items-center justify-center text-neutral-700 text-xl">
            component 1
          </div>
        )}
        renderTopRight={() => (
          <div className="h-full w-full flex items-center justify-center text-neutral-700 text-xl">
            component 2
          </div>
        )}
        renderBottom={() => (
          <div className="h-full w-full flex items-center justify-center text-neutral-700 text-xl">
            component 3
          </div>
        )}
      />
    </div>
  )
}